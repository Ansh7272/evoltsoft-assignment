<template>
  <AppLayout>
    <div class="space-y-6 animate-fade-in">
      <!-- Welcome banner -->
      <div class="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white">
        <h2 class="text-xl font-semibold">Good {{ greeting }}, {{ auth.userName }} 👋</h2>
        <p class="text-primary-100 text-sm mt-1">Here's what's happening with your charging network</p>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Stations" :value="statsData.total" sub="All time" icon-bg="bg-primary-50">
          <template #icon>
            <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </template>
        </StatsCard>

        <StatsCard label="Active Stations" :value="statsData.active" sub="Currently online" icon-bg="bg-emerald-50">
          <template #icon>
            <svg class="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </template>
        </StatsCard>

        <StatsCard label="Avg Power Output" :value="statsData.avgPower ? statsData.avgPower.toFixed(1) + ' kW' : '—'" sub="Across all stations" icon-bg="bg-amber-50">
          <template #icon>
            <svg class="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
            </svg>
          </template>
        </StatsCard>

        <StatsCard label="Total Ports" :value="statsData.totalPorts || 0" sub="Combined capacity" icon-bg="bg-violet-50">
          <template #icon>
            <svg class="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"/>
            </svg>
          </template>
        </StatsCard>
      </div>

      <!-- Connector breakdown + recent stations -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Connector breakdown -->
        <div class="card p-5">
          <h3 class="text-sm font-semibold text-slate-700 mb-4">Connectors by Type</h3>
          <div v-if="stationsStore.loading" class="space-y-3">
            <div v-for="i in 4" :key="i" class="h-8 bg-slate-100 rounded animate-pulse"></div>
          </div>
          <div v-else-if="connectorBreakdown.length" class="space-y-3">
            <div v-for="item in connectorBreakdown" :key="item._id" class="flex items-center gap-3">
              <span class="text-xs text-slate-500 w-16 flex-shrink-0">{{ item._id }}</span>
              <div class="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  class="h-full bg-primary-500 rounded-full transition-all duration-500"
                  :style="{ width: `${(item.count / statsData.total) * 100}%` }"
                ></div>
              </div>
              <span class="text-xs font-medium text-slate-700 w-6 text-right">{{ item.count }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-slate-400 text-center py-4">No data available</p>
        </div>

        <!-- Recent stations -->
        <div class="lg:col-span-2 card">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 class="text-sm font-semibold text-slate-700">Recent Stations</h3>
            <RouterLink to="/stations" class="text-xs text-primary-600 hover:underline font-medium">View all →</RouterLink>
          </div>
          <div v-if="stationsStore.loading" class="divide-y divide-slate-100">
            <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-5 py-3 animate-pulse">
              <div class="w-8 h-8 rounded-lg bg-slate-200"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                <div class="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
          <div v-else-if="recentStations.length" class="divide-y divide-slate-100">
            <div v-for="s in recentStations" :key="s._id" class="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
              <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-800 truncate">{{ s.name }}</p>
                <p class="text-xs text-slate-400">{{ s.connectorType }} · {{ s.powerOutput }} kW</p>
              </div>
              <span :class="statusBadge(s.status)" class="flex-shrink-0">{{ capitalize(s.status) }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-slate-400 text-center py-8">No stations yet. <RouterLink to="/stations" class="text-primary-600">Add one →</RouterLink></p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import AppLayout from './AppLayout.vue';
import StatsCard from './StatsCard.vue';
import { useAuthStore } from './auth.store.js';
import { useStationsStore } from './stations.store.js';

const auth = useAuthStore();
const stationsStore = useStationsStore();

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
});

const statsData = computed(() => {
  const s = stationsStore.stats?.summary || {};
  const statusBreakdown = stationsStore.stats?.statusBreakdown || [];
  return {
    total: s.total || 0,
    active: statusBreakdown.find((x) => x._id === 'active')?.count || 0,
    avgPower: s.avgPower || 0,
    totalPorts: s.totalPorts || 0,
  };
});

const connectorBreakdown = computed(() => stationsStore.stats?.connectorBreakdown || []);
const recentStations = computed(() => stationsStore.stations.slice(0, 5));

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const statusBadge = (status) => ({
  active:      'badge badge-active',
  inactive:    'badge badge-inactive',
  maintenance: 'badge badge-maintenance',
}[status] || 'badge badge-inactive');

onMounted(async () => {
  await Promise.all([
    stationsStore.fetchStats(),
    stationsStore.fetchStations(1),
  ]);
});
</script>
