<template>
  <v-container class="py-8 mw-1400">
    <h1 class="text-h4 font-weight-bold text-primary mb-2">Centre d'Informes</h1>
    <p class="text-body-1 text-grey mb-8">Exporta les dades clau del programa ENGINY.</p>

    <v-row>
      <!-- Opción 1: Catálogo PDF -->
      <v-col cols="12" md="6">
        <v-card class="rounded-lg h-100 d-flex flex-column">
          <v-card-text class="flex-grow-1">
            <v-icon size="48" color="secondary" class="mb-4">mdi-file-pdf-box</v-icon>
            <h2 class="text-h6 font-weight-bold">Catàleg de Tallers (PDF)</h2>
            <p class="text-body-2 text-grey-darken-1 mt-2">
              Genera un document PDF amb tots els tallers actius, les seves descripcions
              i modalitats. Ideal per a la difusió als centres.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              variant="flat"
              :loading="pdfLoading"
              @click="downloadPdf"
            >
              <v-icon start>mdi-download</v-icon>
              Descarregar PDF
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Opción 2: Solicitudes CSV -->
      <v-col cols="12" md="6">
        <v-card class="rounded-lg h-100 d-flex flex-column">
          <v-card-text class="flex-grow-1">
            <v-icon size="48" color="success" class="mb-4">mdi-file-excel</v-icon>
            <h2 class="text-h6 font-weight-bold">Informe de Sol·licituds (CSV)</h2>
            <p class="text-body-2 text-grey-darken-1 mt-2">
              Exporta un fitxer CSV amb totes les sol·licituds rebudes, incloent
              el centre, taller, puntuació IA i estat actual.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              variant="flat"
              :loading="csvLoading"
              @click="downloadCsv"
            >
              <v-icon start>mdi-download</v-icon>
              Exportar a CSV
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const pdfLoading = ref(false);
const csvLoading = ref(false);

// Descargar BLOB y forzar descarga en navegador
const downloadFile = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const downloadPdf = async () => {
  pdfLoading.value = true;
  try {
    const response = await api.getCatalogPdf();
    downloadFile(response.data, 'Cataleg_ENGINY.pdf', 'application/pdf');
  } catch (error) {
    alert("Error al descarregar el PDF.");
  } finally {
    pdfLoading.value = false;
  }
};

const downloadCsv = async () => {
  csvLoading.value = true;
  try {
    // Debes crear este endpoint que devuelva el CSV
    const response = await api.getRequestsCsv(); 
    downloadFile(response.data, 'Informe_Solicituds.csv', 'text/csv');
  } catch (error) {
    alert("Error al descarregar el CSV.");
  } finally {
    csvLoading.value = false;
  }
};
</script>

<style scoped>
.mw-1400 { max-width: 1400px; margin: 0 auto; }
</style>