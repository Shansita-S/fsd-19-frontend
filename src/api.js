import axios from 'axios';

const normalizedEnvApiUrl = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace(/\/+$/, '')
  : '';

const API_URL = normalizedEnvApiUrl
  ? (normalizedEnvApiUrl.endsWith('/api') ? normalizedEnvApiUrl : `${normalizedEnvApiUrl}/api`)
  : 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Meeting services
export const meetingService = {
  getAllMeetings: () => api.get('/meetings'),
  getMeeting: (id) => api.get(`/meetings/${id}`),
  createMeeting: (data) => api.post('/meetings', data),
  updateMeeting: (id, data) => api.put(`/meetings/${id}`, data),
  deleteMeeting: (id) => api.delete(`/meetings/${id}`),
  findBestSlot: (data) => api.post('/meetings/find-best-slot', data),
  addAgenda: (id, agendaItems) => api.post(`/meetings/${id}/agenda`, { agendaItems }),
  addNote: (id, content) => api.post(`/meetings/${id}/notes`, { content }),
  addRecording: (id, recordingUrl) => api.post(`/meetings/${id}/recording`, { recordingUrl })
};

// Notification services
export const notificationService = {
  getAll: () => api.get('/notifications'),
  checkReminders: () => api.get('/notifications/check-reminders'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// User services
export const userService = {
  getParticipants: () => api.get('/users/participants')
};

export default api;
