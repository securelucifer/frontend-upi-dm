import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const paymentAPI = axios.create({
    baseURL: `${API_BASE_URL}/payment`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Response interceptor
paymentAPI.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('💳 Payment API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default {
    // Get merchant UPI
    getMerchantUPI: () => paymentAPI.get('/merchant-upi'),

    // Create payment transaction (returns deep link)
    createPayment: (paymentData) => paymentAPI.post('/create', paymentData),

    // Check payment status by transaction ID
    checkPaymentStatus: (tid) => paymentAPI.get(`/status/${tid}`),

    // Verify payment manually
    verifyPayment: (verificationData) => paymentAPI.post('/verify', verificationData)
};
