const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
    
    // Datos del Solicitante
    centerId: { type: String, required: true }, // Código centro
    centerName: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Usuario que la creó
    
    // Datos del Grupo
    groupName: { type: String, required: true }, // Ej: 4t ESO A
    studentCount: { type: Number, required: true },
    
    // Datos para la IA (Baremació)
    hasParticipatedLastYear: { type: Boolean, default: false },
    motivation: { type: String },
    
    // Estado del proceso
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected', 'done'], 
        default: 'pending' 
    },
    
    // Puntuación asignada por la IA
    score: { type: Number, default: 0 },
    iaReasoning: { type: String }, // Explicación de la IA
    
    requestedDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);