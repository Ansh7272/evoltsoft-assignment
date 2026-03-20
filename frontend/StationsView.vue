<template>
  <AppLayout>
    <template #header-actions>
      <button class="btn-primary" @click="openCreate">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Add Station
      </button>
    </template>

    <div class="space-y-4 animate-fade-in">
      <!-- Filters -->
      <StationFilters v-model="filters" @change="onFiltersChange" />

      <!-- Results summary -->
      <div class="flex items-center justify-between">
        <p class="text-sm text-slate-500">
          <template v-if="stationsStore.loading">Loading…</template>
          <template v-else>
            {{ stationsStore.pagination.total }} station{{ stationsStore.pagination.total !== 1 ? 's' : '' }} found
          </template>
        </p>
      </div>

      <!-- Table -->
      <StationTable
        :stations="stationsStore.stations"
        :loading="stationsStore.loading"
        :pagination="stationsStore.pagination"
        @edit="openEdit"
        @delete="openDelete"
        @page-change="onPageChange"
      />
    </div>

    <!-- Create / Edit modal -->
    <StationModal
      v-if="showModal"
      :station="editingStation"
      @close="closeModal"
      @saved="onSaved"
    />

    <!-- Delete confirm dialog -->
    <ConfirmDialog
      v-if="deletingStation"
      title="Delete Station"
      :message="`Are you sure you want to delete '${deletingStation.name}'? This action cannot be undone.`"
      confirm-label="Delete Station"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="deletingStation = null"
    />
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import AppLayout from './AppLayout.vue';
import StationFilters from './StationFilters.vue';
import StationTable from './StationTable.vue';
import StationModal from './StationModal.vue';
import ConfirmDialog from './ConfirmDialog.vue';
import { useStationsStore } from './stations.store.js';

const stationsStore = useStationsStore();


const showModal = ref(false);
const editingStation = ref(null);

const openCreate = () => { editingStation.value = null; showModal.value = true; };
const openEdit = (station) => { editingStation.value = station; showModal.value = true; };
const closeModal = () => { showModal.value = false; editingStation.value = null; };
const onSaved = () => { closeModal(); stationsStore.fetchStations(stationsStore.pagination.page); };


const deletingStation = ref(null);
const deleteLoading = ref(false);

const openDelete = (station) => { deletingStation.value = station; };
const confirmDelete = async () => {
  deleteLoading.value = true;
  await stationsStore.deleteStation(deletingStation.value._id);
  deleteLoading.value = false;
  deletingStation.value = null;
};


const filters = reactive({ ...stationsStore.filters });

const onFiltersChange = (newFilters) => {
  stationsStore.setFilters(newFilters);
  stationsStore.fetchStations(1);
};

const onPageChange = (page) => stationsStore.fetchStations(page);

onMounted(() => stationsStore.fetchStations(1));
</script>
