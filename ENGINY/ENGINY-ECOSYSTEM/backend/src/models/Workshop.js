const mongoose = require('mongoose');

const options = { discriminatorKey: 'modality', collection: 'workshops' };

// ==============================================================================
// 1. SCHEMA BASE (Camps comuns descrits al PDF)
// ==============================================================================
const WorkshopSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Ex: "Retratistes de la ciutat"
    
    // Àmbit descrit al PDF (Ex: "Indústria 4.0", "Artístic-social", "Científic-Humanístic")
    scope: { type: String, required: true }, 
    
    description: { type: String, required: true },
    
    // Durada (PDF: Generalment 20h o 30h)
    totalHours: { type: Number, required: true },
    sessions: { type: Number, default: 10 }, // PDF: "durant 10 setmanes"
    hoursPerSession: { type: Number, default: 2 }, // PDF: "2h/dia" o "3h/dia"
    
    // Aforament
    maxCapacity: { type: Number, required: true }, // A=16, B=15-20, C=12-16
    enrolledCount: { type: Number, default: 0 },
    
    // Estat
    status: { 
        type: String, 
        enum: ['ACTIVE', 'FULL', 'CANCELLED'], 
        default: 'ACTIVE' 
    },

    // Checklist dinàmic (necessari per la validació pedagògica)
    checklistTemplate: [{
        step: { type: String },
        required: { type: Boolean, default: true }
    }]
}, { timestamps: true, ...options });

const Workshop = mongoose.model('Workshop', WorkshopSchema);

// ==============================================================================
// 2. SCHEMAS PER MODALITAT (Segons PDF Pàg 3, 6, 10)
// ==============================================================================

// --- MODALITAT A: Projectes fora del centre ---
// Característiques: 
// - Alumnat de 1r a 4t ESO.
// - Grups de 16 alumnes d'un mateix centre.
// - Es fan en entitats/institucions de la ciutat (Fora).
// - Requereix desplaçament.
const WorkshopA = Workshop.discriminator('A',
    new mongoose.Schema({
        locationName: { type: String, required: true }, // Ex: "Museu Picasso", "Ateneu de Fabricació"
        address: { type: String, required: true },
        transportInfo: { type: String }, // Instruccions per arribar-hi
        requiresDisplacement: { type: Boolean, default: true } // Per avisar a les famílies
    }, options)
);

// --- MODALITAT B: Projectes en el propi centre ---
// Característiques:
// - Alumnat de 1r a 4t ESO.
// - Grups de 15 a 20 alumnes.
// - Experts venen al centre.
// - Requereix espais específics dins l'institut (Aula teatre, taller fusta, pati, etc.)
const WorkshopB = Workshop.discriminator('B',
    new mongoose.Schema({
        requiredSpace: { type: String, required: true }, // Ex: "Aula amb projector", "Gimnàs", "Aula Taller"
        materialsProvidedByCenter: [String], // Material que ha de posar l'institut
        expertCompany: { type: String } // Nom de l'entitat que ve a fer el taller
    }, options)
);

// --- MODALITAT C: "Ofici Compartit" ---
// Característiques:
// - Alumnat de 3r i 4t ESO (exclusiu).
// - Alumnes barrejats de diferents centres (Max 4 per centre, Total 12-16).
// - Horari fix: Dijous (excepcionalment Dimarts).
// - Durada 30h (3h/sessió).
const WorkshopC = Workshop.discriminator('C',
    new mongoose.Schema({
        scheduleDay: { 
            type: String, 
            enum: ['Dijous', 'Dimarts'], 
            default: 'Dijous' 
        },
        locationName: { type: String, required: true }, // Ex: "Institut de la Mercè"
        
        // Control específic de places per aquesta modalitat
        maxStudentsPerCenter: { type: Number, default: 4 }, // PDF Pàg 10: "màxim de 4 places per un mateix projecte"
        participatingCenters: [{ type: String }] // Array de IDs de centres inscrits
    }, options)
);

module.exports = { Workshop, WorkshopA, WorkshopB, WorkshopC };