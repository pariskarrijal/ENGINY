const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Leer el token del header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

    // 2. Si no hay token, denegar acceso
    if (!token) {
        return res.status(401).json({ message: 'Accés denegat. Manca el token.' });
    }

    try {
        // 3. Verificar el token con la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Añadir el usuario decodificado a la request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token no vàlid.' });
    }
};