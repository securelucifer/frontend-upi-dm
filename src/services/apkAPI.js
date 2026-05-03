// src/services/apkAPI.js
import axios from 'axios';

// Base URL for your backend API - FIXED
const API_BASE_URL = import.meta.env.VITE_API_URL;



// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('🚀 APK API Request:', config.method?.toUpperCase(), config.url);
        console.log('Full URL:', `${config.baseURL}${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ APK API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for debugging and error handling
api.interceptors.response.use(
    (response) => {
        console.log('✅ APK API Response:', response.config.url, response.status);
        console.log('Response data:', response.data);
        return response;
    },
    (error) => {
        console.error('❌ APK API Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// Check APK availability and status
export const checkApkStatus = async () => {
    try {
        console.log('Checking APK status...');
        const response = await api.get('/api/apk/apk-status');
        console.log('APK Status Response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error in checkApkStatus:', error);
        throw new Error(error.response?.data?.error || error.message || 'Failed to check APK status');
    }
};

// Format file size utility
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Direct APK download
export const downloadApkDirect = async () => {
    try {
        console.log('Starting direct APK download...');
        const status = await checkApkStatus();

        if (!status.available) {
            throw new Error('APK file is not available for download');
        }

        const downloadUrl = `${API_BASE_URL}/download/apk`;
        console.log('Download URL:', downloadUrl);

        // Open download URL
        window.open(downloadUrl, '_blank');

        return {
            success: true,
            message: 'APK download started! Check your downloads folder.',
            method: 'direct'
        };
    } catch (error) {
        console.error('Error in downloadApkDirect:', error);
        throw error;
    }
};

// Download APK as blob
export const downloadApkBlob = async () => {
    try {
        console.log('Starting blob APK download...');
        const status = await checkApkStatus();

        if (!status.available) {
            throw new Error('APK file is not available for download');
        }

        const blobResponse = await axios({
            method: 'GET',
            url: `${API_BASE_URL}/download-apk`,
            responseType: 'blob',
            timeout: 60000,
        });

        const blob = new Blob([blobResponse.data], {
            type: 'application/vnd.android.package-archive'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'DMart-App.apk';
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, 1000);

        return {
            success: true,
            message: 'APK downloaded successfully via blob!',
            method: 'blob',
            size: blob.size
        };
    } catch (error) {
        console.error('Error in downloadApkBlob:', error);
        throw error;
    }
};

// Main download function that auto-selects best method
export const downloadApk = async (method = 'auto') => {
    try {
        const validation = await validateApkDownload();

        if (!validation.canDownload) {
            throw new Error('APK is not available for download');
        }

        let result;

        switch (method) {
            case 'direct': {
                result = await downloadApkDirect();
                break;
            }
            case 'blob': {
                result = await downloadApkBlob();
                break;
            }
            case 'auto':
            default: {
                // Auto-select based on browser capabilities
                const userAgent = navigator.userAgent.toLowerCase();
                const isAndroid = userAgent.includes('android');

                if (isAndroid) {
                    result = await downloadApkDirect();
                } else {
                    result = await downloadApkBlob();
                }
                break;
            }
        }

        return result;
    } catch (error) {
        console.error('Error in downloadApk:', error);
        throw error;
    }
};

// Utility function to validate APK availability before download
export const validateApkDownload = async () => {
    try {
        const status = await checkApkStatus();

        const validation = {
            available: status.available,
            canDownload: status.available && !!status.fileInfo,
            fileSize: status.fileInfo?.size || 0,
            lastModified: status.fileInfo?.modified || null,
            recommendedMethod: 'direct'
        };

        return validation;
    } catch (error) {
        console.error('Error in validateApkDownload:', error);
        return {
            available: false,
            canDownload: false,
            error: error.message
        };
    }
};

export default api;
