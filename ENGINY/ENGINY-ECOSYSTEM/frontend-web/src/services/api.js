import axios from 'axios';

// Detectar URL automáticamente (Vite) o usar localhost por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor: Inyectar Token en cada petición automáticamente
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// Interceptor: Si el token caduca (Error 401), cerrar sesión
api.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});

export default {
    // --- AUTENTICACIÓN ---
    register(userData) {
        return api.post('/auth/register', userData);
    },
    login(credentials) {
        return api.post('/auth/login', credentials);
    },
    verify(data) {
        return api.post('/auth/verify', data);
    },

    // --- TALLERES (Catálogo) ---
    getWorkshops() {
        return api.get('/workshops');
    },
    getCatalogPdf() {
        return api.get('/workshops/pdf', { responseType: 'blob' });
    },
    createWorkshop(data) {
        return api.post('/workshops', data);
    },

    // --- SOLICITUDES (CENTRO) ---
    createRequest(requestData) {
        return api.post('/requests', requestData);
    },
    getMyRequests() {
        // Peticiones del centro logueado
        return api.get('/requests/my-requests');
    },
    deleteRequest(id) {
        return api.delete(`/requests/${id}`);
    },

    // --- ADMINISTRACIÓN (ADMIN) ---
    getAdminRequests() {
        // Obtener TODAS las solicitudes del sistema
        return api.get('/requests/admin/all');
    },
    updateRequestStatusAdmin(id, statusData) {
        // Aprobar/Rechazar manualmente
        return api.patch(`/requests/${id}/status`, statusData);
    },
    getRequestsCsv() {
        // Descargar CSV (Extra)
        return api.get('/requests/admin/csv', { responseType: 'blob' });
    },
    triggerIA() {
        // Disparar el Worker de IA manualmente
        return api.post('/admin/run-ia'); 
    },

    // --- SESIONES (PROFESOR) ---
    getMySessions() {
        return api.get('/sessions/my-sessions');
    },
    updateAttendance(sessionId, data) {
        return api.put(`/sessions/${sessionId}/attendance`, data);
    }
};