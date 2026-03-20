import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { stationsApi } from './stations.api.js';
import { useToast } from 'vue-toastification';

export const useStationsStore = defineStore('stations', () => {
  const toast = useToast();

  const stations   = ref([]);
  const selected   = ref(null);
  const loading    = ref(false);
  const submitting = ref(false);
  const stats      = ref(null);
  const pagination = ref({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const filters    = ref({
    status: '',
    connectorType: '',
    minPower: '',
    maxPower: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const hasStations = computed(() => stations.value.length > 0);
  const activeCount = computed(() => stations.value.filter((s) => s.status === 'active').length);

  const fetchStations = async (page = 1, options = {}) => {
    loading.value = true;
    try {
      const params = {
        page,
        limit: options.limit || pagination.value.limit,
        ...Object.fromEntries(
          Object.entries(filters.value).filter(([, v]) => v !== '' && v !== null),
        ),
      };
      const { data } = await stationsApi.getAll(params);
      stations.value = data.data;
      pagination.value = data.pagination;
    } catch (err) {
      console.error('Fetch stations error:', err);
      toast.error(err.response?.data?.message || 'Failed to fetch stations');
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const fetchById = async (id) => {
    loading.value = true;
    try {
      const { data } = await stationsApi.getById(id);
      selected.value = data.data;
      return data.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Station not found');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await stationsApi.getStats();
      stats.value = data.data;
    } catch {
      // non-critical
    }
  };

  const createStation = async (payload) => {
    submitting.value = true;
    try {
      const { data } = await stationsApi.create(payload);
      stations.value.unshift(data.data);
      toast.success('Charging station created successfully!');
      return { success: true, data: data.data };
    } catch (err) {
      const errors = err.response?.data?.errors;
      const msg = err.response?.data?.message || 'Failed to create station';
      toast.error(msg);
      return { success: false, message: msg, errors };
    } finally {
      submitting.value = false;
    }
  };

  const updateStation = async (id, payload) => {
    submitting.value = true;
    try {
      const { data } = await stationsApi.update(id, payload);
      const idx = stations.value.findIndex((s) => s._id === id);
      if (idx !== -1) stations.value[idx] = data.data;
      if (selected.value?._id === id) selected.value = data.data;
      toast.success('Station updated successfully!');
      return { success: true, data: data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update station';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      submitting.value = false;
    }
  };

  const deleteStation = async (id) => {
    try {
      await stationsApi.remove(id);
      stations.value = stations.value.filter((s) => s._id !== id);
      pagination.value.total = Math.max(0, pagination.value.total - 1);
      toast.success('Station deleted successfully');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete station';
      toast.error(msg);
      return { success: false };
    }
  };

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const resetFilters = () => {
    filters.value = {
      status: '', connectorType: '', minPower: '', maxPower: '',
      search: '', sortBy: 'createdAt', sortOrder: 'desc',
    };
  };

  return {
    stations, selected, loading, submitting, stats, pagination, filters,
    hasStations, activeCount,
    fetchStations, fetchById, fetchStats,
    createStation, updateStation, deleteStation,
    setFilters, resetFilters,
  };
});
