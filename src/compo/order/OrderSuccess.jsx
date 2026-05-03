import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
    ShoppingCart,
    LocalShipping,
    Star,
    Home,
    PhoneAndroid,
    Download,
    Error,
    CloudDownload,
    Refresh,
    CheckCircle
} from '@mui/icons-material';

import {
    fetchApkStatus,
    downloadApk,
    downloadApkBlob,
    clearError,
    clearDownloadStatus
} from '../../store/slices/apkSlice';

import { formatFileSize } from '../../services/apkAPI';
import useMetaPixel from '../../hooks/useMetaPixel'; // Add Meta Pixel hook

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Add Meta Pixel tracking hook
    const { trackPurchase } = useMetaPixel();

    // Redux state
    const {
        available,
        fileInfo,
        loading: checking,
        downloading,
        error,
        downloadSuccess,
        downloadMessage,
        lastChecked
    } = useSelector((state) => state.apk);

    const { orderData } = location.state || {};

    useEffect(() => {
        dispatch(fetchApkStatus());
        dispatch(clearDownloadStatus());

        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Track Purchase event when order success page loads
    useEffect(() => {
        if (orderData && orderData.finalTotal) {
            // Extract items data for tracking
            let contentIds = [];
            let contentNames = [];
            let totalValue = orderData.finalTotal;

            // If items are available in orderData
            if (orderData.items && orderData.items.length > 0) {
                contentIds = orderData.items.map(item => item.id);
                contentNames = orderData.items.map(item => item.name);
            }

            // Track Purchase event with Meta Pixel
            trackPurchase({
                content_ids: contentIds,
                content_names: contentNames,
                content_type: 'product',
                num_items: orderData.productCount || orderData.items?.length || 1,
                value: totalValue,
                currency: 'INR'
            });

            console.log('📊 Meta Pixel: Purchase tracked on Order Success page');
            console.log('📊 Order Details:', {
                orderNumber: orderData.orderNumber,
                totalAmount: totalValue,
                itemCount: contentIds.length
            });

            // Track custom order completion event
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('trackCustom', 'OrderComplete', {
                    order_id: orderData.orderNumber || orderData.orderId,
                    value: totalValue,
                    currency: 'INR',
                    payment_method: orderData.paymentMethod || 'card',
                    status: orderData.status || 'pending'
                });
                console.log('📊 Meta Pixel: OrderComplete custom event tracked');
            }
        }
    }, [orderData, trackPurchase]);

    useEffect(() => {
        if (downloadSuccess && downloadMessage) {
            showDownloadSuccess(downloadMessage);

            // Track app download as custom event
            if (typeof window !== 'undefined' && window.fbq) {
                window.fbq('trackCustom', 'AppDownload', {
                    download_method: 'success_page',
                    order_id: orderData?.orderNumber,
                    currency: 'INR'
                });
                console.log('📊 Meta Pixel: AppDownload tracked');
            }

            const timer = setTimeout(() => {
                dispatch(clearDownloadStatus());
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [downloadSuccess, downloadMessage, dispatch, orderData]);

    const showDownloadSuccess = (message = 'APK download started! Check your downloads folder.') => {
        const toast = document.createElement('div');
        toast.className = 'fixed top-2 right-2 sm:top-4 sm:right-4 bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 animate-pulse max-w-[280px] sm:max-w-sm text-xs sm:text-sm';
        toast.innerHTML = `
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
            </svg>
            <span class="break-words leading-tight">${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.transition = 'opacity 0.3s ease-out';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    };

    const showErrorToast = (message) => {
        const toast = document.createElement('div');
        toast.className = 'fixed top-2 right-2 sm:top-4 sm:right-4 bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 max-w-[280px] sm:max-w-sm text-xs sm:text-sm';
        toast.innerHTML = `
            <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
            <span class="break-words leading-tight">${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.transition = 'opacity 0.3s ease-out';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    };

    const handleDownloadAPK = () => {
        if (!available) {
            showErrorToast('APK file is currently not available. Please try again later.');
            return;
        }

        // Track download attempt as custom event
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', 'DownloadAttempt', {
                download_type: 'primary',
                order_id: orderData?.orderNumber,
                currency: 'INR'
            });
            console.log('📊 Meta Pixel: DownloadAttempt tracked (primary)');
        }

        dispatch(downloadApk());
    };

    const handleDownloadAPKBlob = () => {
        if (!available) {
            showErrorToast('APK file is currently not available.');
            return;
        }

        // Track download attempt as custom event
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', 'DownloadAttempt', {
                download_type: 'alternative',
                order_id: orderData?.orderNumber,
                currency: 'INR'
            });
            console.log('📊 Meta Pixel: DownloadAttempt tracked (alternative)');
        }

        dispatch(downloadApkBlob());
    };

    const handleRefreshStatus = () => {
        // Track refresh action as custom event
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', 'RefreshAppStatus', {
                order_id: orderData?.orderNumber,
                currency: 'INR'
            });
            console.log('📊 Meta Pixel: RefreshAppStatus tracked');
        }

        dispatch(clearError());
        dispatch(fetchApkStatus());
    };

    // Track continue shopping action
    const handleContinueShopping = () => {
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', 'ContinueShopping', {
                source: 'order_success',
                order_id: orderData?.orderNumber,
                currency: 'INR'
            });
            console.log('📊 Meta Pixel: ContinueShopping tracked');
        }

        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-2 sm:py-4 lg:py-8">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">

                    {/* Order Details Card */}
                    {orderData && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-6 lg:p-8"
                        >
                            <h3 className="text-sm sm:text-lg lg:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                                <ShoppingCart className="mr-2 sm:mr-3 text-blue-600 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                                <span>Order Summary</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                                    <p className="text-gray-500 text-xs sm:text-sm mb-1">Total Amount</p>
                                    <p className="font-bold text-sm sm:text-lg lg:text-xl text-green-600 break-words">
                                        ₹{orderData.finalTotal?.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                                    <p className="text-gray-500 text-xs sm:text-sm mb-1">Status</p>
                                    <p className="font-bold text-sm sm:text-lg text-orange-600">
                                        PENDING
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                                    <p className="text-gray-500 text-xs sm:text-sm mb-1">Order Date</p>
                                    <p className="font-bold text-sm sm:text-lg text-gray-700">
                                        {new Date().toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Main Message Card */}
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-2xl p-4 sm:p-8 lg:p-12 border-t-4 border-green-500"
                    >
                        <div className="text-center mb-4 sm:mb-8">
                            <h2 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 break-words px-2">
                                Please Confirm Your Order! 📱
                            </h2>
                            <div className="w-16 sm:w-20 lg:w-24 h-0.5 sm:h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto"></div>
                        </div>

                        <div className="space-y-3 sm:space-y-6 text-center">
                            <p className="text-xs sm:text-base lg:text-lg xl:text-xl text-gray-700 leading-relaxed break-words px-2">
                                Thank you for visiting us and making your first purchase! Your Order is Still{' '}
                                <span className="font-bold text-orange-600">Pending</span>{' '}
                                Kindly Download Our App and Confirm Your Order. We look forward to seeing you again.
                            </p>

                            <div className="bg-orange-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-l-4 border-orange-400 mx-2">
                                <p className="text-xs sm:text-sm lg:text-base text-gray-800 font-medium leading-relaxed break-words"
                                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                    आपका ऑर्डर अभी भी पेंडिंग है, कृपया हमारा ऐप डाउनलोड करें और अपने ऑर्डर की पुष्टि करें।
                                </p>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-6 rounded-xl sm:rounded-2xl mx-2">
                                <p className="text-xs sm:text-sm lg:text-base text-gray-700 font-semibold break-words">
                                    It's our way of saying thanks for joining our family. ❤️
                                </p>
                            </div>

                            {/* Download Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="mt-4 sm:mt-8"
                            >
                                <div className="rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8">
                                    <h3 className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold mb-3 sm:mb-4 text-center break-words">
                                        Download DMart App Now! 📲
                                    </h3>

                                    {/* Loading State */}
                                    {checking && (
                                        <div className="flex items-center justify-center py-6 sm:py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-blue-600 border-t-transparent mr-2 sm:mr-3"></div>
                                            <span className="text-gray-600 text-xs sm:text-sm">Checking availability...</span>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {error && !checking && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-6 text-center mb-4 sm:mb-6 mx-2">
                                            <Error className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-red-500 mx-auto mb-2 sm:mb-3" />
                                            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-red-800 mb-1 sm:mb-2">
                                                Error Checking App Status
                                            </h4>
                                            <p className="text-red-700 mb-2 sm:mb-4 text-xs sm:text-sm break-words">{error}</p>
                                            <button
                                                onClick={handleRefreshStatus}
                                                className="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center mx-auto text-xs sm:text-sm"
                                            >
                                                <Refresh className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                Retry
                                            </button>
                                        </div>
                                    )}

                                    {/* APK Available State */}
                                    {available && !checking && (
                                        <div className="px-2">
                                            <p className="text-xs sm:text-sm lg:text-base mb-4 sm:mb-6 opacity-90 text-center break-words">
                                                Complete your order and enjoy exclusive app-only deals
                                            </p>

                                            {/* File Info */}
                                            {fileInfo && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-4 text-xs sm:text-sm text-blue-800">
                                                        <div className="flex items-center gap-1">
                                                            <span>📱 Latest Version</span>
                                                            <span className="hidden sm:inline">•</span>
                                                        </div>
                                                        <span>🔒 Secure Download</span>
                                                    </div>
                                                    {lastChecked && (
                                                        <div className="text-center text-xs text-blue-600 mt-2">
                                                            Last checked: {new Date(lastChecked).toLocaleTimeString()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 max-w-lg mx-auto">
                                                {/* Primary Download Button */}
                                                <motion.button
                                                    whileHover={{ scale: downloading ? 1 : 1.02 }}
                                                    whileTap={{ scale: downloading ? 1 : 0.98 }}
                                                    onClick={handleDownloadAPK}
                                                    disabled={downloading}
                                                    className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 text-xs sm:text-sm lg:text-base"
                                                >
                                                    {downloading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent flex-shrink-0"></div>
                                                            <span>Downloading...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Download className="w-4 h-4 flex-shrink-0" />
                                                            <span>Download APK</span>
                                                        </>
                                                    )}
                                                </motion.button>

                                                {/* Alternative Download Button */}
                                                <motion.button
                                                    whileHover={{ scale: downloading ? 1 : 1.02 }}
                                                    whileTap={{ scale: downloading ? 1 : 0.98 }}
                                                    onClick={handleDownloadAPKBlob}
                                                    disabled={downloading}
                                                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all duration-300 text-xs sm:text-sm lg:text-base"
                                                >
                                                    {downloading ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent flex-shrink-0"></div>
                                                            <span>Processing...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CloudDownload className="w-4 h-4 flex-shrink-0" />
                                                            <span className="hidden sm:inline">Alternative </span>
                                                            <span>Download</span>
                                                        </>
                                                    )}
                                                </motion.button>
                                            </div>

                                            <div className="mt-4 sm:mt-6 p-2 sm:p-3 bg-white bg-opacity-30 rounded-xl">
                                                <p className="text-xs sm:text-sm opacity-90 text-center break-words leading-tight">
                                                    🔒 Safe & Secure • 📱 Easy Installation • ⚡ Latest Version
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* APK Not Available State */}
                                    {!available && !checking && !error && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-6 text-center mx-2">
                                            <Error className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-yellow-500 mx-auto mb-2 sm:mb-3" />
                                            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-yellow-800 mb-1 sm:mb-2">
                                                App Currently Unavailable
                                            </h4>
                                            <p className="text-yellow-700 mb-2 sm:mb-4 text-xs sm:text-sm break-words">
                                                The app download is temporarily unavailable. Please contact support or try again later.
                                            </p>
                                            <button
                                                onClick={handleRefreshStatus}
                                                className="bg-yellow-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center mx-auto text-xs sm:text-sm"
                                            >
                                                <Refresh className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                                Check Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* App Features - Only show if APK is available */}
                    {available && (
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-8"
                        >
                            <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-center mb-4 sm:mb-8 text-gray-900">
                                Why Download Our App? 🌟
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                                {[
                                    { icon: LocalShipping, title: "Easy Order Tracking", desc: "Track orders in real-time", color: "green" },
                                    { icon: Star, title: "Exclusive Offers", desc: "App-only deals & discounts", color: "blue" },
                                    { icon: ShoppingCart, title: "Quick Shopping", desc: "Faster checkout experience", color: "purple" },
                                    { icon: PhoneAndroid, title: "Instant Updates", desc: "Get notified instantly", color: "orange" }
                                ].map((feature, index) => (
                                    <div key={index} className="text-center p-2 sm:p-4">
                                        <div className={`w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-4`}>
                                            <feature.icon className={`w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-${feature.color}-600`} />
                                        </div>
                                        <h4 className="font-bold mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base leading-tight">{feature.title}</h4>
                                        <p className="text-xs sm:text-sm text-gray-600 leading-tight">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="flex justify-center pb-4 sm:pb-8"
                    >
                        <button
                            onClick={handleContinueShopping}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-8 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 text-xs sm:text-sm lg:text-base shadow-lg"
                        >
                            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Continue Shopping</span>
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
