const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth'); // Middleware de seguridad

// Protegemos todas las rutas (necesitan Token)
router.use(auth);

// GET /api/sessions/my-sessions -> Llama a tu función getMySessions
router.get('/my-sessions', sessionController.getMySessions);

// POST /api/sessions/apply -> Llama a tu función applyAsOrientador
router.post('/apply', sessionController.applyAsOrientador);

// PATCH /api/sessions/:sessionId/attendance -> Llama a updateAttendance
// Nota: Usamos PATCH o PUT según prefieras, tu front usa PUT, aquí lo alineamos
router.put('/:sessionId/attendance', sessionController.updateAttendance);

// GET /api/sessions/:id -> Detalle
router.get('/:id', sessionController.getSessionById);

module.exports = router;