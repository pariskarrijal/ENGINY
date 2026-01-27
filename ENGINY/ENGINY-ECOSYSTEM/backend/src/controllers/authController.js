const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 1. REGISTRO
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, centerId, municipality } = req.body;

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) return res.status(400).json({ message: 'Correu ja registrat.' });

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        const user = new User({
            name,
            email: email.toLowerCase(),
            password, 
            role,
            centerId,     // Ahora se guarda siempre para vincular profes y centros
            municipality, 
            verificationCode,
            verified: false
        });

        await user.save();

        await transporter.sendMail({
            from: `"Enginy Hub" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verificació ENGINY',
            html: `<h3>Benvingut al programa ENGINY</h3><p>Codi: <b>${verificationCode}</b></p>`
        });

        res.status(201).json({ message: 'Revisa el teu correu per verificar.' });

    } catch (error) {
        console.error("Error en el registre:", error);
        res.status(500).json({ message: 'Error al servidor', error: error.message });
    }
};

// 2. VERIFICACIÓN
exports.verify = async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) return res.status(400).json({ message: 'Email i codi obligatoris' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ message: 'Usuari no trobat' });
        
        // Comparamos forzando string y quitando espacios
        if (String(user.verificationCode).trim() === String(code).trim()) {
            user.verified = true;
            user.verificationCode = null;
            await user.save();
            res.json({ success: true, message: 'Compte verificat correctament' });
        } else {
            res.status(400).json({ message: 'Codi incorrecte' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error de verificació' });
    }
};

// 3. LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Credencials incorrectes' });
        }

        if (!user.verified) return res.status(403).json({ message: 'Compte no verificat.' });

        const token = jwt.sign(
            { id: user._id, role: user.role, centerId: user.centerId },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.json({
            success: true,
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                role: user.role, 
                centerId: user.centerId 
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en login' });
    }
};