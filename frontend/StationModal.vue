<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ isEditing ? 'Edit Station' : 'Add New Station' }}
          </h2>
          <button class="btn-ghost p-2 -mr-2" @click="$emit('close')">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" novalidate class="px-6 py-5 space-y-5">
          <!-- Name -->
          <div>
            <label class="label">Station Name *</label>
            <input v-model.trim="form.name" type="text" placeholder="e.g. Green Park EV Hub"
              :class="['input', fieldError('name')]" />
            <FieldError :msg="errors.name" />
          </div>

          <!-- Location -->
          <fieldset class="border border-slate-200 rounded-lg p-4">
            <legend class="text-sm font-medium text-slate-700 px-1">Location</legend>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <div>
                <label class="label">Latitude *</label>
                <input v-model.number="form.location.coordinates[1]" type="number" step="0.000001"
                  placeholder="e.g. 28.6139" :class="['input', fieldError('lat')]" />
                <FieldError :msg="errors.lat" />
              </div>
              <div>
                <label class="label">Longitude *</label>
                <input v-model.number="form.location.coordinates[0]" type="number" step="0.000001"
                  placeholder="e.g. 77.2090" :class="['input', fieldError('lng')]" />
                <FieldError :msg="errors.lng" />
              </div>
              <div class="sm:col-span-2">
                <label class="label">Address</label>
                <input v-model.trim="form.location.address" type="text" placeholder="Street address"
                  class="input" />
              </div>
              <div>
                <label class="label">City</label>
                <input v-model.trim="form.location.city" type="text" placeholder="City" class="input" />
              </div>
              <div>
                <label class="label">State</label>
                <input v-model.trim="form.location.state" type="text" placeholder="State" class="input" />
              </div>
            </div>
          </fieldset>

          <!-- Station details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label class="label">Status</label>
              <select v-model="form.status" class="input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div>
              <label class="label">Connector Type *</label>
              <select v-model="form.connectorType" :class="['input', fieldError('connectorType')]">
                <option value="" disabled>Select type</option>
                <option v-for="ct in CONNECTOR_TYPES" :key="ct" :value="ct">{{ ct }}</option>
              </select>
              <FieldError :msg="errors.connectorType" />
            </div>

            <div>
              <label class="label">Power Output (kW) *</label>
              <input v-model.number="form.powerOutput" type="number" min="1" max="1000" step="0.1"
                placeholder="e.g. 50" :class="['input', fieldError('powerOutput')]" />
              <FieldError :msg="errors.powerOutput" />
            </div>

            <div>
              <label class="label">Number of Ports</label>
              <input v-model.number="form.numberOfPorts" type="number" min="1" max="50"
                placeholder="e.g. 4" class="input" />
            </div>

            <div>
              <label class="label">Price per kWh (₹)</label>
              <input v-model.number="form.pricePerKwh" type="number" min="0" step="0.01"
                placeholder="e.g. 12.50" class="input" />
            </div>
          </div>

          <!-- Amenities -->
          <div>
            <label class="label">Amenities</label>
            <div class="flex flex-wrap gap-2 mt-1">
              <label v-for="a in AMENITIES" :key="a"
                class="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" :value="a" v-model="form.amenities"
                  class="rounded text-primary-600 focus:ring-primary-500" />
                {{ a }}
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" class="btn-secondary" @click="$emit('close')">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="stations.submitting">
              <svg v-if="stations.submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {{ stations.submitting ? 'Saving…' : (isEditing ? 'Save Changes' : 'Create Station') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useStationsStore } from './stations.store.js';

const CONNECTOR_TYPES = ['CCS', 'CHAdeMO', 'Type 1', 'Type 2', 'Tesla', 'GBT'];
const AMENITIES = ['WiFi', 'Restrooms', 'Café', 'Parking', 'Shopping', 'Restaurant', '24/7'];

const props = defineProps({
  station: { type: Object, default: null },
});
const emit = defineEmits(['close', 'saved']);

const stations = useStationsStore();
const isEditing = computed(() => !!props.station);

const defaultForm = () => ({
  name: '',
  location: { coordinates: [0, 0], address: '', city: '', state: '', country: 'India' },
  status: 'active',
  connectorType: '',
  powerOutput: null,
  numberOfPorts: 1,
  pricePerKwh: 0,
  amenities: [],
});

const form = reactive(defaultForm());
const errors = reactive({});

// Populate form when editing
watch(() => props.station, (station) => {
  if (station) {
    form.name = station.name;
    form.location = { ...station.location, coordinates: [...(station.location?.coordinates || [0, 0])] };
    form.status = station.status;
    form.connectorType = station.connectorType;
    form.powerOutput = station.powerOutput;
    form.numberOfPorts = station.numberOfPorts;
    form.pricePerKwh = station.pricePerKwh;
    form.amenities = [...(station.amenities || [])];
  }
}, { immediate: true });

const fieldError = (field) => errors[field] ? 'input-error' : '';

const validate = () => {
  Object.keys(errors).forEach((k) => delete errors[k]);
  let valid = true;

  if (!form.name || form.name.length < 3) { errors.name = 'Name must be at least 3 characters'; valid = false; }
  if (!form.location.coordinates[1] || form.location.coordinates[1] < -90 || form.location.coordinates[1] > 90) {
    errors.lat = 'Valid latitude (-90 to 90) required'; valid = false;
  }
  if (!form.location.coordinates[0] || form.location.coordinates[0] < -180 || form.location.coordinates[0] > 180) {
    errors.lng = 'Valid longitude (-180 to 180) required'; valid = false;
  }
  if (!form.connectorType) { errors.connectorType = 'Connector type is required'; valid = false; }
  if (!form.powerOutput || form.powerOutput < 1) { errors.powerOutput = 'Power output must be at least 1 kW'; valid = false; }

  return valid;
};

const handleSubmit = async () => {
  if (!validate()) return;

  const result = isEditing.value
    ? await stations.updateStation(props.station._id, form)
    : await stations.createStation(form);

  if (result.success) emit('saved', result.data);
};

// FieldError helper component inline
const FieldError = {
  props: ['msg'],
  template: '<p v-if="msg" class="mt-1 text-xs text-red-600">{{ msg }}</p>',
};
</script>
