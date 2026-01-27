// src/services/api.js
import axios from 'axios';

// Crea una instancia de axios con la configuración base
const api = axios.create({
  // Usa la variable de entorno o localhost por defecto
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token (si existe) a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // O usa tu store de Pinia aquí si prefieres
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;