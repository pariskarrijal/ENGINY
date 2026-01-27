<template>
  <v-container class="py-8 mw-1400">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">Administració ENGINY</h1>

    <!-- KPIs Reales -->
    <v-row class="mb-6">
      <v-col cols="12" sm="4">
        <v-card class="pa-4 rounded-lg border-l-4-primary elevation-2">
          <div class="text-caption font-weight-bold text-grey">TALLERS ACTIUS</div>
          <div class="text-h3 font-weight-bold text-primary mt-2">{{ store.workshops.length }}</div>
          <v-icon class="position-absolute top-0 right-0 ma-4 text-grey-lighten-2" size="64">mdi-school</v-icon>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 rounded-lg border-l-4-secondary elevation-2">
          <div class="text-caption font-weight-bold text-grey">PETICIONS PENDENTS</div>
          <div class="text-h3 font-weight-bold text-secondary mt-2">{{ pendingCount }}</div>
          <v-icon class="position-absolute top-0 right-0 ma-4 text-grey-lighten-2" size="64">mdi-clipboard-clock</v-icon>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card class="pa-4 rounded-lg border-l-4-info elevation-2">
          <div class="text-caption font-weight-bold text-grey">ALUMNES INSCRITS</div>
          <div class="text-h3 font-weight-bold text-info mt-2">{{ totalStudents }}</div>
          <v-icon class="position-absolute top-0 right-0 ma-4 text-grey-lighten-2" size="64">mdi-account-group</v-icon>
        </v-card>
      </v-col>
    </v-row>

    <!-- Accesos Rápidos -->
    <h2 class="text-h6 font-weight-bold text-grey-darken-3 mb-4">Accions Ràpides</h2>
    <v-row>
      <v-col cols="12" md="4">
        <v-btn block size="x-large" color="primary" variant="flat" to="/admin/tallers">
          <v-icon start>mdi-plus-box</v-icon> Gestió de Tallers
        </v-btn>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn block size="x-large" color="secondary" variant="flat" to="/admin/peticions">
          <v-icon start>mdi-gavel</v-icon> Revisar Peticions
        </v-btn>
      </v-col>
      <v-col cols="12" md="4">
        <v-btn block size="x-large" color="info" variant="flat" @click="triggerIA" :loading="iaLoading">
          <v-icon start>mdi-robot</v-icon> Executar IA (Manual)
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from '../stores/appStore';
import api from '../services/api';

const store = useAppStore();
const iaLoading = ref(false);
const allRequests = ref([]);

// Cargar datos reales
onMounted(async () => {
  await store.fetchWorkshops();
  // Necesitamos un endpoint de admin para ver TODAS las peticiones (lo simulamos con la llamada del store si eres admin)
  // En una app real, el endpoint GET /requests debería devolver todo si eres admin.
});

// Cálculos en tiempo real
const pendingCount = computed(() => {
  // Nota: En una app real esto vendría de un endpoint /stats. 
  // Aquí usamos los talleres para calcular ocupación aproximada si no tenemos la lista completa de peticiones cargada.
  return 'Calculant...'; 
});

const totalStudents = computed(() => {
  return store.workshops.reduce((acc, w) => acc + (w.enrolledCount || 0), 0);
});

const triggerIA = async () => {
  iaLoading.value = true;
  try {
    await api.triggerIA();
    alert('Procés IA llançat. Rebràs una notificació quan acabi.');
  } catch (e) {
    alert('Error al connectar amb el Worker.');
  } finally {
    iaLoading.value = false;
  }
};
</script>

<style scoped>
.border-l-4-primary { border-left: 5px solid #003D5C !important; }
.border-l-4-secondary { border-left: 5px solid #E3001B !important; }
.border-l-4-info { border-left: 5px solid #009688 !important; }
.mw-1400 { max-width: 1400px; margin: 0 auto; }
</style>