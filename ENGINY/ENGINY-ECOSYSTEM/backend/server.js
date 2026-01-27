require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { fork } = require('child_process');
const path = require('path');

const connectDB = require('./src/config/db');

// --- 1. IMPORTAR TODAS LAS RUTAS ---
const authRoutes = require('./src/routes/authRoutes');
const workshopRoutes = require('./src/routes/workshopRoutes');
const requestRoutes = require('./src/routes/requestRoutes');
const sessionRoutes = require('./src/routes/sessionRoutes'); // <--- ESTA FALTABA

// Inicializar App y DB
const app = express();
connectDB();

// Middlewares Globales
app.use(cors()); 
app.use(express.json()); 

// Configurar Socket.io
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log(`🔌 Client connectat: ${socket.id}`);
});

app.set('socketio', io);

// Configurar Worker de IA
const workerPath = path.join(__dirname, 'src', 'workers', 'assignmentWorker.js');
let iaWorker = fork(workerPath);

iaWorker.on('message', (msg) => {
    if (msg.action === 'DONE' && msg.count > 0) {
        console.log(`🤖 IA: Processades ${msg.count} sol·licituds.`);
        io.emit('notification', {
            title: 'IA Finalitzada',
            message: `S'han baremat ${msg.count} noves sol·licituds.`
        });
    }
});

// Ejecutar IA periódicamente
setInterval(() => {
    console.log('⏰ Llançant procés IA...');
    iaWorker.send({ action: 'RUN_IA' });
}, 120000); 

// Endpoint manual IA
app.post('/api/admin/run-ia', (req, res) => {
    iaWorker.send({ action: 'RUN_IA' });
    res.json({ message: 'Procés IA iniciat manualment.' });
});

// --- 2. DEFINIR ENDPOINTS API ---
app.use('/api/auth', authRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/sessions', sessionRoutes); // <--- VITAL PARA EL PROFESOR

// Ruta base
app.get('/', (req, res) => res.send('API ENGINY Funcionant 🚀'));

// Arrancar
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor corrent al port ${PORT}`);
});