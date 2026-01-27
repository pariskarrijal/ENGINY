import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary: '#003D5C', // Color Consorci
                    secondary: '#E3001B', // Color Gencat
                    background: '#F5F5F5'
                }
            }
        }
    }
});

const app = createApp(App);

app.use(createPinia()); // PINIA
app.use(router);
app.use(vuetify);

app.mount('#app');