const { Workshop, WorkshopA, WorkshopB, WorkshopC } = require('../models/Workshop');
const PDFDocument = require('pdfkit');

exports.getAllWorkshops = async (req, res) => {
    try {
        // Devolvemos todos los talleres activos
        const workshops = await Workshop.find({ status: 'ACTIVE' });
        
        // Calculamos plazas disponibles en tiempo real
        const formatted = workshops.map(w => ({
            ...w.toObject(),
            availableSlots: w.maxCapacity - w.enrolledCount
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: 'Error carregant catàleg' });
    }
};

exports.createWorkshop = async (req, res) => {
    try {
        const payload = req.body;
        let newWorkshop;

        // FACTORÍA DE MODALIDADES (Polimorfismo Real)
        switch (payload.modality) {
            case 'A': // Fora del centre
                newWorkshop = new WorkshopA(payload);
                break;
            case 'B': // Dins del centre
                newWorkshop = new WorkshopB(payload);
                break;
            case 'C': // Ofici Compartit
                newWorkshop = new WorkshopC(payload);
                break;
            default:
                return res.status(400).json({ message: 'Modalitat desconeguda (Ha de ser A, B o C)' });
        }

        await newWorkshop.save();
        res.status(201).json(newWorkshop);
    } catch (error) {
        res.status(500).json({ message: 'Error creant taller', error: error.message });
    }
};

exports.downloadCatalogPdf = async (req, res) => {
    // Generación simple del PDF basada en los datos reales
    try {
        const workshops = await Workshop.find();
        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=cataleg_enginy_2026.pdf');
        doc.pipe(res);

        doc.fontSize(20).text('Catàleg de Tallers ENGINY', { align: 'center' });
        doc.moveDown();

        workshops.forEach(w => {
            doc.fontSize(14).fillColor('#003D5C').text(`[Modalitat ${w.modality}] ${w.title}`);
            doc.fontSize(10).fillColor('black').text(`Àmbit: ${w.scope} | Hores: ${w.totalHours}`);
            doc.text(w.description);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).send('Error PDF');
    }
};