<template>
  <div class="card overflow-hidden">
    <!-- Loading skeleton -->
    <div v-if="loading" class="divide-y divide-slate-100">
      <div v-for="i in 5" :key="i" class="flex items-center gap-4 px-6 py-4 animate-pulse">
        <div class="h-4 bg-slate-200 rounded w-1/4"></div>
        <div class="h-4 bg-slate-200 rounded w-1/5"></div>
        <div class="h-4 bg-slate-200 rounded w-16"></div>
        <div class="h-4 bg-slate-200 rounded w-16"></div>
        <div class="ml-auto h-4 bg-slate-200 rounded w-20"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="!stations.length" class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <p class="text-slate-600 font-medium">No stations found</p>
      <p class="text-sm text-slate-400 mt-1">Try adjusting your filters or add a new station</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="table-th">Station</th>
            <th class="table-th">Location</th>
            <th class="table-th">Operator</th>
            <th class="table-th">Status</th>
            <th class="table-th">Connector</th>
            <th class="table-th">Power</th>
            <th class="table-th">Ports</th>
            <th class="table-th text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="station in stations"
            :key="station._id"
            class="hover:bg-slate-50 transition-colors group"
          >
            <td class="table-td">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <p class="font-medium text-slate-800 truncate max-w-[180px]">{{ station.name }}</p>
                  <p class="text-xs text-slate-400">{{ formatDate(station.createdAt) }}</p>
                </div>
              </div>
            </td>

            <td class="table-td">
              <p class="text-slate-700 truncate max-w-[160px]">
                {{ station.location?.city || station.location?.address || '—' }}
              </p>
              <p class="text-xs text-slate-400">
                {{ station.latitude?.toFixed(4) }}, {{ station.longitude?.toFixed(4) }}
              </p>
            </td>

            <td class="table-td">
              <div class="flex items-center gap-2">
                <span v-if="isOwnStation(station)" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700" title="You created this station">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  Your station
                </span>
                <span v-else class="text-slate-600">{{ station.operator?.name || 'Unknown' }}</span>
              </div>
            </td>

            <td class="table-td">
              <span :class="statusBadge(station.status)">
                <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDot(station.status)"></span>
                {{ capitalize(station.status) }}
              </span>
            </td>

            <td class="table-td">
              <span class="badge bg-slate-100 text-slate-700">{{ station.connectorType }}</span>
            </td>

            <td class="table-td font-medium">{{ station.powerOutput }} kW</td>

            <td class="table-td text-slate-500">{{ station.numberOfPorts }}</td>

            <td class="table-td text-right">
              <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  class="p-1.5 rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  title="Edit"
                  @click="$emit('edit', station)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  class="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete"
                  @click="$emit('delete', station)"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100">
      <p class="text-sm text-slate-500">
        Showing {{ (pagination.page - 1) * pagination.limit + 1 }}–{{ Math.min(pagination.page * pagination.limit, pagination.total) }}
        of {{ pagination.total }} stations
      </p>
      <div class="flex items-center gap-1">
        <button
          class="btn-secondary px-3 py-1.5 text-xs"
          :disabled="!pagination.hasPrevPage"
          @click="$emit('page-change', pagination.page - 1)"
        >
          Previous
        </button>
        <span class="text-sm text-slate-600 px-2">{{ pagination.page }} / {{ pagination.totalPages }}</span>
        <button
          class="btn-secondary px-3 py-1.5 text-xs"
          :disabled="!pagination.hasNextPage"
          @click="$emit('page-change', pagination.page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from './auth.store.js';

const authStore = useAuthStore();

defineProps({
  stations: { type: Array, default: () => [] },
  loading:  { type: Boolean, default: false },
  pagination: { type: Object, default: null },
});
defineEmits(['edit', 'delete', 'page-change']);

const isOwnStation = (station) => {
  return authStore.user?._id === station.operator?._id;
};

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const statusBadge = (status) => ({
  active:      'badge badge-active',
  inactive:    'badge badge-inactive',
  maintenance: 'badge badge-maintenance',
}[status] || 'badge badge-inactive');

const statusDot = (status) => ({
  active:      'bg-emerald-500',
  inactive:    'bg-slate-400',
  maintenance: 'bg-amber-500',
}[status] || 'bg-slate-400');
</script>
