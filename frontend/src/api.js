import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
};

export const urlAPI = {
  createUrl: (urlData) => api.post('/urls', urlData),
  getMyUrls: () => api.get('/urls/me'),
  getUrlStats: (shortCode) => api.get(`/urls/${shortCode}/stats`),
  updateUrl: (shortCode, data) => api.patch(`/urls/${shortCode}`, data),
  deleteUrl: (shortCode) => api.delete(`/urls/${shortCode}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
