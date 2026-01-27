const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    name: String,
    dni: String,
    present: { type: Boolean, default: false }
});

const SessionSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' }, // Link a la solicitud aprobada
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop' },
    
    // Profesores asignados
    professors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    
    // Bolsa de candidatos (Profesores que se postulan)
    candidates: [{ 
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        appliedAt: { type: Date, default: Date.now }
    }],

    date: Date,
    location: String,
    
    // Lista de asistencia real
    students: [StudentSchema],
    
    status: { 
        type: String, 
        enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'], 
        default: 'SCHEDULED' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);