<template>
  <div class="min-h-screen bg-surface-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="text-8xl font-bold text-primary-200 select-none">404</div>
      <h1 class="text-2xl font-bold text-slate-800 mt-4">Page not found</h1>
      <p class="text-slate-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
      <RouterLink to="/dashboard" class="btn-primary mt-8 inline-flex">
        ← Back to Dashboard
      </RouterLink>
    </div>
  </div>
</template>
