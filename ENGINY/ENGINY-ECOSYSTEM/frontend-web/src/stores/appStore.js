import { defineStore } from 'pinia';
import api from '../services/api';
import { io } from 'socket.io-client';

export const useAppStore = defineStore('app', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        workshops: [], 
        myRequests: [], 
        notifications: [], 
        loading: false,
        authError: null,
        socket: null
    }),

    actions: {
        // --- AUTH ACTIONS ---
        async login(email, password) {
            this.loading = true;
            this.authError = null;
            try {
                const res = await api.login({ email, password });
                this.token = res.data.token;
                this.user = res.data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.initSocket();
                return true;
            } catch (error) {
                this.authError = error.response?.data?.message || 'Error de connexió';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async register(formData) {
            this.loading = true;
            try {
                return await api.register(formData);
            } finally {
                this.loading = false;
            }
        },

        // Cambiado a 'verify' para que coincida exactamente con tu VerifyView.vue
        async verify(email, code) {
            this.loading = true;
            try {
                const res = await api.verify({ email, code }); 
                return res.data;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            this.myRequests = [];
            this.notifications = [];
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (this.socket) this.socket.disconnect();
        },

        // --- DATA ACTIONS ---
        async fetchWorkshops() {
            this.loading = true;
            try {
                const res = await api.getWorkshops();
                this.workshops = res.data;
            } catch (error) {
                console.error("Error carregant tallers", error);
            } finally {
                this.loading = false;
            }
        },

        async fetchMyRequests() {
            if (!this.user) return;
            try {
                const res = await api.getMyRequests();
                this.myRequests = res.data;
            } catch (error) {
                console.error("Error carregant peticions", error);
            }
        },

        async submitRequest(payload) {
            try {
                await api.createRequest(payload);
                await this.fetchWorkshops(); 
                await this.fetchMyRequests(); 
                return true;
            } catch (error) {
                throw error.response?.data?.message || 'Error en la sol·licitud';
            }
        },

        async deleteRequest(id) {
            try {
                await api.deleteRequest(id);
                this.myRequests = this.myRequests.filter(r => r._id !== id);
                await this.fetchWorkshops(); 
                return true;
            } catch (error) {
                throw error;
            }
        },

        // --- SOCKET.IO ---
        initSocket() {
            if (this.socket || !this.token) return; 

            const SOCKET_URL = import.meta.env.VITE_API_URL ? 
                               import.meta.env.VITE_API_URL.replace('/api', '') : 
                               'http://localhost:3000';

            this.socket = io(SOCKET_URL, {
                auth: { token: this.token }
            });

            this.socket.on('connect', () => {
                console.log('🟢 Socket connectat');
            });

            this.socket.on('notification', (data) => {
                this.notifications.unshift({
                    id: Date.now(),
                    ...data,
                    read: false
                });
                
                if (data.title === 'IA Finalitzada') {
                    this.fetchMyRequests();
                }
            });
        }
    }
});