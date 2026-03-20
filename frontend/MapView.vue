<template>
  <AppLayout>
    <div class="space-y-4 animate-fade-in">
      <!-- Map controls -->
      <div class="card p-4 flex flex-wrap items-center gap-3">
        <div class="flex items-center gap-2 flex-1 min-w-[200px]">
          <svg class="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Filter stations on map…" class="input flex-1" @input="filterMarkers" />
        </div>
        <div class="flex items-center gap-2">
          <select v-model="statusFilter" class="input py-2" @change="filterMarkers">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button class="btn-secondary" @click="locateMe" title="My location">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            My Location
          </button>
          <button class="btn-secondary" @click="fitAllMarkers">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
            Fit All
          </button>
        </div>
      </div>

      <!-- Map + sidebar layout -->
      <div class="flex gap-4" style="height: calc(100vh - 280px); min-height: 500px;">
        <!-- Map -->
        <div class="flex-1 card overflow-hidden relative">
          <div ref="mapContainer" class="w-full h-full rounded-xl"></div>
          <!-- Loading overlay -->
          <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/70 rounded-xl">
            <div class="flex flex-col items-center gap-2">
              <div class="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-sm text-slate-600">Loading stations…</p>
            </div>
          </div>
          <!-- Station count badge -->
          <div class="absolute top-3 left-3 z-[1000] bg-white rounded-lg shadow px-3 py-1.5 text-xs font-medium text-slate-700">
            {{ filteredStations.length }} station{{ filteredStations.length !== 1 ? 's' : '' }}
          </div>
        </div>

        <!-- Station detail sidebar -->
        <div
          v-if="selectedStation"
          class="w-72 card p-5 flex-shrink-0 overflow-y-auto animate-slide-up"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <button class="btn-ghost p-1" @click="selectedStation = null">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <h3 class="font-semibold text-slate-800 text-base leading-snug">{{ selectedStation.name }}</h3>
          <span :class="statusBadge(selectedStation.status)" class="mt-2 inline-flex">
            {{ capitalize(selectedStation.status) }}
          </span>

          <div class="mt-4 space-y-3 text-sm">
            <DetailRow label="Connector" :value="selectedStation.connectorType" />
            <DetailRow label="Power Output" :value="`${selectedStation.powerOutput} kW`" />
            <DetailRow label="Ports" :value="selectedStation.numberOfPorts" />
            <DetailRow label="Price" :value="selectedStation.pricePerKwh ? `₹${selectedStation.pricePerKwh}/kWh` : 'Free'" />
            <DetailRow v-if="selectedStation.location?.address" label="Address" :value="selectedStation.location.address" />
            <DetailRow v-if="selectedStation.location?.city" label="City" :value="selectedStation.location.city" />
            <DetailRow
              label="Coordinates"
              :value="`${selectedStation.latitude?.toFixed(5)}, ${selectedStation.longitude?.toFixed(5)}`"
            />
          </div>

          <div v-if="selectedStation.amenities?.length" class="mt-4">
            <p class="text-xs text-slate-500 mb-2">Amenities</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="a in selectedStation.amenities" :key="a" class="badge bg-slate-100 text-slate-600">{{ a }}</span>
            </div>
          </div>

          <RouterLink
            to="/stations"
            class="btn-primary w-full mt-5 text-sm"
          >
            Manage in List View
          </RouterLink>
        </div>
      </div>

      <!-- Legend -->
      <div class="card p-3 flex items-center gap-5 text-xs text-slate-600">
        <span class="font-medium">Legend:</span>
        <div v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></div>
          {{ item.label }}
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, h } from 'vue';
import AppLayout from './AppLayout.vue';
import { useStationsStore } from './stations.store.js';
import { useToast } from 'vue-toastification';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet is imported from npm package
const stationsStore = useStationsStore();
const toast = useToast();
const mapContainer = ref(null);
const selectedStation = ref(null);
const searchQuery = ref('');
const statusFilter = ref('');
const loading = ref(false);

