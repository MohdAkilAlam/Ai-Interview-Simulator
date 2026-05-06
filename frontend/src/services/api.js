import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
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

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);
export const changePassword = (data) => API.post('/auth/change-password', data);

// Interview
export const startInterview = (data) => API.post('/interview/start', data);
export const submitAnswer = (data) => API.post('/interview/answer', data);
export const completeInterview = (id) => API.post(`/interview/complete/${id}`);
export const getInterviewSession = (id) => API.get(`/interview/session/${id}`);
export const getInterviewHistory = () => API.get('/interview/history');
export const deleteInterview = (id) => API.delete(`/interview/delete/${id}`);
export const getInterviewStats = () => API.get('/interview/stats');

export default API;
