<template>
  <v-container class="fill-height bg-grey-lighten-4" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" lg="4">
        <v-card class="elevation-4 rounded-lg pa-6">
          <div class="text-center mb-6">
            <h1 class="text-h4 font-weight-bold text-primary">Alta a ENGINY</h1>
            <p class="text-subtitle-1 text-grey">Registre de centres i docents</p>
          </div>

          <v-form ref="form" @submit.prevent="handleRegister" v-model="valid">
            
            <v-btn-toggle v-model="formData.role" color="primary" class="mb-6 w-100" mandatory>
              <v-btn value="CENTER" class="w-50">Centre Educatiu</v-btn>
              <v-btn value="PROFESSOR" class="w-50">Professor/a</v-btn>
            </v-btn-toggle>

            <v-text-field
              v-model="formData.name"
              :label="formData.role === 'CENTER' ? 'Nom del Responsable' : 'Nom del Docent'"
              prepend-inner-icon="mdi-account"
              variant="outlined"
              :rules="[v => !!v || 'Camp obligatori']"
            ></v-text-field>

            <v-text-field
              v-model="formData.email"
              label="Correu electrònic corporatiu"
              prepend-inner-icon="mdi-email"
              variant="outlined"
              :rules="[v => /.+@.+\..+/.test(v) || 'Email invàlid']"
            ></v-text-field>

            <v-text-field
              v-model="formData.password"
              label="Contrasenya"
              type="password"
              prepend-inner-icon="mdi-lock"
              variant="outlined"
              :rules="[v => v.length >= 6 || 'Mínim 6 caràcters']"
            ></v-text-field>

            <v-divider class="my-4"></v-divider>

            <div>
              <v-alert type="info" variant="tonal" class="mb-4 text-caption" density="compact">
                Tots els usuaris han de seleccionar el centre oficial de la Gencat.
              </v-alert>

              <v-autocomplete
                v-model="selectedCenter"
                :items="centersList"
                :loading="loadingCenters"
                label="Cerca el teu Centre"
                item-title="title"
                item-value="code"
                return-object
                variant="outlined"
                @update:model-value="assignCenterData"
                :rules="[v => !!v || 'Has de seleccionar un centre']"
              ></v-autocomplete>
            </div>

            <v-btn block size="large" color="secondary" type="submit" :loading="store.loading" class="mt-4 font-weight-bold">
              Registrar-se
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { useAppStore } from '../stores/appStore';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const valid = ref(false);
const loadingCenters = ref(false);
const centersList = ref([]);
const selectedCenter = ref(null);

const formData = reactive({
  name: '', email: '', password: '',
  role: 'CENTER', centerId: '', municipality: ''
});

onMounted(async () => {
  try {
    loadingCenters.value = true;
    const { data } = await axios.get("https://analisi.transparenciacatalunya.cat/resource/kvmv-ahh4.json?$limit=3000");
    centersList.value = data.map(c => ({
      title: `${c.codi_centre} - ${c.denominaci_completa}`,
      code: c.codi_centre,
      municipality: c.nom_municipi
    }));
  } catch (error) { console.error(error); } 
  finally { loadingCenters.value = false; }
});

const assignCenterData = (item) => {
  if (item) {
    formData.centerId = item.code;
    formData.municipality = item.municipality;
  }
};

// En handleRegister de RegisterView.vue
const handleRegister = async () => {
  if (!valid.value) return;
  try {
    await store.register(formData);
    // Pasamos el email en la URL para que VerifyView lo recoja
    router.push({ path: '/verify', query: { email: formData.email } });
  } catch (error) {
    alert(error);
  }
};
</script>