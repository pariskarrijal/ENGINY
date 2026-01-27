<template>
  <v-container class="fill-height bg-grey-lighten-3">
    <v-row justify="center">
      <v-col cols="12" md="4">
        <v-card class="pa-6 elevation-4 text-center">
          <v-icon size="64" color="primary">mdi-email-lock</v-icon>
          <h2 class="mt-4">Verificació</h2>
          <p class="mb-4">Introdueix el codi de 6 dígits enviat a <strong>{{ email }}</strong></p>

          <v-otp-input 
            v-model="code" 
            length="6" 
            variant="outlined"
            class="mb-4 justify-center"
          ></v-otp-input>

          <v-btn 
            block 
            color="success" 
            size="large" 
            :disabled="code.length < 6" 
            :loading="loading"
            @click="handleVerify"
          >
            Verificar Compte
          </v-btn>
          
          <div class="mt-4">
             <v-btn variant="text" size="small" to="/login">Tornar al Login</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '../stores/appStore';

const route = useRoute();
const router = useRouter();
const store = useAppStore();

// Recogemos el email de la URL (query string)
const email = ref(route.query.email || '');
const code = ref('');
const loading = ref(false);

const handleVerify = async () => {
  if (code.value.length < 6) return;
  
  loading.value = true;
  try {
    // Usamos 'code.value' directamente del v-otp-input
    await store.verify(email.value, code.value);
    alert("Verificat! Ja pots entrar.");
    router.push('/login');
  } catch (e) {
    alert("Error: " + (e.response?.data?.message || "Codi incorrecte"));
  } finally {
    loading.value = false;
  }
};
</script>