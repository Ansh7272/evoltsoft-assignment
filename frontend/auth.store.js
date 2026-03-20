import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from './auth.api.js';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast();

  const user = ref(JSON.parse(localStorage.getItem('ev_user') || 'null'));
  const accessToken = ref(localStorage.getItem('ev_token') || null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const userName = computed(() => user.value?.name || '');

  const persistSession = (u, token) => {
    user.value = u;
    accessToken.value = token;
    localStorage.setItem('ev_user', JSON.stringify(u));
    localStorage.setItem('ev_token', token);
  };

  const setAccessToken = (token) => {
    accessToken.value = token;
    localStorage.setItem('ev_token', token);
  };

  const clearSession = () => {
    user.value = null;
    accessToken.value = null;
    localStorage.removeItem('ev_user');
    localStorage.removeItem('ev_token');
  };

  const register = async (payload) => {
    loading.value = true;
    try {
      const { data } = await authApi.register(payload);
      persistSession(data.data.user, data.data.accessToken);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      loading.value = false;
    }
  };

  const login = async (payload) => {
    loading.value = true;
    try {
      const { data } = await authApi.login(payload);
      persistSession(data.data.user, data.data.accessToken);
      toast.success(`Welcome back, ${data.data.user.name}!`);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Swallow — clear session regardless
    } finally {
      clearSession();
      toast.info('You have been logged out');
    }
  };

  const fetchMe = async () => {
    try {
      const { data } = await authApi.getMe();
      user.value = data.data.user;
      localStorage.setItem('ev_user', JSON.stringify(data.data.user));
    } catch {
      clearSession();
    }
  };

  return {
    user, accessToken, loading,
    isAuthenticated, isAdmin, userName,
    persistSession, setAccessToken, clearSession,
    register, login, logout, fetchMe,
  };
});
