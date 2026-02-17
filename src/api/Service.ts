// import api from './axios';
import type { LoginSchema, RegisterSchema } from '../models/Auth.Schema';
import axios from 'axios';

export const authService = {
  login: async (data: LoginSchema) => {
    const response = await axios.post('https://sistema-finanzas-personales.up.railway.app/api/login/', data);
    return response.data; 
  },

  register: async (data: RegisterSchema) => {
    const response = await axios.post('https://sistema-finanzas-personales.up.railway.app/api/register/', data);
    return response.data;
  },
};

export const dashboardService = {
  getSummary: async () => {
    const response = await axios.get('https://sistema-finanzas-personales.up.railway.app/api/dashboard/home/');
    return response.data;
  }
};