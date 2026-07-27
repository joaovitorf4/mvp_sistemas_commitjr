import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// Intercepta as requisições antes de saírem do frontend
api.interceptors.request.use(async config => {
  // Busca o token salvo no navegador
  const token = localStorage.getItem('@MVP:token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;