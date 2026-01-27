<template>
  <div class="bg-grey-lighten-5 h-100 font-sans">
    <v-container class="mw-1400 py-8">
      
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold text-primary">Històric de Sol·licituds</h1>
          <p class="text-body-1 text-grey-darken-1">Gestiona i revisa l'estat de les teves peticions i les decisions de la IA.</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-arrow-left" variant="text" @click="$router.push('/centre')">
          Tornar al Panell
        </v-btn>
      </div>

      <v-card class="rounded-lg mb-6 pa-4 border-thin" elevation="0">
        <v-row align="center">
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Cercar per taller..."
              variant="outlined" hide-details density="compact"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              label="Filtrar per estat"
              variant="outlined" hide-details density="compact"
            ></v-select>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn color="error" variant="flat" prepend-icon="mdi-plus" @click="$router.push('/centre/cataleg')">
              Nova Sol·licitud
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-card class="rounded-lg border-thin" elevation="0">
        <v-data-table
          :headers="headers"
          :items="filteredRequests"
          :search="search"
          :loading="loading"
          class="custom-table"
        >
          <template v-slot:item.workshop="{ item }">
            <div class="py-3">
              <div class="font-weight-bold text-body-1">{{ item.workshopTitle }}</div>
              <div class="text-caption text-primary">ID: {{ item._id?.substring(0,8) || 'N/A' }}</div>
            </div>
          </template>

          <template v-slot:item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" class="font-weight-bold">
              {{ getStatusLabel(item.status) }}
            </v-chip>
          </template>

          <template v-slot:item.score="{ item }">
            <v-progress-circular
              :model-value="item.score || 0"
              :color="getScoreColor(item.score)"
              size="40"
              width="4"
            >
              <span class="text-caption font-weight-bold">{{ item.score || '0' }}</span>
            </v-progress-circular>
          </template>

          <template v-slot:item.actions="{ item }">
            <v-btn icon="mdi-information-outline" variant="text" color="info" @click="openDetails(item)">
              <v-tooltip activator="parent" location="top">Veure feedback de la IA</v-tooltip>
            </v-btn>
            <v-btn 
              icon="mdi-delete-outline" 
              variant="text" 
              color="error" 
              :disabled="item.status === 'approved'"
              @click="confirmDelete(item)"
            ></v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-container>

    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card class="rounded-lg" v-if="selectedRequest">
        <v-toolbar color="primary" class="text-white">
          <v-toolbar-title>Detalls de la Baremació IA</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="detailsDialog = false"></v-btn>
        </v-toolbar>
        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-6 bg-grey-lighten-4 pa-4 rounded-lg">
            <v-icon icon="mdi-robot" size="40" color="primary" class="mr-4"></v-icon>
            <div>
              <div class="text-overline">Puntuació obtinguda</div>
              <div class="text-h4 font-weight-black text-primary">{{ selectedRequest.score || 0 }}/100</div>
            </div>
          </div>
          <h3 class="text-subtitle-1 font-weight-bold mb-2">Raonament de l'Algorisme:</h3>
          <p class="text-body-1 text-justify mb-6">
            {{ selectedRequest.iaReason || 'La IA encara no ha processat aquesta sol·licitud.' }}
          </p>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.text }}</v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../services/api'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()
const loading = ref(true)
const search = ref('')
const statusFilter = ref('Tots')
const detailsDialog = ref(false)
const selectedRequest = ref(null)
const requests = ref([])
const snackbar = ref({ show: false, text: '', color: '' })

const statusOptions = ['Tots', 'Pendent', 'Aprovat', 'Denegat']
const headers = [
  { title: 'Taller', key: 'workshop', align: 'start' },
  { title: 'Data Sol·licitada', key: 'requestedDate' },
  { title: 'IA Score', key: 'score', align: 'center' },
  { title: 'Estat', key: 'status', align: 'center' },
  { title: 'Accions', key: 'actions', align: 'end', sortable: false }
]

const filteredRequests = computed(() => {
  if (statusFilter.value === 'Tots') return requests.value
  const map = { 'Pendent': 'pending', 'Aprovat': 'approved', 'Denegat': 'rejected' }
  return requests.value.filter(r => r.status === map[statusFilter.value])
})

const fetchRequests = async () => {
  try {
    loading.value = true
    const res = await api.getCenterRequests(store.user.centerId)
    requests.value = res.data
  } catch (e) {
    showToast('Error al carregar dades', 'error')
  } finally { loading.value = false }
}

const confirmDelete = async (item) => {
  if(confirm('Segur que vols eliminar aquesta sol·licitud?')) {
    try {
      await api.deleteRequest(item._id)
      showToast('Sol·licitud eliminada', 'success')
      fetchRequests()
    } catch (e) { showToast('Error al eliminar', 'error') }
  }
}

const openDetails = (item) => { selectedRequest.value = item; detailsDialog.value = true }
const getStatusColor = (s) => ({ pending: 'orange', approved: 'success', rejected: 'error' }[s] || 'grey')
const getStatusLabel = (s) => ({ pending: 'Pendent', approved: 'Aprovat', rejected: 'Denegat' }[s] || s)
const getScoreColor = (s) => (s >= 80 ? 'success' : s >= 50 ? 'warning' : 'error')
const showToast = (text, color) => { snackbar.value = { show: true, text, color } }

onMounted(() => {
  fetchRequests()
  if (store.socket) {
    store.socket.on('notification', (data) => {
      if (data.title === 'Asignación Completada') fetchRequests()
    })
  }
})
</script>