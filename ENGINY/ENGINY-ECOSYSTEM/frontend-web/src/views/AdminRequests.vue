<template>
  <v-container class="py-8 mw-1400">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">Gestió de Sol·licituds</h1>
      <v-btn 
        color="#E3001B" 
        class="text-white font-weight-bold"
        prepend-icon="mdi-robot" 
        size="large"
        :loading="iaLoading" 
        @click="triggerIA"
      >
        EXECUTAR IA
      </v-btn>
    </div>

    <!-- KPIs -->
    <v-row class="mb-6">
      <v-col v-for="kpi in kpiStats" :key="kpi.status" cols="12" sm="3">
        <v-card :class="`pa-4 rounded-lg border-l-4-${kpi.color} elevation-2`">
          <div class="text-caption font-weight-bold text-grey text-uppercase">{{ kpi.title }}</div>
          <div :class="`text-h4 font-weight-bold text-${kpi.color} mt-2`">{{ kpi.count }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-card class="rounded-lg elevation-2 border-thin">
      <div class="d-flex align-center pa-4 bg-grey-lighten-5 border-b">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Cercar per centre o taller..."
          variant="outlined" density="compact" hide-details bg-color="white"
          style="max-width: 400px;"
        ></v-text-field>
        <v-spacer></v-spacer>
        <v-btn-toggle v-model="tab" color="primary" density="compact" mandatory>
          <v-btn value="all">TOTES</v-btn>
          <v-btn value="pending">PENDENTS</v-btn>
          <v-btn value="approved">APROVADES</v-btn>
        </v-btn-toggle>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredRequests"
        :search="search"
        :loading="loading"
        hover
      >
        <template v-slot:item.centerName="{ item }">
          <div class="font-weight-bold text-body-2">{{ item.centerName || item.centerId }}</div>
          <div class="text-caption text-grey">{{ item.centerId }}</div>
        </template>
        
        <template v-slot:item.score="{ item }">
          <div v-if="item.score > 0" class="d-flex align-center">
            <v-progress-circular :model-value="item.score" size="24" width="3" :color="getScoreColor(item.score)" class="mr-2"></v-progress-circular>
            <span class="font-weight-bold">{{ item.score }} pts</span>
          </div>
          <span v-else class="text-caption text-grey font-italic">Pendent</span>
        </template>
        
        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" label size="small" class="font-weight-bold text-uppercase">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-menu location="start">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props"></v-btn>
            </template>
            <v-list density="compact" elevation="3">
              <v-list-item @click="updateStatus(item, 'approved')" :disabled="item.status === 'approved'">
                <template v-slot:prepend><v-icon color="success">mdi-check-circle</v-icon></template>
                <v-list-item-title class="text-success font-weight-bold">Aprovar</v-list-item-title>
              </v-list-item>
              <v-list-item @click="updateStatus(item, 'rejected')" :disabled="item.status === 'rejected'">
                <template v-slot:prepend><v-icon color="error">mdi-close-circle</v-icon></template>
                <v-list-item-title class="text-error">Rebutjar</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <!-- Feedback -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" location="top right">
      <v-icon start>{{ snackbar.icon }}</v-icon> {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore'; // Importamos Store para sockets
import api from '../services/api';

const store = useAppStore();
const loading = ref(true);
const iaLoading = ref(false);
const search = ref('');
const tab = ref('all');
const allRequests = ref([]);
const snackbar = reactive({ show: false, text: '', color: 'success', icon: 'mdi-check' });

const headers = [
  { title: 'Centre', key: 'centerName', align: 'start' },
  { title: 'Taller Sol·licitat', key: 'workshopId.title', align: 'start' },
  { title: 'Alumnes', key: 'studentCount', align: 'center' },
  { title: 'IA Score', key: 'score', align: 'start' }, // Cambiado a start para alineación visual
  { title: 'Estat', key: 'status', align: 'center' },
  { title: 'Accions', key: 'actions', sortable: false, align: 'end' },
];

// --- CARGA DE DATOS ---
const fetchAdminRequests = async () => {
  try {
    loading.value = true;
    const res = await api.getAdminRequests(); 
    allRequests.value = res.data;
  } catch (error) {
    console.error(error);
    showToast('Error carregant sol·licituds', 'error', 'mdi-alert');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchAdminRequests();
  
  // ESCUCHAR SOCKETS: Si la IA termina, recargar la tabla automáticamente
  if (store.socket) {
    store.socket.on('notification', (data) => {
      if (data.title === 'IA Finalitzada') {
        showToast(data.message, 'info', 'mdi-robot');
        fetchAdminRequests(); // RECARGA AUTOMÁTICA
        iaLoading.value = false; // Parar spinner
      }
    });
  }
});

// --- ACCIONES ---

// 1. DISPARAR IA (Esta era la función que faltaba)
const triggerIA = async () => {
  iaLoading.value = true;
  try {
    await api.triggerIA();
    showToast('Processant... Espera la notificació.', 'info', 'mdi-clock-outline');
    // No ponemos iaLoading = false aquí, esperamos al socket o un timeout
    setTimeout(() => { if(iaLoading.value) iaLoading.value = false; }, 5000); 
  } catch (e) {
    showToast('Error connectant amb el servidor IA', 'error', 'mdi-alert');
    iaLoading.value = false;
  }
};

// 2. ACTUALIZAR ESTADO MANUAL
const updateStatus = async (item, newStatus) => {
  try {
    await api.updateRequestStatusAdmin(item._id, { status: newStatus });
    
    // Optimistic UI Update (Actualizar visualmente sin recargar todo)
    const index = allRequests.value.findIndex(r => r._id === item._id);
    if (index !== -1) allRequests.value[index].status = newStatus;
    
    showToast(`Estat actualitzat a: ${getStatusText(newStatus)}`, 'success');
  } catch (error) {
    showToast("Error a l'actualitzar l'estat.", 'error');
  }
};

// --- COMPUTED & HELPERS ---

const filteredRequests = computed(() => {
  if (tab.value === 'all') return allRequests.value;
  return allRequests.value.filter(r => r.status === tab.value);
});

const kpiStats = computed(() => [
  { status: 'pending', title: 'PENDENTS', count: allRequests.value.filter(r => r.status === 'pending').length, color: 'orange' },
  { status: 'approved', title: 'APROVADES', count: allRequests.value.filter(r => r.status === 'approved').length, color: 'success' },
  { status: 'rejected', title: 'REBUTJADES', count: allRequests.value.filter(r => r.status === 'rejected').length, color: 'red' },
  { status: 'total', title: 'TOTAL', count: allRequests.value.length, color: 'primary' },
]);

const getStatusColor = (s) => ({ pending: 'orange', approved: 'success', rejected: 'red' }[s] || 'grey');
const getStatusText = (s) => ({ pending: 'Pendent', approved: 'Aprovada', rejected: 'Rebutjada' }[s] || s);
const getScoreColor = (s) => (s >= 75 ? 'success' : s >= 50 ? 'warning' : 'error');

const showToast = (text, color, icon) => {
  snackbar.text = text; snackbar.color = color; snackbar.icon = icon || 'mdi-check'; snackbar.show = true;
};
</script>

<style scoped>
.border-l-4-primary { border-left: 5px solid #003D5C !important; }
.border-l-4-orange { border-left: 5px solid #FB8C00 !important; }
.border-l-4-success { border-left: 5px solid #43A047 !important; }
.border-l-4-red { border-left: 5px solid #E53935 !important; }
.mw-1400 { max-width: 1400px; margin: 0 auto; }
</style>