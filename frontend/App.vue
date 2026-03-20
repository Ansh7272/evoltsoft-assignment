<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './auth.store.js';

const auth = useAuthStore();

// Re-hydrate user profile on app load if token exists
onMounted(async () => {
  if (auth.accessToken) {
    await auth.fetchMe();
  }
});
</script>
