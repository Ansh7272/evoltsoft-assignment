import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './auth.store.js';


const LoginView      = () => import('./LoginView.vue');
const RegisterView   = () => import('./RegisterView.vue');
const DashboardView  = () => import('./DashboardView.vue');
const StationsView   = () => import('./StationsView.vue');
const MapView        = () => import('./MapView.vue');
const NotFoundView   = () => import('./NotFoundView.vue');

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true, title: 'Login' },
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true, title: 'Create Account' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true, title: 'Dashboard' },
  },
  {
    path: '/stations',
    name: 'Stations',
    component: StationsView,
    meta: { requiresAuth: true, title: 'Charging Stations' },
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView,
    meta: { requiresAuth: true, title: 'Map View' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { title: '404 — Not Found' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' };
  },
});


router.beforeEach((to, from, next) => {
  const auth = useAuthStore();

  // Update page title
  document.title = to.meta.title ? `${to.meta.title} | EV Charging` : 'EV Charging Platform';

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresGuest && auth.isAuthenticated) {
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
