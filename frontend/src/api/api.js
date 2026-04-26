import axios from 'axios';

const api = axios.create({
  baseURL: '/api' // Bas yahan change karo, har jagah ho jayega
});

export default api;