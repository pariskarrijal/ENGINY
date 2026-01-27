const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

// Middleware de seguridad: Todo requiere Token válido
router.use(auth);

// --- RUTAS PARA CENTROS ---
// Crear nueva petición
router.post('/', requestController.createRequest);

// Ver historial propio
router.get('/my-requests', requestController.getCenterRequests);

// Cancelar petición propia
router.delete('/:id', requestController.deleteRequest);


// --- RUTAS PARA ADMINISTRADORES ---
// Ver TODAS las peticiones del sistema
router.get('/admin/all', requestController.getAllRequestsAdmin);

// AÑADE ESTA LÍNEA AQUÍ:
router.get('/admin/csv', requestController.exportRequestsToCsv); 

// Cambiar estado (Aprobar/Rechazar)
router.patch('/:id/status', requestController.updateRequestStatus);

module.exports = router;