import apiClient from './client.js';

export const stationsApi = {
  getAll: (params = {}) => apiClient.get('/stations', { params }),
  getById: (id) => apiClient.get(`/stations/${id}`),
  create: (payload) => apiClient.post('/stations', payload),
  update: (id, payload) => apiClient.put(`/stations/${id}`, payload),
  remove: (id) => apiClient.delete(`/stations/${id}`),
  getStats: () => apiClient.get('/stations/stats'),
  getNearby: (lat, lng, radius = 10) =>
    apiClient.get('/stations', { params: { lat, lng, radius } }),
};
