import axios from 'axios';

// 1. Backend Base URL
const api = axios.create({
  baseURL: '/api', 
});

// 2. Request Interceptor (Auto-Token Attachment)
api.interceptors.request.use(
  (config) => {
    // 🟢 FIX: Pehle check karo Admin token hai ya Normal User token
    // Hum dono ko check kar rahe hain taaki ye file har jagah kaam kare
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token');

    // Agar URL me '/admin' aa raha hai toh adminToken ko priority do
    const token = config.url.includes('/admin') ? (adminToken || userToken) : (userToken || adminToken);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;