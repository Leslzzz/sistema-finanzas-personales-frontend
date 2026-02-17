import api from './axios';
import type { LoginSchema, RegisterSchema } from '../models/Auth.Schema';

export const authService = {
  login: async (data: LoginSchema) => {
    const response = await api.post('/api/login/', data);
    return response.data; 
  },

  register: async (data: RegisterSchema) => {
    const response = await api.post('/api/register/', data);
    return response.data;
  },
};

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/api/dashboard/home/');
    return response.data;
  }
};