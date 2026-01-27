<template>
  <v-container class="py-8 mw-1400">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">El meu Panell de Control</h1>

    <!-- Notificación Socket -->
    <v-alert
      v-if="store.notifications.length > 0"
      color="info"
      variant="tonal"
      closable
      class="mb-6"
      icon="mdi-bell-ring"
      @click:close="store.notifications = []"
    >
      {{ store.notifications[0].message }}
    </v-alert>

    <v-card class="rounded-lg elevation-2">
      <v-data-table
        :headers="headers"
        :items="store.myRequests"
        :loading="loading"
        no-data-text="Encara no tens sol·licituds."
      >
        <template v-slot:item.workshopTitle="{ item }">
          <div class="font-weight-bold">{{ item.workshopTitle }}</div>
          <v-chip size="x-small" label>{{ item.workshopType }}</v-chip>
        </template>

        <template v-slot:item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" class="font-weight-bold">
            {{ getStatusText(item.status) }}
          </v-chip>
        </template>

        <template v-slot:item.score="{ item }">
           <div v-if="item.score > 0">
             <span class="font-weight-bold" :class="getScoreColor(item.score)">{{ item.score }} pts</span>
             <v-tooltip activator="parent" location="top">Baremació IA: {{ item.score }}/100</v-tooltip>
           </div>
           <span v-else class="text-caption text-grey">Pendent IA</span>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-btn 
            icon="mdi-delete" 
            size="small" 
            variant="text" 
            color="error" 
            @click="cancelRequest(item._id)"
            :disabled="item.status === 'approved'"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';

const store = useAppStore();
const loading = ref(false);

const headers = [
  { title: 'Activitat', key: 'workshopTitle' },
  { title: 'Data Petició', key: 'date' },
  { title: 'Estat', key: 'status' },
  { title: 'IA Score', key: 'score' },
  { title: 'Accions', key: 'actions', sortable: false },
];

onMounted(async () => {
  loading.value = true;
  await store.fetchMyRequests();
  loading.value = false;
});

const cancelRequest = async (id) => {
  if (confirm('Segur que vols cancel·lar? Les places es tornaran a alliberar.')) {
    await store.deleteRequest(id);
  }
};

const getStatusColor = (s) => ({ pending: 'orange', approved: 'success', rejected: 'error' }[s] || 'grey');
const getStatusText = (s) => ({ pending: 'Pendent', approved: 'Assignada', rejected: 'Denegada' }[s] || s);
const getScoreColor = (s) => (s >= 80 ? 'text-green' : s >= 50 ? 'text-orange' : 'text-red');
</script>