let map = null;
const markers = new Map(); // stationId → L.Marker

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
const statusBadge = (status) => ({
  active:      'badge badge-active',
  inactive:    'badge badge-inactive',
  maintenance: 'badge badge-maintenance',
}[status] || 'badge badge-inactive');

const MARKER_COLORS = {
  active:      '#16a34a',
  inactive:    '#64748b',
  maintenance: '#d97706',
};

const legend = [
  { label: 'Active',      color: MARKER_COLORS.active },
  { label: 'Inactive',    color: MARKER_COLORS.inactive },
  { label: 'Maintenance', color: MARKER_COLORS.maintenance },
];


const filteredStations = computed(() => {
  return stationsStore.stations.filter((s) => {
    const matchesSearch = !searchQuery.value ||
      s.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      s.location?.city?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesStatus = !statusFilter.value || s.status === statusFilter.value;
    return matchesSearch && matchesStatus;
  });
});


const createIcon = (status) => {
  const color = MARKER_COLORS[status] || MARKER_COLORS.inactive;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24S32 26 32 16C32 7.163 24.837 0 16 0z" fill="${color}"/>
      <circle cx="16" cy="16" r="7" fill="white"/>
      <path d="M17.5 10v6h4l-7 9v-6h-4l7-9z" fill="${color}"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};


const initMap = () => {
  if (!mapContainer.value || map) return;
  
  map = L.map(mapContainer.value, {
    center: [20.5937, 78.9629], // India
    zoom: 5,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);
};

const addMarkers = () => {
  if (!map) return;

  // Remove old markers not in filtered list
  const filteredIds = new Set(filteredStations.value.map((s) => s._id));
  markers.forEach((marker, id) => {
    if (!filteredIds.has(id)) { map.removeLayer(marker); markers.delete(id); }
  });

  filteredStations.value.forEach((station) => {
    const lat = station.latitude ?? station.location?.coordinates?.[1];
    const lng = station.longitude ?? station.location?.coordinates?.[0];
    if (!lat || !lng) return;

    if (markers.has(station._id)) {
      // Update icon in case status changed
      markers.get(station._id).setIcon(createIcon(station.status));
      return;
    }

    const icon = createIcon(station.status);
    if (!icon) return;
    
    const marker = L.marker([lat, lng], { icon })
      .addTo(map)
      .on('click', () => { selectedStation.value = station; });

    marker.bindTooltip(station.name, { permanent: false, direction: 'top' });
    markers.set(station._id, marker);
  });
};

const fitAllMarkers = () => {
  if (!map || markers.size === 0) return;
  const group = L.featureGroup([...markers.values()]);
  map.fitBounds(group.getBounds().pad(0.1));
};

const filterMarkers = () => addMarkers();

const locateMe = () => {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    map?.setView([coords.latitude, coords.longitude], 13);
  });
};

onMounted(async () => {
  loading.value = true;
  try {
    await nextTick();
    initMap();
    
    // Fetch stations with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    await Promise.race([
      stationsStore.fetchStations(1, { limit: 100 }),
      timeoutPromise
    ]);
    
    addMarkers();
    if (markers.size > 0) {
      setTimeout(fitAllMarkers, 300);
    } else {
      toast.info('No stations available. Create one to see on the map.');
    }
  } catch (error) {
    console.error('Map initialization error:', error);
    toast.error('Failed to load stations. Please try again.');
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (map) { map.remove(); map = null; }
  markers.clear();
});

watch(filteredStations, () => addMarkers(), { deep: true });

const DetailRow = {
  props: ['label', 'value'],
  template: `
    <div class="flex items-start justify-between gap-2">
      <span class="text-slate-400 flex-shrink-0">{{ label }}</span>
      <span class="text-slate-700 text-right font-medium">{{ value }}</span>
    </div>`,
};
</script>
