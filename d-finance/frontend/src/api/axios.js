import axios from 'axios';

const API = axios.create({
  // Vite ke liye import.meta.env use karein
 // Vite mein 'process.env' nahi chalta. Ise aise likho:
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;