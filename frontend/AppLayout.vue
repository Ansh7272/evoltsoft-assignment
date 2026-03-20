<template>
  <div class="flex h-screen bg-surface-50 overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-800">EV Charging</p>
          <p class="text-xs text-slate-500">Station Manager</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :class="
            $route.name === item.routeName
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
          "
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          {{ item.name }}
        </RouterLink>
      </nav>

      <!-- User card -->
      <div class="px-3 py-4 border-t border-slate-100">
        <div class="flex items-center gap-3 px-3 py-2">
          <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span class="text-xs font-semibold text-primary-700">{{ initials }}</span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium text-slate-800 truncate">{{ auth.userName }}</p>
            <p class="text-xs text-slate-500 truncate">{{ auth.user?.email }}</p>
          </div>
          <button
            class="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Logout"
            @click="handleLogout"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-black/40 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header class="flex items-center gap-4 px-6 py-4 bg-white border-b border-slate-200">
        <button
          class="lg:hidden p-2 -ml-2 rounded-md text-slate-500 hover:bg-slate-100"
          @click="sidebarOpen = !sidebarOpen"
        >
          <Bars3Icon class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-lg font-semibold text-slate-800">{{ currentPageTitle }}</h1>
        </div>
        <slot name="header-actions" />
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './auth.store.js';

// Inline SVG icon components
const IconDashboard = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, 
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 3v2m6-2v2m6-2v2M9 9h.01M9 12h4m-4 3h.01M9 18h.01m6-6v.01M15 9h.01M15 12h.01M15 15h.01M15 18h.01m-6-6h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }));

const IconStation = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, 
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' }));

const IconMap = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, 
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.553-.894L9 7.711v12.289zm0 0l6-3.611m0 0l5.447-2.724A1 1 0 0021 9.382v10.764a1 1 0 01-1.553.894L15 16.289v-12.289m0 0l-6 3.611m6-3.611L9 7.711' }));

const Bars3Icon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, 
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6h16M4 12h16M4 18h16' }));

const ArrowRightOnRectangleIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, 
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' }));
const navItems = [
  { name: 'Dashboard', to: '/dashboard', routeName: 'Dashboard', icon: IconDashboard },
  { name: 'Stations',  to: '/stations',  routeName: 'Stations',  icon: IconStation  },
  { name: 'Map View',  to: '/map',       routeName: 'Map',       icon: IconMap      },
];

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const sidebarOpen = ref(false);

const initials = computed(() => {
  const name = auth.userName || '';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
});

const currentPageTitle = computed(() => {
  const map = { Dashboard: 'Dashboard', Stations: 'Charging Stations', Map: 'Map View' };
  return map[route.name] || 'EV Charging Platform';
});

const handleLogout = async () => {
  await auth.logout();
  router.push({ name: 'Login' });
};
</script>
