const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Request = require('../models/Request');
require('dotenv').config();

const connectWorkerDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

process.on('message', async (msg) => {
    if (msg.action === 'RUN_IA') {
        try {
            await connectWorkerDB();
            
            // 1. ORDENACIÓN: Por fecha de creación (createdAt: 1 es del más antiguo al más nuevo)
            // Aquí puedes añadir 'distance' si tienes ese campo en el modelo: .sort({ distance: 1, createdAt: 1 })
            const pending = await Request.find({ status: 'pending' })
                .sort({ createdAt: 1 }) 
                .limit(10);
            
            if (pending.length === 0) {
                process.send({ action: 'DONE', count: 0 });
                return;
            }

            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Actualizado a flash estable

            const data = pending.map(r => ({
                id: r._id,
                motivation: r.motivation,
                repeat: r.hasParticipatedLastYear,
                students: r.studentCount,
                // Si tienes coordenadas o distancia calculada, pásala aquí
                distance: r.distanceFromCenter || 'No especificada' 
            }));

            const prompt = `
                Actúa como el comité pedagógico del programa ENGINY.
                Objetivos: Fomentar vocaciones, evitar absentismo, equidad geográfica.
                
                Analiza estas solicitudes considerando:
                1. Prioridad: Si 'repeat' es true, resta 15 puntos (queremos centros nuevos).
                2. Proximidad: Si la 'distance' es corta, puntúa positivamente (sostenibilidad).
                3. Motivación: Si menciona "orientación", "inclusión" o "riesgo exclusión", suma hasta 30 puntos.
                
                Input JSON: ${JSON.stringify(data)}
                
                Devuelve SOLO un JSON Array: [{"id": "...", "score": 0-100, "reason": "breve justificación en catalán"}]
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
            const scores = JSON.parse(text);

            for (const s of scores) {
                // 2. LÓGICA DE APROBACIÓN AUTOMÁTICA
                // Si la nota es >= 65, cambiamos el estado a 'approved'
                let finalStatus = 'pending';
                if (s.score >= 50) {
                    finalStatus = 'approved';
                }

                await Request.findByIdAndUpdate(s.id, {
                    score: s.score,
                    iaReasoning: s.reason,
                    status: finalStatus // Actualizamos el estado basado en la nota
                });
            }

            process.send({ action: 'DONE', count: scores.length });

        } catch (error) {
            console.error(error);
            process.send({ action: 'ERROR', error: error.message });
        }
    }
});