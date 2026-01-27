<template>
  <v-app>
    <!-- BARRA SUPERIOR -->
    <v-app-bar color="primary" elevation="2" >
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      
      <div class="d-flex flex-column ml-2">
        <span class="text-h6 font-weight-bold">ENGINY HUB</span>
        <span class="text-caption" style="margin-top: -4px; opacity: 0.8;">Consorci d'Educació de Barcelona</span>
      </div>

      <v-spacer></v-spacer>

      <!-- Usuario y Logout -->
      <div class="mr-4 text-right hidden-xs">
        <div class="font-weight-bold">{{ store.user?.name }}</div>
        <div class="text-caption">{{ getRoleLabel(store.user?.role) }}</div>
      </div>
      
      <v-btn icon color="secondary" @click="handleLogout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- MENÚ LATERAL (Navigation Drawer) -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item 
          prepend-avatar="https://randomuser.me/api/portraits/lego/1.jpg" 
          :title="store.user?.name" 
          :subtitle="store.user?.email"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <!-- MENÚ CENTROS -->
        <div v-if="store.user?.role === 'CENTER'">
          <v-list-subheader>GESTIÓ CENTRE</v-list-subheader>
          <v-list-item to="/centre" prepend-icon="mdi-view-dashboard" title="Panell Principal"></v-list-item>
          <v-list-item to="/centre/cataleg" prepend-icon="mdi-book-open-variant" title="Catàleg de Tallers"></v-list-item>
        </div>

        <!-- MENÚ ADMIN -->
        <div v-if="store.user?.role === 'ADMIN'">
          <v-list-subheader>ADMINISTRACIÓ</v-list-subheader>
          <v-list-item to="/admin" prepend-icon="mdi-shield-crown" title="Panell de Control"></v-list-item>
          <v-list-item to="/admin/tallers" prepend-icon="mdi-database-edit" title="Gestió Tallers"></v-list-item>
          <v-list-item to="/admin/peticions" prepend-icon="mdi-inbox-full" title="Peticions i Assignacions"></v-list-item>
          <v-list-item to="/admin/informes" prepend-icon="mdi-chart-bar" title="Informes"></v-list-item>
        </div>

        <!-- MENÚ PROFESOR -->
        <div v-if="store.user?.role === 'PROFESSOR'">
          <v-list-subheader>DOCÈNCIA</v-list-subheader>
          <v-list-item to="/professor" prepend-icon="mdi-calendar-check" title="Els Meus Tallers"></v-list-item>
        </div>
      </v-list>
    </v-navigation-drawer>

    <!-- CONTENIDO DE LA VISTA -->
    <v-main class="bg-grey-lighten-4">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useRouter } from 'vue-router';

const store = useAppStore();
const router = useRouter();
const drawer = ref(false);

const getRoleLabel = (role) => {
  if (role === 'ADMIN') return 'Administrador';
  if (role === 'CENTER') return 'Centre Educatiu';
  if (role === 'PROFESSOR') return 'Professorat';
  return 'Usuari';
}

const handleLogout = () => {
  store.logout();
  router.push('/login');
}
</script>