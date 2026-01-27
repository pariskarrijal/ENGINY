const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 1. IMPORTACIÓN DE RUTAS (Asegúrate de que estos archivos existen)
const authRoutes = require('./routes/authRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const requestRoutes = require('./routes/requestRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();

// ============================================
// 2. MIDDLEWARES (VITAL: Deben ir antes de las rutas)
// ============================================
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ============================================
// 3. DEFINICIÓN DE RUTAS (El orden importa)
// ============================================

// Al poner '/api/auth', y dentro de authRoutes tener router.post('/login')
// La URL resultante es EXACTAMENTE: http://localhost:3000/api/auth/login
app.use('/api/auth', authRoutes);         
app.use('/api/workshops', workshopRoutes); 
app.use('/api/requests', requestRoutes);   
app.use('/api/sessions', sessionRoutes);   

// Ruta de salud para comprobar que el servidor responde
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'API Enginy Hub 🚀' });
});

// ============================================
// 4. GESTIÓN DE ERRORES (Aquí es donde sale tu mensaje)
// ============================================

// Este middleware solo se ejecuta si ninguna ruta de arriba coincide
app.use((req, res) => {
    res.status(404).json({ 
        message: `La ruta ${req.originalUrl} no existe. Revisa el método (${req.method}) y la URL.` 
    });
});

module.exports = app;