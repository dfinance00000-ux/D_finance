import axios from 'axios';

const API = axios.create({
  // Vite mein 'import.meta.env' use hota hai
  baseURL: import.meta.env.VITE_API_URL || 'https://d-finance-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000, // 20 seconds (KYC/Aadhaar OTP mein kabhi kabhi delay hota hai)
});

// Request Interceptor: Token attach karne ke liye
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Auth Errors handle karne ke liye
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    // Backend ka error message return karein
    return Promise.reject(error.response?.data?.error || "Connection Error");
  }
);

export default API;