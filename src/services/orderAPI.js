import axios from 'axios';

const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const orderAPI = axios.create({
    baseURL: `${API_BASE_URL}/orders`,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for auth token
orderAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
orderAPI.interceptors.response.use(
    (response) => response.data,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default {
    createOrder: (orderData) => orderAPI.post('/create', orderData),
    getOrderById: (orderId) => orderAPI.get(`/${orderId}`),
    getUserOrders: (userId, page = 1, limit = 10) => 
        orderAPI.get(`/user/${userId}?page=${page}&limit=${limit}`)
};
