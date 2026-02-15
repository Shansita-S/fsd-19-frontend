import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  findBestSlot: (data) => api.post('/meetings/find-best-slot', data)
};

// Extended Meeting services
export const meetingsService = {
  getAll: (params) => api.get('/meetings', { params }),
  getById: (id) => api.get(`/meetings/${id}`),
  create: (data) => api.post('/meetings', data),
  update: (id, data) => api.put(`/meetings/${id}`, data),
  delete: (id) => api.delete(`/meetings/${id}`),
  findOptimalTimes: (data) => api.post('/meetings/smart-schedule', data),
  addAgenda: (id, agendaItems) => api.post(`/meetings/${id}/agenda`, { agendaItems }),
  addNote: (id, note) => api.post(`/meetings/${id}/notes`, note),
  submitFeedback: (id, feedback) => api.post(`/meetings/${id}/feedback`, feedback),
  updateStatus: (id, status) => api.put(`/meetings/${id}/status`, { status }),
  respondToInvitation: (id, response) => api.put(`/meetings/${id}/respond`, { response })
};

// User services
export const userService = {
  getParticipants: () => api.get('/users/participants')
};

// Extended User services
export const usersService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/users/profile', data),
  updatePreferences: (data) => api.put('/users/preferences', data),
  getParticipants: () => api.get('/users/participants')
};

// Action Items services
export const actionItemsService = {
  getAll: (params) => api.get('/action-items', { params }),
  getById: (id) => api.get(`/action-items/${id}`),
  getOverdue: () => api.get('/action-items/overdue'),
  getStats: () => api.get('/action-items/stats/summary'),
  create: (data) => api.post('/action-items', data),
  update: (id, data) => api.put(`/action-items/${id}`, data),
  updateProgress: (id, data) => api.put(`/action-items/${id}/progress`, data),
  delete: (id) => api.delete(`/action-items/${id}`)
};

// Analytics services
export const analyticsService = {
  getDashboard: (period) => api.get('/analytics/dashboard', { params: { period } }),
  getHealthScore: () => api.get('/analytics/health-score'),
  getProductivity: () => api.get('/analytics/productivity'),
  getTrends: () => api.get('/analytics/trends'),
  generate: (period) => api.post('/analytics/generate', { period })
};

// Notifications services
export const notificationsService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  clearAll: () => api.delete('/notifications/clear-all'),
  updatePreferences: (data) => api.post('/notifications/preferences', data)
};

export default api;
