<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-slate-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
          <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-slate-800">Create your account</h1>
        <p class="text-sm text-slate-500 mt-1">Start managing EV charging stations today</p>
      </div>

      <div class="card p-8">
        <form @submit.prevent="handleRegister" novalidate class="space-y-4">
          <div>
            <label for="name" class="label">Full name</label>
            <input id="name" v-model.trim="form.name" type="text" autocomplete="name"
              placeholder="Jane Doe" :class="['input', errors.name ? 'input-error' : '']" />
            <p v-if="errors.name" class="mt-1 text-xs text-red-600">{{ errors.name }}</p>
          </div>

          <div>
            <label for="email" class="label">Email address</label>
            <input id="email" v-model.trim="form.email" type="email" autocomplete="email"
              placeholder="you@example.com" :class="['input', errors.email ? 'input-error' : '']" />
            <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
          </div>

          <div>
            <label for="password" class="label">Password</label>
            <input id="password" v-model="form.password" type="password" autocomplete="new-password"
              placeholder="Min 8 chars, upper + lower + number"
              :class="['input', errors.password ? 'input-error' : '']" />
            <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
          </div>

          <div>
            <label for="confirm" class="label">Confirm password</label>
            <input id="confirm" v-model="form.confirmPassword" type="password" autocomplete="new-password"
              placeholder="Re-enter your password"
              :class="['input', errors.confirmPassword ? 'input-error' : '']" />
            <p v-if="errors.confirmPassword" class="mt-1 text-xs text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <button type="submit" class="btn-primary w-full py-2.5 mt-2" :disabled="auth.loading">
            <svg v-if="auth.loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ auth.loading ? 'Creating account…' : 'Create account' }}
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-slate-600">
          Already have an account?
          <RouterLink to="/login" class="text-primary-600 font-medium hover:underline">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './auth.store.js';

const auth = useAuthStore();
const router = useRouter();

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' });
const errors = reactive({ name: '', email: '', password: '', confirmPassword: '' });

const validate = () => {
  Object.keys(errors).forEach((k) => (errors[k] = ''));
  let valid = true;

  if (!form.name || form.name.length < 2) { errors.name = 'Name must be at least 2 characters'; valid = false; }
  if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) { errors.email = 'Valid email is required'; valid = false; }
  if (!form.password || form.password.length < 8) { errors.password = 'Password must be at least 8 characters'; valid = false; }
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Must contain uppercase, lowercase, and a number'; valid = false;
  }
  if (form.password !== form.confirmPassword) { errors.confirmPassword = 'Passwords do not match'; valid = false; }

  return valid;
};

const handleRegister = async () => {
  if (!validate()) return;
  const result = await auth.register(form);
  if (result.success) router.push('/dashboard');
};
</script>
