<template>
  <v-container class="py-8 mw-1400">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary">Catàleg d'Activitats 2026</h1>
        <p class="text-body-1 text-grey">Programa ENGINY - Consorci d'Educació</p>
      </div>
      <v-chip color="info" variant="outlined">
        <v-icon start>mdi-school</v-icon> {{ store.user?.centerId }}
      </v-chip>
    </div>

    <!-- Filtros -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Cercar taller..."
          variant="outlined" density="compact" hide-details
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="8" class="d-flex gap-2 flex-wrap">
        <v-chip-group v-model="filterModality" selected-class="text-primary" filter mandatory>
          <v-chip value="ALL">Tots</v-chip>
          <v-chip value="A" color="purple" variant="outlined">A - Fora Centre</v-chip>
          <v-chip value="B" color="orange" variant="outlined">B - Al Centre</v-chip>
          <v-chip value="C" color="blue" variant="outlined">C - Ofici Compartit</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <!-- Loading -->
    <div v-if="store.loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <!-- Grid de Talleres -->
    <v-row v-else>
      <v-col v-for="workshop in filteredWorkshops" :key="workshop._id" cols="12" md="6" lg="4">
        <v-card class="h-100 d-flex flex-column rounded-lg elevation-2 border-top-modal">
          
          <!-- Badge Modalidad -->
          <div :class="`bg-${getModalityColor(workshop.modality)} text-white px-4 py-2 font-weight-bold d-flex justify-space-between`">
            <span>MODALITAT {{ workshop.modality }}</span>
            <v-icon color="white">{{ getModalityIcon(workshop.modality) }}</v-icon>
          </div>

          <v-card-text class="flex-grow-1 pt-4">
            <h3 class="text-h6 font-weight-bold mb-2 text-truncate">{{ workshop.title }}</h3>
            <v-chip size="x-small" class="mb-3">{{ workshop.scope }}</v-chip>
            
            <p class="text-body-2 text-grey-darken-1 mb-4 text-clamp-3">
              {{ workshop.description }}
            </p>

            <!-- Info Logística -->
            <div class="bg-grey-lighten-4 pa-3 rounded mb-2 text-caption">
              <div class="d-flex align-center gap-2 mb-1">
                <v-icon size="small">mdi-clock-outline</v-icon> 
                <strong>{{ workshop.totalHours }}h</strong> totals
              </div>
              <div class="d-flex align-center gap-2">
                <v-icon size="small">mdi-account-group</v-icon> 
                {{ workshop.availableSlots }} places lliures (Max {{ workshop.maxCapacity }})
              </div>
            </div>

            <!-- Info Específica (Polimorfismo Visual) -->
            <div v-if="workshop.modality === 'C'" class="text-caption text-blue mt-2">
              <v-icon size="small" color="blue">mdi-alert-circle</v-icon>
              Màxim 4 alumnes per centre.
            </div>
            <div v-if="workshop.modality === 'A'" class="text-caption text-purple mt-2">
              <v-icon size="small" color="purple">mdi-map-marker</v-icon>
              {{ workshop.locationName }}
            </div>

          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn 
              :disabled="workshop.availableSlots <= 0"
              :color="workshop.availableSlots > 0 ? 'secondary' : 'grey'"
              variant="flat"
              @click="openRequestDialog(workshop)"
            >
              {{ workshop.availableSlots > 0 ? 'Sol·licitar Plaça' : 'Complet' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- DIÁLOGO DE SOLICITUD -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card class="rounded-lg">
        <v-toolbar color="primary" title="Nova Sol·licitud"></v-toolbar>
        <v-card-text class="pa-6">
          <v-form ref="requestForm" v-model="formValid">
            <v-text-field
              v-model="form.groupName"
              label="Nom del Grup / Classe"
              placeholder="Ex: 4t ESO A"
              variant="outlined"
              :rules="[v => !!v || 'Camp obligatori']"
            ></v-text-field>

            <v-text-field
              v-model.number="form.numStudents"
              label="Nombre d'Alumnes"
              type="number"
              variant="outlined"
              :rules="studentRules" 
            ></v-text-field>

            <v-textarea
              v-model="form.motivation"
              label="Motivació / Objectius Pedagògics"
              hint="Explica per què el vostre centre necessita aquest taller (Important per a la IA)"
              persistent-hint
              variant="outlined"
              rows="3"
            ></v-textarea>

            <v-checkbox
              v-model="form.hasParticipatedLastYear"
              label="Ja vam participar el curs passat"
              color="primary"
            ></v-checkbox>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel·lar</v-btn>
          <v-btn color="secondary" :loading="submitting" @click="submitRequest">Enviar Sol·licitud</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color">{{ snackbar.text }}</v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';

const store = useAppStore();
const search = ref('');
const filterModality = ref('ALL');
const dialog = ref(false);
const submitting = ref(false);
const selectedWorkshop = ref(null);
const snackbar = reactive({ show: false, text: '', color: 'success' });
const formValid = ref(false);
const requestForm = ref(null);

const form = reactive({
  groupName: '',
  numStudents: 0,
  motivation: '',
  hasParticipatedLastYear: false
});

// Cargar talleres al montar
onMounted(() => {
  store.fetchWorkshops();
});

const filteredWorkshops = computed(() => {
  return store.workshops.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(search.value.toLowerCase());
    const matchesType = filterModality.value === 'ALL' || w.modality === filterModality.value;
    return matchesSearch && matchesType;
  });
});

// Reglas dinámicas (Validación Cliente según PDF)
const studentRules = computed(() => [
  v => v > 0 || 'Mínim 1 alumne',
  v => {
    if (selectedWorkshop.value?.modality === 'C' && v > 4) return 'Modalitat C: Màxim 4 alumnes per centre';
    if (v > selectedWorkshop.value?.availableSlots) return 'No hi ha prous places lliures';
    return true;
  }
]);

const openRequestDialog = (workshop) => {
  selectedWorkshop.value = workshop;
  form.numStudents = workshop.modality === 'C' ? 4 : 20; // Default inteligente
  form.groupName = '';
  form.motivation = '';
  dialog.value = true;
};

const submitRequest = async () => {
  const { valid } = await requestForm.value.validate();
  if (!valid) return;

  submitting.value = true;
  try {
    await store.submitRequest({
      workshopId: selectedWorkshop.value._id,
      ...form
    });
    
    snackbar.text = 'Sol·licitud enviada i places reservades!';
    snackbar.color = 'success';
    snackbar.show = true;
    dialog.value = false;
    
  } catch (error) {
    snackbar.text = error;
    snackbar.color = 'error';
    snackbar.show = true;
  } finally {
    submitting.value = false;
  }
};

// Helpers Visuales
const getModalityColor = (m) => ({ A: 'purple', B: 'orange', C: 'blue' }[m]);
const getModalityIcon = (m) => ({ A: 'mdi-bus', B: 'mdi-home-city', C: 'mdi-briefcase-account' }[m]);

</script>

<style scoped>
.text-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.mw-1400 { max-width: 1400px; margin: 0 auto; }
</style>