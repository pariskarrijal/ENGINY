<template>
  <v-container fluid class="fill-height pa-0">
    <v-row no-gutters class="fill-height shadow-lg">
      
      <!-- COLUMNA IZQUIERDA: VISUAL & BRANDING (Oculta en móviles) -->
      <v-col cols="12" md="6" class="d-none d-md-flex position-relative bg-primary overflow-hidden">
        <!-- Imagen de Fondo con Overlay -->
        <div class="background-image"></div>
        <div class="background-overlay"></div>

        <!-- Contenido Flotante -->
        <div class="d-flex flex-column justify-space-between fill-height pa-12 position-relative z-10 text-white">
          <div class="animate-slide-down">
            <div class="d-flex align-center gap-3">
              <v-icon size="40" icon="mdi-shape-plus"></v-icon>
              <span class="text-h6 font-weight-bold tracking-widest">CONSORCI D'EDUCACIÓ</span>
            </div>
          </div>

          <div class="animate-slide-up mb-12">
            <h2 class="text-h3 font-weight-bold mb-4 leading-tight">
              Transformem l'educació<br>amb tecnologia.
            </h2>
            <p class="text-h6 opacity-80 font-weight-light" style="max-width: 80%;">
              Gestiona els tallers del programa ENGINY de manera eficient, connectant centres, professors i el futur.
            </p>
          </div>
        </div>

        <!-- Elementos decorativos (Círculos) -->
        <div class="circle-decoration top-right"></div>
        <div class="circle-decoration bottom-left"></div>
      </v-col>

      <!-- COLUMNA DERECHA: FORMULARIO -->
      <v-col cols="12" md="6" class="bg-surface d-flex align-center justify-center position-relative">
        <div class="login-wrapper w-100 pa-8 pa-md-16 animate-fade-in">
          
          <!-- Encabezado Móvil -->
          <div class="d-md-none text-center mb-8">
            <v-icon size="48" color="primary">mdi-school</v-icon>
            <h2 class="text-primary font-weight-bold">ENGINY HUB</h2>
          </div>

          <div class="mb-8">
            <h1 class="text-h4 font-weight-bold text-grey-darken-4 mb-2">Benvingut/da</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              Introdueix les teves credencials per accedir al panell.
            </p>
          </div>

          <v-form ref="formRef" @submit.prevent="handleLogin" v-model="isValid">
            <v-text-field
              v-model="email"
              label="Correu electrònic"
              placeholder="nom@exemple.cat"
              prepend-inner-icon="mdi-email-outline"
              variant="outlined"
              color="primary"
              class="mb-2"
              :rules="[rules.required, rules.email]"
            ></v-text-field>

            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Contrasenya"
              placeholder="••••••••"
              prepend-inner-icon="mdi-lock-outline"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              variant="outlined"
              color="primary"
              class="mb-6"
              :rules="[rules.required]"
            ></v-text-field>

            <v-alert
              v-if="store.authError"
              type="error"
              variant="tonal"
              icon="mdi-alert-circle"
              class="mb-6 rounded-lg"
              border="start"
              border-color="error"
            >
              {{ store.authError }}
            </v-alert>

            <v-btn
              block
              color="primary"
              size="x-large"
              type="submit"
              :loading="store.loading"
              class="text-none font-weight-bold text-body-1 rounded-lg elevation-4 btn-hover"
              height="56"
            >
              Iniciar Sessió
              <v-icon end icon="mdi-arrow-right"></v-icon>
            </v-btn>
          </v-form>

          <div class="mt-8 text-center">
            <p class="text-body-2 text-grey-darken-1">
              Encara no tens un compte? 
              <router-link to="/register" class="text-primary font-weight-bold text-decoration-none hover-underline">
                Registra't ara
              </router-link>
            </p>
          </div>

          <!-- Footer Demo (BOTONES ARREGLADOS) -->
          <v-divider class="my-8"></v-divider>
          <div class="d-flex justify-center gap-4">
            <v-chip size="small" variant="outlined" color="grey" class="cursor-pointer" @click="fillDemo('admin')">
              <v-icon start size="small">mdi-shield</v-icon> Demo Admin
            </v-chip>
            <v-chip size="small" variant="outlined" color="grey" class="cursor-pointer" @click="fillDemo('center')">
              <v-icon start size="small">mdi-domain</v-icon> Demo Centre
            </v-chip>
            <v-chip size="small" variant="outlined" color="grey" class="cursor-pointer" @click="fillDemo('professor')">
              <v-icon start size="small">mdi-human-male-board</v-icon> Demo Profe
            </v-chip>
          </div>

        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';

const router = useRouter();
const store = useAppStore();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isValid = ref(false);
const formRef = ref(null);

// Reglas de validación
const rules = {
  required: value => !!value || 'Aquest camp és obligatori.',
  email: value => /.+@.+\..+/.test(value) || 'El format del correu no és vàlid.'
};

const handleLogin = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const success = await store.login(email.value, password.value);
  if (success) {
    // Redirección basada en el Rol (Mayúsculas, como en el backend)
    const role = store.user.role;
    if (role === 'ADMIN') router.push('/admin');
    else if (role === 'CENTER') router.push('/centre');
    else if (role === 'PROFESSOR') router.push('/professor');
    else router.push('/'); // Fallback
  }
};

// --- CREDENCIALES REALES DEL SEED.JS ---
const fillDemo = (role) => {
  if (role === 'admin') {
    email.value = 'admin@enginy.cat';
    password.value = '123';
  } else if (role === 'center') {
    email.value = 'institut@exemple.cat'; // CORREGIDO (Antes pedralbes)
    password.value = '123';
  } else {
    email.value = 'profe@exemple.cat';
    password.value = '123';
  }
};
</script>

<style scoped>
/* IMAGEN DE FONDO */
.background-image {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop');
  background-size: cover;
  background-position: center;
  filter: grayscale(100%);
}

.background-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(135deg, rgba(0, 61, 92, 0.95) 0%, rgba(0, 40, 71, 0.85) 100%);
  z-index: 1;
}

.z-10 { z-index: 10; }
.login-wrapper { max-width: 550px; }
.leading-tight { line-height: 1.1; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }

/* ANIMACIONES */
.animate-fade-in { animation: fadeIn 0.8s ease-out; }
.animate-slide-up { animation: slideUp 0.8s ease-out 0.2s backwards; }
.animate-slide-down { animation: slideDown 0.8s ease-out; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }

/* INTERACCIONES */
.hover-underline:hover { text-decoration: underline !important; }
.btn-hover { transition: transform 0.2s, box-shadow 0.2s; }
.btn-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,61,92,0.3); }

/* DECORACIÓN */
.circle-decoration {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  z-index: 2;
}
.top-right { width: 300px; height: 300px; top: -100px; right: -50px; }
.bottom-left { width: 400px; height: 400px; bottom: -150px; left: -100px; }
</style>