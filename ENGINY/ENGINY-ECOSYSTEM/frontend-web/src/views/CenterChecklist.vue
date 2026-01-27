<template>
  <v-container class="py-8 mw-1400">
    <h1 class="text-h4 font-weight-bold text-primary mb-6">Checklist de Seguiment</h1>

    <div v-if="approvedRequests.length === 0" class="text-center py-12 text-grey">
      <v-icon size="64">mdi-clipboard-check-outline</v-icon>
      <p class="mt-4">No tens tallers assignats (aprovats) per gestionar.</p>
    </div>

    <v-row v-else>
      <v-col v-for="req in approvedRequests" :key="req._id" cols="12" md="6">
        <v-card class="border-thin rounded-lg">
          <v-card-title class="bg-primary text-white">
            {{ req.workshopTitle }}
          </v-card-title>
          <v-card-subtitle class="pt-2 font-weight-bold">
            Modalitat {{ req.workshopType }}
          </v-card-subtitle>
          
          <v-card-text>
            <v-list lines="one" density="compact">
              <v-list-subheader>TASQUES ADMINISTRATIVES I PEDAGÒGIQUES</v-list-subheader>
              
              <!-- Checklist real basado en la modalidad -->
              <v-list-item>
                <template v-slot:prepend><v-checkbox hide-details></v-checkbox></template>
                <v-list-item-title>Autorització drets d'imatge</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="req.workshopType === 'A'">
                <template v-slot:prepend><v-checkbox hide-details></v-checkbox></template>
                <v-list-item-title>Gestió del transport (T-Jove/Autocar)</v-list-item-title>
              </v-list-item>
              
              <v-list-item v-if="req.workshopType === 'B'">
                <template v-slot:prepend><v-checkbox hide-details></v-checkbox></template>
                <v-list-item-title>Reserva de l'espai al centre</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template v-slot:prepend><v-checkbox hide-details></v-checkbox></template>
                <v-list-item-title>Designació del professorat referent</v-list-item-title>
              </v-list-item>

            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';

const store = useAppStore();

onMounted(() => store.fetchMyRequests());

const approvedRequests = computed(() => {
  return store.myRequests.filter(r => r.status === 'approved');
});
</script>