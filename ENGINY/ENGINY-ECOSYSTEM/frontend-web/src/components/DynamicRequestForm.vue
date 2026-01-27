<template>
  <v-card class="rounded-lg h-100 d-flex flex-column">
    
    <!-- 1. HEADER DINÁMICO (Color según tipo) -->
    <v-toolbar :color="getHeaderColor(workshop.modalityType)" height="70" elevation="0">
      <v-icon class="ml-4 text-white opacity-80">{{ getIcon(workshop.modalityType) }}</v-icon>
      <v-toolbar-title class="text-white font-weight-bold pl-4 text-h6">
        Sol·licitud: {{ workshop.title }}
      </v-toolbar-title>
      <v-btn icon="mdi-close" variant="text" color="white" @click="$emit('close')"></v-btn>
    </v-toolbar>

    <v-card-text class="pa-6 bg-grey-lighten-5 flex-grow-1" style="max-height: 70vh; overflow-y: auto;">
      <v-form ref="formRef" v-model="valid">
        
        <v-alert type="info" variant="tonal" class="mb-4 text-caption border-s-4-primary bg-white" icon="mdi-information">
          Aquesta sol·licitud serà processada per l'algoritme d'assignació automàtica (IA).
        </v-alert>

        <!-- SECCIÓN 1: DADES LOGÍSTIQUES -->
        <p class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-2">DADES DEL GRUP</p>
        <v-card class="mb-6 rounded-lg border-thin" flat>
          <v-card-text class="pa-4">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model="form.groupName" 
                  label="Nom del Grup (Ex: 4t ESO A)" 
                  variant="outlined" density="compact" color="primary" 
                  :rules="[rules.required]"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field 
                  v-model.number="form.numStudents" 
                  label="Nombre d'Alumnes" 
                  type="number" variant="outlined" density="compact" color="primary" 
                  :max="workshop.maxCapacity"
                  :rules="[rules.required, rules.maxCapacity]"
                  suffix="alumnes"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- SECCIÓN 2: REQUISITS ESPECÍFICS (A/B/C) -->
        <p class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-2">REQUISITS TÈCNICS ({{ getTypeName(workshop.modalityType) }})</p>
        <v-card class="mb-6 rounded-lg border-thin" flat>
          <v-card-text class="pa-4">
            
            <!-- CASO A: TECNOLOGIA -->
            <div v-if="workshop.modalityType === 'Technology'">
              <v-checkbox 
                v-model="form.requirementsMet" 
                label="Confirmem que disposem d'ordinadors a l'aula" 
                color="purple" density="compact" hide-details
                :rules="[rules.trueRequired]"
              ></v-checkbox>
              <v-checkbox 
                v-model="form.softwareReady" 
                label="El programari necessari està preinstal·lat" 
                color="purple" density="compact" hide-details
              ></v-checkbox>
            </div>

            <!-- CASO B: OFICIS -->
            <div v-if="workshop.modalityType === 'Craft'">
              <v-textarea 
                v-model="form.allergies" 
                label="Al·lèrgies o intoleràncies alimentàries" 
                placeholder="Indiqueu si hi ha cap alumne amb al·lèrgies..." 
                variant="outlined" density="compact" rows="2"
              ></v-textarea>
              <v-checkbox 
                v-model="form.safetyGear" 
                label="Ens comprometem a portar roba de seguretat" 
                color="orange" density="compact" hide-details
                :rules="[rules.trueRequired]"
              ></v-checkbox>
            </div>

            <!-- CASO C: VELA/OUTDOOR -->
            <div v-if="workshop.modalityType === 'Outdoor'">
              <v-select 
                v-model="form.transport" 
                label="Mètode de transport" 
                :items="['Transport Públic', 'Autocar Privat', 'A peu']" 
                variant="outlined" density="compact"
                :rules="[rules.required]"
              ></v-select>
              <v-checkbox 
                v-model="form.swimming" 
                label="Certifico que tots els alumnes saben nedar" 
                color="blue" density="compact" hide-details
                :rules="[rules.trueRequired]"
              ></v-checkbox>
            </div>

          </v-card-text>
        </v-card>

        <!-- SECCIÓN 3: DADES PER A LA IA (Worker) -->
        <p class="text-subtitle-2 font-weight-bold text-grey-darken-3 mb-2">CRITERIS D'ASSIGNACIÓ (IA)</p>
        <v-card class="rounded-lg border-thin bg-blue-grey-lighten-5" flat>
          <v-card-text class="pa-4">
            <div class="text-caption text-grey-darken-2 mb-2">
              Aquestes dades s'utilitzaran per calcular la prioritat de la vostra sol·licitud.
            </div>
            
            <v-radio-group v-model="form.participatedLastYear" inline density="compact" color="primary">
              <template v-slot:label>
                <div class="text-body-2 font-weight-bold text-black mb-1">Heu participat en aquest taller el curs passat?</div>
              </template>
              <v-radio label="Sí (Menor Prioritat)" :value="true"></v-radio>
              <v-radio label="No (Major Prioritat)" :value="false"></v-radio>
            </v-radio-group>

            <v-divider class="my-2"></v-divider>

            <v-textarea 
              v-model="form.motivation" 
              label="Motivació / Projecte de Centre" 
              placeholder="Explica breument per què aquest taller és clau pel vostre projecte educatiu..." 
              variant="outlined" density="compact" bg-color="white" rows="2"
            ></v-textarea>
          </v-card-text>
        </v-card>

      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <!-- ACTIONS -->
    <v-card-actions class="pa-4 bg-white">
      <v-spacer></v-spacer>
      <v-btn variant="text" color="grey-darken-1" @click="$emit('close')">Cancel·lar</v-btn>
      <v-btn 
        color="#E3001B" 
        variant="flat" 
        size="large" 
        class="text-white font-weight-bold px-6 elevation-2"
        :loading="submitting"
        @click="submit"
      >
        <v-icon start>mdi-send-check</v-icon>
        Tramitar Sol·licitud
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive } from 'vue';

