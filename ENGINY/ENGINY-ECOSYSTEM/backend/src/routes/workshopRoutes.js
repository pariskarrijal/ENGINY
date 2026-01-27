const express = require('express');
const router = express.Router();
const workshopController = require('../controllers/workshopController');
const auth = require('../middleware/auth'); // Protegemos rutas si es necesario

// Rutas Públicas (o protegidas según necesidad)
router.get('/', workshopController.getAllWorkshops);
router.get('/pdf', workshopController.downloadCatalogPdf); // Descarga del catálogo

// Rutas Privadas (Solo Admin podría crear, pero dejamos abierta para seed/pruebas)
router.post('/', auth, workshopController.createWorkshop);

module.exports = router;