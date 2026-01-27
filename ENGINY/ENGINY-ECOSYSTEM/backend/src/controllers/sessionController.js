const Session = require('../models/Session');
const Workshop = require('../models/Workshop');

// ============================================
// 1. CONSULTA DE SESIONES (Panel Docente)
// ============================================
exports.getMySessions = async (req, res) => {
    try {
        // Obtenemos el ID del profesor desde el token (req.user.id) o query
        const professorId = req.query.userId || req.user?.id; 

        if (!professorId) {
            return res.status(400).json({ message: "ID de professor necessari." });
        }
        
        // Buscamos sesiones donde el profesor esté asignado
const sessions = await Session.find({ professors: professorId })
    .populate('workshopId')
    .populate({
        path: 'requestId',
        select: 'centerName studentCount' // Así traemos el nombre del centro desde la Request
    })
    .sort({ date: 1 });

        res.json(sessions);
    } catch (error) {
        console.error("❌ Error en getMySessions:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// 2. POSTULACIÓN COMO ORIENTADOR
// ============================================
exports.applyAsOrientador = async (req, res) => {
  try {
    const { sessionId, professorId, professorName } = req.body;

    if (!sessionId || !professorId) {
        return res.status(400).json({ message: "Dades insuficients per a la postulació." });
    }

    // $addToSet evita que un profesor se postule dos veces a la misma sesión
    await Session.findByIdAndUpdate(sessionId, {
      $addToSet: { 
        candidates: { id: professorId, name: professorName } 
      }
    });

    console.log(`🙋 Profe ${professorName} s'ha postulat a la sessió ${sessionId}`);
    res.json({ message: "T'has postulat correctament! El centre revisarà el teu perfil." });
  } catch (error) {
    console.error("❌ Error en applyAsOrientador:", error);
    res.status(500).send("Error al postular-se.");
  }
};

// ============================================
// 3. GESTIÓN DE ASISTENCIA (Pasar lista)
// ============================================

exports.updateAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { students, status } = req.body; 
        
        // 'students' debe ser un array de objetos: [{ name: String, present: Boolean }]

        const session = await Session.findByIdAndUpdate(
            sessionId, 
            {
                students: students,
                status: status || 'COMPLETED', // Por defecto, al pasar lista la marcamos como completada
                updatedAt: Date.now()
            }, 
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: "Sessió no trobada." });
        }

        console.log(`📝 Assistència actualitzada per a la sessió: ${sessionId}`);
        res.json({ 
            message: "Assistència guardada correctament", 
            session 
        });
    } catch (error) {
        console.error("❌ Error en updateAttendance:", error);
        res.status(500).json({ error: error.message });
    }
};

// ============================================
// 4. OBTENER DETALLE DE UNA SESIÓN
// ============================================
exports.getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('workshopId')
            .populate('centerId');
            
        if (!session) return res.status(404).json({ message: "Sessió no trobada" });
        
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// ============================================
// 5. ASIGNACIÓN DE PROFESORES (Uso por el Centro)
// ============================================
exports.assignProfessorsToSession = async (req, res) => {
    try {
        const { sessionId, professorIds } = req.body; // professorIds es un Array de IDs

        // Actualizamos la sesión añadiendo los profesores elegidos por el centro
        const session = await Session.findByIdAndUpdate(
            sessionId,
            { $set: { professors: professorIds } }, // Sobrescribe o añade la lista de profes
            { new: true }
        );

        if (!session) return res.status(404).json({ message: "Sessió no trobada" });

        res.json({ message: "Professors assignats correctament", session });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener profesores que pertenecen al MISMO centro que el usuario logueado
exports.getCenterStaff = async (req, res) => {
    try {
        const staff = await User.find({ 
            centerId: req.user.centerId, 
            role: 'PROFESSOR' 
        }).select('name email');
        
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: "Error obtenint la plantilla" });
    }
};