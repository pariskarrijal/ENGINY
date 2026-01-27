const { Parser } = require('json2csv'); // <--- AÑADE ESTA LÍNEA
const Request = require('../models/Request');
const { Workshop } = require('../models/Workshop');
const Session = require('../models/Session');

// 1. CREAR SOLICITUD (Centro)
exports.createRequest = async (req, res) => {
    try {
        const { workshopId, groupName, numStudents, motivation, hasParticipatedLastYear } = req.body;
        
        // Datos extraídos del Token JWT
        const centerId = req.user.centerId;
        const centerName = req.user.name; // Usamos el nombre del usuario como nombre del centro
        const userId = req.user.id;

        // A. Validar Taller
        const workshop = await Workshop.findById(workshopId);
        if (!workshop) return res.status(404).json({ message: 'Taller no trobat' });

        // B. VALIDACIONES DE PLAZAS (Reglas PDF)
        const globalAvailable = workshop.maxCapacity - workshop.enrolledCount;
        
        if (numStudents > globalAvailable) {
            return res.status(400).json({ message: `No hi ha prous places. Disponibles: ${globalAvailable}` });
        }

        // Regla Modalidad C: Max 4 alumnos por centro
        if (workshop.modality === 'C') {
            if (numStudents > 4) {
                return res.status(400).json({ message: 'Modalitat C: Màxim 4 alumnes per centre.' });
            }
            // Revisar si ya tienen alumnos inscritos
            const existing = await Request.find({ workshopId, centerId, status: { $ne: 'rejected' } });
            const currentTotal = existing.reduce((sum, r) => sum + r.studentCount, 0);
            
            if (currentTotal + parseInt(numStudents) > 4) {
                return res.status(400).json({ message: `Ja teniu ${currentTotal} alumnes. Màxim 4 permesos.` });
            }
        }

        // C. Crear Objeto
        const newRequest = new Request({
            workshopId,
            centerId,
            centerName,
            userId,
            groupName,
            studentCount: numStudents,
            motivation,
            hasParticipatedLastYear,
            status: 'pending', // Siempre empieza pendiente de IA/Admin
            requestedDate: new Date()
        });

        await newRequest.save();

        // D. Actualizar Plazas (Atomic Update)
        await Workshop.findByIdAndUpdate(workshopId, { 
            $inc: { enrolledCount: numStudents } 
        });

        // E. Notificar (Socket.io)
        const io = req.app.get('socketio');
        if (io) {
            io.emit('notification', { 
                title: 'Nova Sol·licitud', 
                message: `El centre ${centerName} ha demanat plaça a ${workshop.title}`
            });
        }

        res.status(201).json(newRequest);

    } catch (error) {
        console.error("Error createRequest:", error);
        res.status(500).json({ message: 'Error processant la sol·licitud' });
    }
};

// 2. OBTENER SOLICITUDES DEL CENTRO (Historial propio)
exports.getCenterRequests = async (req, res) => {
    try {
        // Filtramos por el centerId del usuario logueado
        const requests = await Request.find({ centerId: req.user.centerId })
            .populate('workshopId', 'title modality') 
            .sort({ createdAt: -1 });
        
        // Formateo para frontend
        const formatted = requests.map(r => ({
            _id: r._id,
            workshopTitle: r.workshopId ? r.workshopId.title : 'Taller eliminat',
            workshopType: r.workshopId ? r.workshopId.modality : '-',
            date: r.requestedDate,
            status: r.status,
            score: r.score,
            iaReason: r.iaReasoning
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error recuperant dades' });
    }
};

// 3. ELIMINAR SOLICITUD (Centro)
exports.deleteRequest = async (req, res) => {
    try {
        const request = await Request.findOne({ _id: req.params.id, centerId: req.user.centerId });
        
        if (!request) return res.status(404).json({ message: 'Sol·licitud no trobada' });
        if (request.status === 'approved') return res.status(400).json({ message: 'No es pot esborrar una sol·licitud ja aprovada.' });

        // Devolver plazas al taller
        await Workshop.findByIdAndUpdate(request.workshopId, {
            $inc: { enrolledCount: -request.studentCount }
        });

        await Request.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sol·licitud eliminada correctament' });

    } catch (error) {
        res.status(500).json({ message: 'Error eliminant' });
    }
};

// 4. ADMIN: OBTENER TODAS (Para el Dashboard de Admin)
exports.getAllRequestsAdmin = async (req, res) => {
    try {
        // Sin filtros, traemos todo
        const requests = await Request.find()
            .populate('workshopId', 'title modality')
            .sort({ createdAt: -1 });

        const formatted = requests.map(r => ({
            _id: r._id,
            centerName: r.centerName || r.centerId,
            centerId: r.centerId,
            workshopId: r.workshopId, // Objeto completo para ver detalles
            studentCount: r.studentCount,
            score: r.score,
            status: r.status
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error admin requests' });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findById(req.params.id);

        if (!request) return res.status(404).json({ message: 'No trobada' });

        request.status = status;
        await request.save();

        if (status === 'approved') {
            const existingSession = await Session.findOne({ requestId: request._id });
            
            if (!existingSession) {
                const newSession = new Session({
                    requestId: request._id,
                    workshopId: request.workshopId,
                    // AQUÍ está la clave: Asignamos el profesor que creó la solicitud
                    // Si el Centro asigna a OTRO, deberías pasar ese ID en el body
                    professors: [request.userId], 
                    status: 'SCHEDULED',
                    date: request.requestedDate || new Date(),
                    location: request.centerName // Usamos el nombre del centro como ubicación inicial
                });
                await newSession.save();
            }
        }
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error' });
    }
};
// 2. AÑADE ESTA FUNCIÓN AL FINAL DEL ARCHIVO (Antes de que acabe)
exports.exportRequestsToCsv = async (req, res) => {
    try {
        const requests = await Request.find().populate('workshopId');

        const fields = [
            { label: 'ID Sol·licitud', value: '_id' },
            { label: 'Centre Educatiu', value: 'centerName' }, // Usamos centerName que es más legible
            { label: 'Taller', value: 'workshopId.title' },
            { label: 'Modalitat', value: 'workshopId.modality' },
            { label: 'Alumnes', value: 'studentCount' },
            { label: 'Estat', value: 'status' },
            { label: 'Puntuació IA', value: 'score' }
        ];

        // Aquí es donde fallaba porque Parser no estaba definido arriba
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(requests);

        res.header('Content-Type', 'text/csv');
        res.attachment('Informe_Solicituds_ENGINY.csv');
        
        return res.send(csv);

    } catch (error) {
        console.error("Error CSV:", error);
        res.status(500).json({ message: "Error generant CSV" });
    }
};