<template>
  <div class="card p-5 flex items-start gap-4">
    <div :class="['w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconBg]">
      <slot name="icon" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="text-sm text-slate-500">{{ label }}</p>
      <p class="text-2xl font-bold text-slate-800 mt-0.5">{{ value }}</p>
      <p v-if="sub" class="text-xs text-slate-400 mt-1">{{ sub }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label:   { type: String, required: true },
  value:   { type: [String, Number], required: true },
  sub:     { type: String, default: '' },
  iconBg:  { type: String, default: 'bg-primary-50' },
});
</script>
