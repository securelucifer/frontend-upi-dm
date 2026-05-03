import axios from 'axios';

// Base URL for your backend API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        //console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.params);
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
    (response) => {
        // console.log('✅ API Response:', response.config.url, response.status, response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ====================== PRODUCT API FUNCTIONS ======================
export const getProducts = async (params = {}) => {
    try {
        const response = await api.get('/products', { params });
        return response.data;
    } catch (error) {
        console.error('Error in getProducts:', error);
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await api.get(`/products/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error in getProductById:', error);
        throw error;
    }
};

export const getFeaturedProducts = async (params = {}) => {
    try {
        const response = await api.get('/products/featured', { params });
        return response.data;
    } catch (error) {
        console.error('Error in getFeaturedProducts:', error);
        throw error;
    }
};

export const getTopRatedProducts = async (params = {}) => {
    try {
        const response = await api.get('/products/top-rated', { params });
        return response.data;
    } catch (error) {
        console.error('Error in getTopRatedProducts:', error);
        throw error;
    }
};

export const getTopDeals = async (params = {}) => {
    try {
        const response = await api.get('/products/top-deals', { params });
        return response.data;
    } catch (error) {
        console.error('Error in getTopDeals:', error);
        throw error;
    }
};

export const getSimilarProducts = async (id) => {
    try {
        const response = await api.get(`/products/${id}/similar`);
        return response.data;
    } catch (error) {
        console.error('Error in getSimilarProducts:', error);
        throw error;
    }
};

export const searchProducts = async (query, params = {}) => {
    try {
        const response = await api.get('/products', {
            params: { ...params, search: query }
        });
        return response.data;
    } catch (error) {
        console.error('Error in searchProducts:', error);
        throw error;
    }
};

// ====================== ORDER API FUNCTIONS ======================

// Create new order
export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/order/createOrder', orderData);
        return response.data;
    } catch (error) {
        console.error('Error in createOrder:', error);
        throw error;
    }
};




// ====================== PAYMENT API FUNCTIONS ======================

// Get merchant UPI
export const getMerchantUPI = async () => {
    try {
        const response = await api.get('/payment/merchant-upi');
        return response.data;
    } catch (error) {
        console.error('Error in getMerchantUPI:', error);
        throw error;
    }
};

// Create payment transaction (exactly like PHP)
export const createPayment = async (paymentData) => {
    try {
        const response = await api.post('/payment/create', paymentData);
        return response.data;
    } catch (error) {
        console.error('Error in createPayment:', error);
        throw error;
    }
};

// Check payment status
export const checkPaymentStatus = async (tid) => {
    try {
        const response = await api.get(`/payment/status/${tid}`);
        return response.data;
    } catch (error) {
        console.error('Error in checkPaymentStatus:', error);
        throw error;
    }
};

// Verify payment
export const verifyPayment = async (verificationData) => {
    try {
        const response = await api.post('/payment/verify', verificationData);
        return response.data;
    } catch (error) {
        console.error('Error in verifyPayment:', error);
        throw error;
    }
};








// Get all orders (with optional filtering)
export const getAllOrders = async (params = {}) => {
    try {
        const { userId, status, page = 1, limit = 10 } = params;

        let url = '/order/orders';
        if (userId) {
            url += `/${userId}`;
        }

        const queryParams = { page, limit };
        if (status) queryParams.status = status;

        const response = await api.get(url, { params: queryParams });
        return response.data;
    } catch (error) {
        console.error('Error in getAllOrders:', error);
        throw error;
    }
};

// Get orders by user ID
export const getUserOrders = async (userId, params = {}) => {
    try {
        const { status, page = 1, limit = 10 } = params;

        const queryParams = { page, limit };
        if (status) queryParams.status = status;

        const response = await api.get(`/order/orders/${userId}`, { params: queryParams });
        return response.data;
    } catch (error) {
        console.error('Error in getUserOrders:', error);
        throw error;
    }
};

// Get single order by ID
export const getOrderById = async (orderId) => {
    try {
        const response = await api.get(`/order/order/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error in getOrderById:', error);
        throw error;
    }
};

// Get order by order number
export const getOrderByNumber = async (orderNumber) => {
    try {
        const response = await api.get(`/order/order/number/${orderNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error in getOrderByNumber:', error);
        throw error;
    }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
    try {
        const response = await api.put(`/order/order/${orderId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        throw error;
    }
};

// Get orders with specific status
export const getOrdersByStatus = async (status, params = {}) => {
    try {
        const { userId, page = 1, limit = 10 } = params;
        return await getAllOrders({ userId, status, page, limit });
    } catch (error) {
        console.error('Error in getOrdersByStatus:', error);
        throw error;
    }
};

// ====================== ADDRESS & CARD API FUNCTIONS ======================

// Save delivery address
export const saveAddress = async (addressData) => {
    try {
        const response = await api.post('/saveAddress', addressData);
        return response.data;
    } catch (error) {
        console.error('Error in saveAddress:', error);
        throw error;
    }
};

// Get user addresses
export const getUserAddresses = async (userId = null) => {
    try {
        const url = userId ? `/addresses/${userId}` : '/addresses';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error in getUserAddresses:', error);
        throw error;
    }
};

// Save card details
export const saveCard = async (cardData) => {
    try {
        const response = await api.post('/saveCard', cardData);
        return response.data;
    } catch (error) {
        console.error('Error in saveCard:', error);
        throw error;
    }
};

// Get user cards
export const getUserCards = async (userId = null) => {
    try {
        const url = userId ? `/cards/${userId}` : '/cards';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error in getUserCards:', error);
        throw error;
    }
};

// ====================== ORDER UTILITY FUNCTIONS ======================

// Cancel order (update status to cancelled)
export const cancelOrder = async (orderId) => {
    try {
        return await updateOrderStatus(orderId, 'cancelled');
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        throw error;
    }
};

// Get order history for user
export const getOrderHistory = async (userId, page = 1, limit = 10) => {
    try {
        return await getUserOrders(userId, { page, limit });
    } catch (error) {
        console.error('Error in getOrderHistory:', error);
        throw error;
    }
};

// Get recent orders
export const getRecentOrders = async (limit = 5) => {
    try {
        return await getAllOrders({ page: 1, limit });
    } catch (error) {
        console.error('Error in getRecentOrders:', error);
        throw error;
    }
};

export default api;
