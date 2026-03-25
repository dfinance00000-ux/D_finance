import API from './axios';

export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const signupUser = (userData) => API.post('/auth/signup', userData);

// Profile fetch karne ke liye (Optional)
export const getProfile = () => API.get('/auth/profile');