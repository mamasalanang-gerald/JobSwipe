import axios from 'axios';
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 
        'application/json'
    },
})

api.interceptors.request.use((config) => {
     const token = useAuthStore.getState().token;
     if (token) config.headers.Authorization = `Bearer ${token}`;
     return config;
});

api.interceptors.response.use(
  (res) => res.data?.data ?? res.data,
  (err) => Promise.reject(err.response?.data ?? err),
);

