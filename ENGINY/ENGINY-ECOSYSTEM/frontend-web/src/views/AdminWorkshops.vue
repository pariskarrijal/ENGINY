<template>
  <v-container class="py-8 mw-1400">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold text-primary">Gestió de Tallers</h1>
      <v-btn color="secondary" prepend-icon="mdi-plus" @click="openDialog">Nou Taller</v-btn>
    </div>

    <!-- Tabla de Talleres -->
    <v-card>
      <v-data-table :headers="headers" :items="store.workshops" :loading="store.loading">
        <template v-slot:item.modality="{ item }">
          <v-chip :color="getModalityColor(item.modality)" size="small" class="font-weight-bold">
            {{ item.modality }}
          </v-chip>
        </template>
        <template v-slot:item.enrolledCount="{ item }">
          <v-progress-linear
            :model-value="(item.enrolledCount / item.maxCapacity) * 100"
            color="primary"
            height="20"
            rounded
          >
            <template v-slot:default="{ value }">
              <strong class="text-white text-caption">{{ item.enrolledCount }} / {{ item.maxCapacity }}</strong>
            </template>
          </v-progress-linear>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo Crear/Editar -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-toolbar color="primary" title="Configuració del Taller"></v-toolbar>
        <v-card-text class="pa-6">
          <v-form ref="formRef" v-model="valid">
            
            <v-select
              v-model="form.modality"
              label="Modalitat del Programa (PDF)"
              :items="['A', 'B', 'C']"
              variant="outlined"
              prepend-inner-icon="mdi-shape"
            ></v-select>

            <!-- Campos Comunes -->
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field v-model="form.title" label="Títol" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                 <v-select v-model="form.scope" label="Àmbit" :items="['Tecnologia', 'Artístic', 'Social']" variant="outlined"></v-select>
              </v-col>
            </v-row>
            
            <v-textarea v-model="form.description" label="Descripció" variant="outlined" rows="3"></v-textarea>
            
            <v-row>
              <v-col cols="6">
                <v-text-field v-model.number="form.totalHours" type="number" label="Hores Totals" variant="outlined"></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="form.maxCapacity" type="number" label="Capacitat Màxima" variant="outlined"></v-text-field>
              </v-col>
            </v-row>

            <!-- CAMPOS DINÁMICOS (POLIMORFISMO) -->
            <v-divider class="my-4"></v-divider>
            <h3 class="text-subtitle-1 font-weight-bold mb-2 text-primary">
              Configuració Específica (Modalitat {{ form.modality }})
            </h3>

            <!-- Modalidad A -->
            <div v-if="form.modality === 'A'" class="bg-purple-lighten-5 pa-4 rounded">
              <v-text-field v-model="form.locationName" label="Nom de l'Entitat/Lloc" variant="outlined" bg-color="white"></v-text-field>
              <v-text-field v-model="form.address" label="Adreça" variant="outlined" bg-color="white"></v-text-field>
              <v-checkbox v-model="form.requiresDisplacement" label="Requereix desplaçament" hide-details></v-checkbox>
            </div>

            <!-- Modalidad B -->
            <div v-if="form.modality === 'B'" class="bg-orange-lighten-5 pa-4 rounded">
              <v-text-field v-model="form.requiredSpace" label="Espai requerit al centre" placeholder="Ex: Aula de teatre" variant="outlined" bg-color="white"></v-text-field>
              <v-text-field v-model="form.expertCompany" label="Empresa experta" variant="outlined" bg-color="white"></v-text-field>
            </div>

            <!-- Modalidad C -->
            <div v-if="form.modality === 'C'" class="bg-blue-lighten-5 pa-4 rounded">
              <v-text-field v-model="form.locationName" label="Institut on es realitza" variant="outlined" bg-color="white"></v-text-field>
              <v-select v-model="form.scheduleDay" :items="['Dijous', 'Dimarts']" label="Dia de realització" variant="outlined" bg-color="white"></v-select>
              <v-alert type="info" density="compact" variant="tonal" class="mt-2">
                Es limitarà automàticament a 4 alumnes per centre sol·licitant.
              </v-alert>
            </div>

          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="dialog = false">Cancel·lar</v-btn>
          <v-btn color="primary" variant="flat" @click="saveWorkshop">Guardar Taller</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';
import axios from 'axios';

const store = useAppStore();
const dialog = ref(false);
const valid = ref(false);

const headers = [
  { title: 'Modalitat', key: 'modality' },
  { title: 'Títol', key: 'title' },
  { title: 'Àmbit', key: 'scope' },
  { title: 'Ocupació', key: 'enrolledCount', width: '200px' },
];

const form = reactive({
  modality: 'A',
  title: '',
  scope: '',
  description: '',
  totalHours: 20,
  maxCapacity: 16,
  // Específicos
  locationName: '',
  address: '',
  requiredSpace: '',
  expertCompany: '',
  scheduleDay: 'Dijous'
});

onMounted(() => store.fetchWorkshops());

const openDialog = () => {
  dialog.value = true;
};

const saveWorkshop = async () => {
  try {
    // LLAMADA REAL A LA API
    await axios.post('http://localhost:3000/api/workshops', form, {
       headers: { Authorization: `Bearer ${store.token}` }
    });
    await store.fetchWorkshops();
    dialog.value = false;
  } catch (e) {
    alert('Error al guardar: ' + e.message);
  }
};

const getModalityColor = (m) => ({ A: 'purple', B: 'orange', C: 'blue' }[m]);
</script>