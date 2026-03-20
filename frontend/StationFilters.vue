<template>
  <div class="card p-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      <!-- Search -->
      <div class="sm:col-span-2">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            v-model="local.search"
            type="text"
            placeholder="Search by name or city…"
            class="input pl-9"
            @input="debouncedEmit"
          />
        </div>
      </div>

      <!-- Status -->
      <select v-model="local.status" class="input" @change="emitFilters">
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="maintenance">Maintenance</option>
      </select>

      <!-- Connector Type -->
      <select v-model="local.connectorType" class="input" @change="emitFilters">
        <option value="">All connectors</option>
        <option v-for="ct in CONNECTOR_TYPES" :key="ct" :value="ct">{{ ct }}</option>
      </select>

      <!-- Min Power -->
      <input
        v-model.number="local.minPower"
        type="number"
        min="0"
        placeholder="Min kW"
        class="input"
        @change="emitFilters"
      />

      <!-- Max Power -->
      <input
        v-model.number="local.maxPower"
        type="number"
        min="0"
        placeholder="Max kW"
        class="input"
        @change="emitFilters"
      />

      <!-- My Stations Toggle -->
      <label class="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer">
        <input
          v-model="local.myStations"
          type="checkbox"
          class="rounded"
          @change="emitFilters"
        />
        <span class="text-sm text-slate-600">My Stations</span>
      </label>
    </div>

    <!-- Sort + Reset row -->
    <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">Sort by:</span>
        <select v-model="local.sortBy" class="input py-1 text-xs w-36" @change="emitFilters">
          <option value="createdAt">Date added</option>
          <option value="name">Name</option>
          <option value="powerOutput">Power output</option>
          <option value="status">Status</option>
        </select>
        <button
          class="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
          :title="local.sortOrder === 'asc' ? 'Ascending' : 'Descending'"
          @click="toggleSort"
        >
          <svg class="w-4 h-4 transition-transform" :class="local.sortOrder === 'asc' ? '' : 'rotate-180'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"/>
          </svg>
        </button>
      </div>

      <button v-if="hasActiveFilters" class="btn-ghost text-xs text-red-500 hover:text-red-600" @click="resetFilters">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
        Clear filters
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';

const CONNECTOR_TYPES = ['CCS', 'CHAdeMO', 'Type 1', 'Type 2', 'Tesla', 'GBT'];

const props = defineProps({
  modelValue: { type: Object, required: true },
});
const emit = defineEmits(['update:modelValue', 'change']);

const local = reactive({ ...props.modelValue });

watch(() => props.modelValue, (v) => Object.assign(local, v), { deep: true });

const hasActiveFilters = computed(() =>
  local.search || local.status || local.connectorType || local.minPower || local.maxPower || local.myStations,
);

let debounceTimer = null;
const debouncedEmit = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(emitFilters, 350);
};

const emitFilters = () => {
  emit('update:modelValue', { ...local });
  emit('change', { ...local });
};

const toggleSort = () => {
  local.sortOrder = local.sortOrder === 'asc' ? 'desc' : 'asc';
  emitFilters();
};

const resetFilters = () => {
  Object.assign(local, {
    search: '', status: '', connectorType: '', minPower: '', maxPower: '', myStations: false,
    sortBy: 'createdAt', sortOrder: 'desc',
  });
  emitFilters();
};
</script>