const props = defineProps(['workshop']);
const emit = defineEmits(['close', 'submit']);

const formRef = ref(null);
const valid = ref(false);
const submitting = ref(false);

const form = reactive({
  groupName: '',
  numStudents: null,
  // Específicos
  requirementsMet: false,
  softwareReady: false,
  allergies: '',
  safetyGear: false,
  transport: null,
  swimming: false,
  // IA Data
  participatedLastYear: false,
  motivation: ''
});

// Reglas de validación
const rules = {
  required: v => !!v || 'Camp obligatori',
  maxCapacity: v => (v && v <= props.workshop.maxCapacity) || `El màxim és ${props.workshop.maxCapacity}`,
  trueRequired: v => v === true || 'És necessari confirmar aquest requisit'
};

const submit = async () => {
  const { valid: isFormValid } = await formRef.value.validate();
  if (!isFormValid) return;

  submitting.value = true;
  
  // Creamos una promesa para esperar al padre
  try {
    // Emitimos el evento y pasamos una función de callback o esperamos el evento
    emit('submit', { 
      workshopId: props.workshop._id, // Asegúrate de pasar el ID
      ...form, 
    });
    

    setTimeout(() => { submitting.value = false }, 3000); 

  } catch (error) {
    submitting.value = false;
  }
};

// Añade un método para que el padre detenga el loading desde fuera
defineExpose({
  stopLoading: () => { submitting.value = false; }
});

// Helpers Visuales
const getHeaderColor = (t) => ({ 'Technology': '#6A1B9A', 'Craft': '#EF6C00', 'Outdoor': '#1565C0' }[t] || '#424242');
const getIcon = (t) => ({ 'Technology': 'mdi-laptop', 'Craft': 'mdi-hammer-wrench', 'Outdoor': 'mdi-sail-boat' }[t] || 'mdi-school');
const getTypeName = (t) => ({ 'Technology': 'TECNOLOGIA', 'Craft': 'OFICIS', 'Outdoor': 'VELA/ESPORT' }[t] || 'GENERAL');
</script>

<style scoped>
.border-thin { border: 1px solid #e0e0e0; }
.border-s-4-primary { border-left: 4px solid #003D5C !important; }
</style>