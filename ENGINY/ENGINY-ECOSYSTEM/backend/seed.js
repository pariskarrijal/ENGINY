require('dotenv').config();
const mongoose = require('mongoose');

// CORRECCIÓN DE RUTAS: Apuntamos a 'src/models'
const { Workshop, WorkshopA, WorkshopB, WorkshopC } = require('./src/models/Workshop');
const User = require('./src/models/User');

const seedDB = async () => {
    try {
        // Conectar a la DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🌱 Connectant per seed...');

        // 1. LIMPIEZA DE LA BASE DE DATOS (Para no duplicar)
        console.log('🧹 Esborrant dades antigues...');
        // Usamos el modelo base Workshop para borrar TODOS los talleres (A, B y C) de golpe
        await Workshop.deleteMany({});
        await User.deleteMany({});

        // 2. CREAR USUARIOS (ADMIN Y CENTRE)
        console.log('👤 Creant usuaris...');
        
        const admin = new User({
            name: "Admin General",
            email: "admin@enginy.cat",
            password: "123", // El modelo lo encripta
            role: "ADMIN",
            verified: true
        });

        const centre = new User({
            name: "Institut Joan Fuster",
            email: "institut@exemple.cat",
            password: "123",
            role: "CENTER",
            centerId: "08013275", // Codi real Gencat
            municipality: "Barcelona",
            verified: true
        });

        const professor = new User({
            name: "Jordi Profe",
            email: "profe@exemple.cat",
            password: "123",
            role: "PROFESSOR",
            verified: true
        });

        await Promise.all([admin.save(), centre.save(), professor.save()]);

        // 3. CREAR TALLERES (MODELOS REALES PDF)
        console.log('🏭 Creant tallers...');

        // Modalidad A (Fuera del centro)
        const tallerA = new WorkshopA({
            modality: 'A',
            title: "Circ i oficis de les arts escèniques",
            scope: "Escènic",
            description: "El circ com a eina social. Acrobàcia, equilibris, trapezi... Valors de solidaritat i superació.",
            totalHours: 20,
            maxCapacity: 16,
            locationName: "Ateneu Popular de Nou Barris",
            address: "Carrer de Portlligat, 11-15",
            checklistTemplate: [{ step: "Autorització sortida" }, { step: "Roba còmoda" }]
        });

        // Modalidad B (Dentro del centro)
        const tallerB = new WorkshopB({
            modality: 'B',
            title: "Imatge personal per a tothom",
            scope: "Oci i Benestar",
            description: "Formació específica sobre atenció al client, manicura i benestar personal.",
            totalHours: 20,
            maxCapacity: 20,
            requiredSpace: "Aula polivalent amb miralls",
            materialsProvidedByCenter: ["Miralls", "Taules"],
            checklistTemplate: [{ step: "Compromís assistència" }]
        });

        // Modalidad C (Ofici Compartit)
        const tallerC = new WorkshopC({
            modality: 'C',
            title: "Energies Renovables",
            scope: "Indústria avançada - Sostenibilitat",
            description: "Instal·lació de sistemes fotovoltaics i projecte de cotxe solar.",
            totalHours: 30,
            maxCapacity: 16, 
            scheduleDay: "Dijous",
            locationName: "Institut La Mercè",
            maxStudentsPerCenter: 4 // Regla estricta PDF
        });

        await Promise.all([tallerA.save(), tallerB.save(), tallerC.save()]);
        
        console.log('✅ Dades reals (PDF) i Usuaris inserits correctament.');
        process.exit();

    } catch (error) {
        console.error('❌ Error en el seeding:', error);
        process.exit(1);
    }
};

seedDB();