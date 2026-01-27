<template>
  <v-container class="py-8 mw-1400 bg-grey-lighten-5">
    
    <!-- Header -->
    <v-card class="mb-6 bg-primary text-white pa-6 rounded-lg elevation-4">
      <div class="d-flex align-center">
        <v-avatar color="white" class="text-primary font-weight-bold mr-4" size="64">
          {{ store.user?.name.charAt(0).toUpperCase() }}
        </v-avatar>
        <div>
          <h2 class="text-h4 font-weight-bold">Hola, {{ store.user?.name }}</h2>
          <p class="opacity-80">Panell de Gestió Docent</p>
        </div>
      </div>
    </v-card>

    <h3 class="text-h5 font-weight-bold text-grey-darken-3 mb-4">Les meves Sessions Assignades</h3>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Empty State -->
    <div v-else-if="sessions.length === 0" class="text-center py-12">
      <v-alert type="info" variant="outlined" border="start" class="bg-white">
        No tens cap sessió assignada actualment.
        <br><span class="text-caption">Quan un administrador t'assigni un taller, apareixerà aquí.</span>
      </v-alert>
    </div>

    <!-- GRID DE SESIONES (Datos Reales de tu Controller) -->
    <v-row v-else>
      <v-col v-for="session in sessions" :key="session._id" cols="12" md="4">
        <v-card class="rounded-lg h-100 d-flex flex-column border-top-modal elevation-2">
           
           <!-- Badge Estado -->
           <div class="d-flex justify-space-between px-4 py-2 bg-grey-lighten-4">
             <!-- Leemos workshopId.modality gracias a tu populate -->
             <span class="text-caption font-weight-bold text-uppercase text-primary">
               {{ session.workshopId?.modality || 'TALLER' }}
             </span>
             <v-chip size="x-small" :color="session.status === 'COMPLETED' ? 'success' : 'orange'" label>
               {{ session.status === 'COMPLETED' ? 'REALITZAT' : 'PENDENT' }}
             </v-chip>
           </div>
           
           <!-- Título -->
           <v-card-title class="font-weight-bold pt-4 text-truncate">
             {{ session.workshopId?.title || 'Títol no disponible' }}
           </v-card-title>
           
           <v-card-text>
             <!-- Centro (Populated) -->
             <div class="d-flex align-center gap-2 mb-2 text-body-2">
               <v-icon color="grey" size="small">mdi-domain</v-icon> 
               <strong>{{ session.centerId?.name || 'Centre Desconegut' }}</strong>
             </div>
             
             <!-- Grupo (Directo del modelo Session) -->
             <div class="d-flex align-center gap-2 text-body-2">
               <v-icon color="grey" size="small">mdi-account-group</v-icon> 
               Grup: {{ session.groupName || 'Sense grup' }}
             </div>

             <!-- Fecha -->
             <div class="d-flex align-center gap-2 text-body-2 mt-1">
               <v-icon color="grey" size="small">mdi-calendar</v-icon> 
               {{ formatDate(session.date) }}
             </div>

             <div class="mt-4 text-caption text-grey">
               {{ session.students ? session.students.length : 0 }} alumnes a llista
             </div>
           </v-card-text>
           
           <v-divider></v-divider>
           
           <v-card-actions class="pa-4">
             <v-btn 
                block 
                variant="flat" 
                color="primary" 
                prepend-icon="mdi-playlist-check"
                @click="openAttendance(session)"
             >
               {{ session.status === 'COMPLETED' ? 'Modificar Assistència' : 'Passar Llista' }}
             </v-btn>
           </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- DIÁLOGO ASISTENCIA (Conecta con tu updateAttendance) -->
    <v-dialog v-model="dialogAttendance" max-width="600" persistent>
      <v-card v-if="selectedSession">
        <v-toolbar color="primary" title="Registre d'Assistència">
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="dialogAttendance = false"></v-btn>
        </v-toolbar>

        <v-card-text class="pa-4" style="max-height: 60vh; overflow-y: auto;">
          
          <!-- Si el array students está vacío en DB -->
          <div v-if="(!selectedSession.students || selectedSession.students.length === 0)" class="text-center pa-4">
            <v-icon size="40" color="orange">mdi-account-alert</v-icon>
            <p class="text-body-2 mt-2 mb-4">No s'han carregat alumnes prèviament.</p>
            <v-btn variant="outlined" size="small" @click="initStudentList">
              Generar llista buida
            </v-btn>
          </div>

          <!-- Lista de Alumnos -->
          <v-list v-else lines="two">
            <v-list-item v-for="(student, index) in selectedSession.students" :key="index" class="border-b">
              <template v-slot:prepend>
                <v-avatar color="grey-lighten-3" size="32" class="text-caption font-weight-bold">
                  {{ student.name ? student.name.substring(0,2).toUpperCase() : '??' }}
                </v-avatar>
              </template>

              <v-list-item-title>
                <v-text-field 
                  v-model="student.name"
                  placeholder="Nom i Cognoms"
                  variant="plain" density="compact" hide-details
                ></v-text-field>
              </v-list-item-title>
              
              <v-list-item-subtitle>
                <v-text-field 
                  v-model="student.dni"
                  placeholder="DNI / ID"
                  variant="plain" density="compact" hide-details
                ></v-text-field>
              </v-list-item-subtitle>

              <template v-slot:append>
                <v-switch v-model="student.present" color="success" hide-details inset></v-switch>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4 bg-grey-lighten-5">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialogAttendance = false">Cancel·lar</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveAttendance">
            Guardar Canvis
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';
import axios from 'axios';

const store = useAppStore();
const sessions = ref([]);
const loading = ref(true);
const saving = ref(false);
const dialogAttendance = ref(false);
const selectedSession = ref(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 1. CARGAR SESIONES
const fetchSessions = async () => {
  try {
    loading.value = true;
    // Llamada a TU controlador: getMySessions
    const { data } = await axios.get(`${API_URL}/sessions/my-sessions`, {
        headers: { Authorization: `Bearer ${store.token}` }
    });
    sessions.value = data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchSessions);

// 2. ABRIR DIÁLOGO
const openAttendance = (session) => {
  // Clonación profunda para no editar la vista hasta guardar
  selectedSession.value = JSON.parse(JSON.stringify(session));
  dialogAttendance.value = true;
};

// 3. INICIALIZAR LISTA (Si está vacía en DB)
const initStudentList = () => {
  // Creamos 15 huecos por defecto si no hay datos
  selectedSession.value.students = Array.from({ length: 15 }, () => ({
    name: '',
    dni: '',
    present: false
  }));
};

// 4. GUARDAR (Llamada a TU controlador: updateAttendance)
const saveAttendance = async () => {
  if (!selectedSession.value) return;
  saving.value = true;
  
  try {
    await axios.put(
      `${API_URL}/sessions/${selectedSession.value._id}/attendance`,
      { 
        students: selectedSession.value.students,
        status: 'COMPLETED' 
      },
      { headers: { Authorization: `Bearer ${store.token}` } }
    );

    // Recargar para ver los cambios confirmados
    await fetchSessions();
    dialogAttendance.value = false;
    alert('Llista guardada correctament!');
    
  } catch (error) {
    alert('Error al guardar: ' + (error.response?.data?.error || error.message));
  } finally {
    saving.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'Sense data';
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.mw-1400 { max-width: 1400px; margin: 0 auto; }
.border-top-modal { border-top: 4px solid #003D5C; }
</style>