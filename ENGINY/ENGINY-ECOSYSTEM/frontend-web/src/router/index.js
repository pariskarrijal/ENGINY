import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '../stores/appStore';

// Layout Principal
import CEBLayout from '../components/CEBLayout.vue';

// Vistas Públicas
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import VerifyView from '../views/VerifyView.vue';

// Vistas Privadas (Lazy Loading)
const CenterDashboard = () => import('../views/CenterDashboard.vue');
const CatalogPage = () => import('../views/CatalogPage.vue');
const CenterChecklist = () => import('../views/CenterChecklist.vue');
const CenterRequests = () => import('../views/CenterRequests.vue');

const AdminDashboard = () => import('../views/AdminDashboard.vue');
const AdminWorkshops = () => import('../views/AdminWorkshops.vue');
const AdminRequests = () => import('../views/AdminRequests.vue');
const AdminReports = () => import('../views/AdminReports.vue');

const ProfessorDashboard = () => import('../views/ProfessorDashboard.vue');

const routes = [
  // RUTAS PÚBLICAS (Sin Layout, pantalla completa)
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', name: 'Register', component: RegisterView },
  { path: '/verify', name: 'Verify', component: VerifyView },

  // RUTAS PRIVADAS (Con Layout de Navegación)
  {
    path: '/',
    component: CEBLayout,
    children: [
      // ROL CENTRO
      { path: 'centre', name: 'CenterHome', component: CenterDashboard, meta: { role: 'CENTER' } },
      { path: 'centre/cataleg', name: 'Catalog', component: CatalogPage, meta: { role: 'CENTER' } },
      { path: 'centre/checklist', name: 'Checklist', component: CenterChecklist, meta: { role: 'CENTER' } },
      { path: 'centre/requests', name: 'CenterRequests', component: CenterRequests, meta: { role: 'CENTER' } },

      // ROL ADMIN
      { path: 'admin', name: 'AdminHome', component: AdminDashboard, meta: { role: 'ADMIN' } },
      { path: 'admin/tallers', name: 'AdminWorkshops', component: AdminWorkshops, meta: { role: 'ADMIN' } },
      { path: 'admin/peticions', name: 'AdminRequests', component: AdminRequests, meta: { role: 'ADMIN' } },
      { path: 'admin/informes', name: 'AdminReports', component: AdminReports, meta: { role: 'ADMIN' } },

      // ROL PROFESOR
      { path: 'professor', name: 'ProfessorHome', component: ProfessorDashboard, meta: { role: 'PROFESSOR' } }
    ]
  },
  
  // Redirección por defecto
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// GUARD DE NAVEGACIÓN (Protección de rutas)
router.beforeEach((to, from, next) => {
  const store = useAppStore();
  const publicPages = ['Login', 'Register', 'Verify'];
  const authRequired = !publicPages.includes(to.name);

  // 1. Si requiere auth y no hay usuario, al login
  if (authRequired && !store.token) {
    return next('/login');
  }

  // 2. Si ya estás logueado e intentas ir al login, te manda a tu dashboard
  if (to.name === 'Login' && store.token) {
    if (store.user?.role === 'ADMIN') return next('/admin');
    if (store.user?.role === 'CENTER') return next('/centre');
    return next('/professor');
  }

  // 3. Verificación de Rol Específico
  if (to.meta.role && store.user?.role !== to.meta.role) {
    // Si intentas entrar donde no debes, te manda a tu casa
    if (store.user?.role === 'ADMIN') return next('/admin');
    if (store.user?.role === 'CENTER') return next('/centre');
    if (store.user?.role === 'PROFESSOR') return next('/professor');
    return next('/login');
  }

  next();
});

export default router;