import API from './axios';

// --- 🆔 KYC Services ---
export const sendAadhaarOTP = (adhaarNumber) => API.post('/kyc/aadhaar-otp', { adhaarNumber });
export const verifyAadhaarOTP = (data) => API.post('/kyc/aadhaar-verify', data);

// --- 💰 Loan Operations ---
// Frontend mein ab applyLoan(loanRequest) call karna
export const applyLoan = (loanData) => API.post('/loans', loanData); 

// Customer ke apne loans dekhne ke liye (Dashboard Tracking)
export const getMyLoans = () => API.get('/loans'); 

// --- 🧑‍ा Field Officer & Admin Operations ---
export const getAllLoans = () => API.get('/admin/all-loans');
export const approveLoan = (id) => API.put(`/admin/approve-loan/${id}`);
export const getOfficerDashboard = () => API.get('/user/my-dashboard');

// --- 💳 Payments & EMI ---
export const getAdminStats = () => API.get('/admin/stats');
export const getCollectionReport = () => API.get('/admin/collection-report');
export const createEMIOrder = (loanId) => API.post('/payments/create-emi-order', { loanId });
export const verifyPayment = (paymentData) => API.post('/payments/verify', paymentData);

// --- 🔍 Global Search ---
export const globalSearch = (query) => API.get(`/admin/search?q=${query}`);