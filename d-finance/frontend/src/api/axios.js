import axios from 'axios';

const API = axios.create({
  // Vercel par VITE_API_URL environment variable se uthayega
  // Render ka default port 10000 hota hai agar local pe chalayein toh
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:10000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout (KYC/CIBIL fetch mein thoda time lagta hai)
});

// 1. Request Interceptor: Token attach karne ke liye
API.interceptors.request.use(
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

// 2. Response Interceptor: Error handling ke liye (Very Important)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agar Backend 401 (Unauthorized) bhejta hai (Token Expired)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Seedha login page par bhej do
    }
    
    // Custom error message for UI
    const message = error.response?.data?.error || "Network error. Please check your connection.";
    return Promise.reject(message);
  }
);

export default API;