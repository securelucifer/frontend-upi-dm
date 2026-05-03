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
       // console.log('🚀 API Request:', config.method?.toUpperCase(), config.url, config.params);
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
        console.log('✅ API Response:', response.config.url, response.status, response.data);
        return response;
    },
    (error) => {
        console.error('❌ API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// ====================== BANNER API FUNCTIONS ======================

// Get all banners (with filtering)
export const getBanners = async (params = {}) => {
    try {
        const response = await api.get('/banners', { params });
        return response.data;
    } catch (error) {
        console.error('Error in getBanners:', error);
        throw error;
    }
};

// Get all active banners only
export const getActiveBanners = async (params = {}) => {
    try {
        const response = await api.get('/banners', {
            params: { ...params, active: 'true' }
        });
        return response.data;
    } catch (error) {
        console.error('Error in getActiveBanners:', error);
        throw error;
    }
};

// Get banner by ID
export const getBannerById = async (id) => {
    try {
        const response = await api.get(`/banners/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error in getBannerById:', error);
        throw error;
    }
};

// Get banners by order (sorted)
export const getBannersByOrder = async (params = {}) => {
    try {
        const response = await api.get('/banners', {
            params: { ...params, sortBy: 'order', sortOrder: 'asc', active: 'true' }
        });
        return response.data;
    } catch (error) {
        console.error('Error in getBannersByOrder:', error);
        throw error;
    }
};

// Get featured banners (if you have a featured field)
export const getFeaturedBanners = async (params = {}) => {
    try {
        const response = await api.get('/banners', {
            params: { ...params, featured: 'true', active: 'true' }
        });
        return response.data;
    } catch (error) {
        console.error('Error in getFeaturedBanners:', error);
        throw error;
    }
};

export default api;
