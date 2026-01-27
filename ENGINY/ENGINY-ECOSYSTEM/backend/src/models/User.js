const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: [true, 'El email es obligatorio'], 
        unique: true, 
        lowercase: true,
        trim: true
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es obligatoria'], 
        select: false // Seguridad: no se devuelve en consultas normales
    },
    name: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['ADMIN', 'CENTER', 'PROFESSOR'], 
        default: 'CENTER' 
    },
    // Datos específicos para Centros
    centerId: { type: String }, // Código Gencat
    municipality: { type: String }, 
    
    // Verificación
    verified: { type: Boolean, default: false },
    verificationCode: { type: String }
}, { timestamps: true });

// Encriptar password antes de guardar
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('User', UserSchema);