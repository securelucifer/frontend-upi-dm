import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowBack, LocationOn, Payment, Security, CheckCircle,
    RadioButtonUnchecked, RadioButtonChecked, LocalOffer, ShoppingCart, Close,
    ExpandMore, ExpandLess, ErrorOutline, Lock
} from '@mui/icons-material';
import { clearCart } from '../../store/slices/cartSlice';
import { createOrder as apiCreateOrder } from '../../services/productAPI';
import paymentAPI from '../../services/paymentAPi';
import useMetaPixel from '../../hooks/useMetaPixel';


const PhonePeLogo = () => (
    <div style={{ width: '32px', height: '38px', borderRadius: '43px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src="https://i.pinimg.com/736x/b6/e6/1a/b6e61a9597b648e1eebe3b599030c9e6.jpg" alt="PhonePe" style={{ width: '100%', objectFit: 'cover' }} />
    </div>
);

const PaytmLogo = () => (
    <svg width="32" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#00B9F5" />
        <text x="12" y="16" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">Paytm</text>
    </svg>
);

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cartItems, cartTotalAmount, cartTotalItems } = useSelector(state => state.cart);
    const { trackInitiateCheckout, trackAddPaymentInfo } = useMetaPixel();

    const checkoutData = location.state;
    const [checkoutItems, setCheckoutItems] = useState([]);
    const [checkoutTotals, setCheckoutTotals] = useState({});
    const [dataSource, setDataSource] = useState('');

    const [deliveryAddress, setDeliveryAddress] = useState({
        fullName: '', phone: '', pincode: '', address: '', city: '', state: '', isDefault: false
    });

    const [validationErrors, setValidationErrors] = useState({
        fullName: '', phone: '', pincode: '', address: '', city: '', state: ''
    });

    const [paymentMethod, setPaymentMethod] = useState('phonepe');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [isProcessingOrder, setIsProcessingOrder] = useState(false);
    const [showOrderSummary, setShowOrderSummary] = useState(false);

    // ✅ Countdown modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [modalCountdown, setModalCountdown] = useState(180);
    const modalTimerRef = useRef(null);
    const autoNavTimerRef = useRef(null);
    const visibilityHandlerRef = useRef(null);

    const validCoupons = {
        SAVE10: { discount: 10, type: 'percentage', minAmount: 500, maxDiscount: 100 },
        FLAT50: { discount: 50, type: 'fixed', minAmount: 200 },
        WELCOME20: { discount: 20, type: 'percentage', minAmount: 1000, maxDiscount: 200 },
        FIRST100: { discount: 100, type: 'fixed', minAmount: 300 }
    };

    useEffect(() => {
        if (checkoutData) {
            if (checkoutData.type === 'buyNow' || checkoutData.type === 'cart') {
                setCheckoutItems(checkoutData.items);
                setCheckoutTotals({
                    totalItems: checkoutData.totalItems,
                    totalAmount: checkoutData.totalAmount,
                    totalMRP: checkoutData.totalMRP,
                    totalSavings: checkoutData.totalSavings
                });
                setDataSource(checkoutData.type);
                trackInitiateCheckout({
                    content_ids: checkoutData.items.map(item => item.id),
                    num_items: checkoutData.totalItems,
                    value: checkoutData.finalTotal || checkoutData.totalAmount,
                    currency: 'INR'
                });
            }
        } else if (cartItems && cartItems.length > 0) {
            setCheckoutItems(cartItems);
            const totalMRP = cartItems.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
            const totalSavings = totalMRP - cartTotalAmount;
            setCheckoutTotals({ totalItems: cartTotalItems, totalAmount: cartTotalAmount, totalMRP, totalSavings });
            setDataSource('cart');
            trackInitiateCheckout({
                content_ids: cartItems.map(item => item.id),
                num_items: cartTotalItems,
                value: cartTotalAmount + (cartTotalAmount >= 100 ? 0 : 40),
                currency: 'INR'
            });
        } else {
            navigate('/');
        }
    }, []);

    // ✅ Cleanup on unmount
    useEffect(() => {
        return () => {
            if (modalTimerRef.current) clearInterval(modalTimerRef.current);
            if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
            if (visibilityHandlerRef.current) {
                document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
            }
        };
    }, []);

    const validateFullName = (name) => {
        if (!name.trim()) return 'Full name is required';
        if (name.trim().length < 3) return 'Name must be at least 3 characters';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name should only contain letters';
        return '';
    };

    const validatePhone = (phone) => {
        if (!phone.trim()) return 'Phone number is required';
        if (!/^[0-9]{10}$/.test(phone)) return 'Phone number must be exactly 10 digits';
        if (!/^[6-9]/.test(phone)) return 'Phone number must start with 6, 7, 8, or 9';
        return '';
    };

    const validatePincode = (pincode) => {
        if (!pincode.trim()) return 'Pincode is required';
        if (!/^[0-9]{6}$/.test(pincode)) return 'Pincode must be exactly 6 digits';
        return '';
    };

    const validateCity = (city) => {
        if (!city.trim()) return 'City is required';
        if (city.trim().length < 2) return 'City name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(city)) return 'City should only contain letters';
        return '';
    };

    const validateState = (state) => {
        if (!state.trim()) return 'State is required';
        if (state.trim().length < 2) return 'State name must be at least 2 characters';
        if (!/^[a-zA-Z\s]+$/.test(state)) return 'State should only contain letters';
        return '';
    };

    const validateAddress = (address) => {
        if (!address.trim()) return 'Complete address is required';
        if (address.trim().length < 2) return 'Address must be at least 2 characters';
        return '';
    };

    const handleAddressChange = (field, value) => {
        setDeliveryAddress(prev => ({ ...prev, [field]: value }));
        let error = '';
        switch (field) {
            case 'fullName': error = validateFullName(value); break;
            case 'phone':
                const phoneValue = value.replace(/\D/g, '').slice(0, 10);
                setDeliveryAddress(prev => ({ ...prev, phone: phoneValue }));
                setValidationErrors(prev => ({ ...prev, phone: validatePhone(phoneValue) }));
                return;
            case 'pincode':
                const pincodeValue = value.replace(/\D/g, '').slice(0, 6);
                setDeliveryAddress(prev => ({ ...prev, pincode: pincodeValue }));
                setValidationErrors(prev => ({ ...prev, pincode: validatePincode(pincodeValue) }));
                return;
            case 'city': error = validateCity(value); break;
            case 'state': error = validateState(value); break;
            case 'address': error = validateAddress(value); break;
            default: break;
        }
        setValidationErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError('');
        await new Promise(resolve => setTimeout(resolve, 800));
        const coupon = validCoupons[couponCode.toUpperCase()];
        if (!coupon) { setCouponError('Invalid coupon code'); setIsApplyingCoupon(false); return; }
        if (checkoutTotals.totalAmount < coupon.minAmount) { setCouponError(`Minimum order amount should be ₹${coupon.minAmount}`); setIsApplyingCoupon(false); return; }
        let discount = coupon.type === 'percentage' ? (checkoutTotals.totalAmount * coupon.discount) / 100 : coupon.discount;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon, calculatedDiscount: discount });
        setCouponDiscount(discount);
        setIsApplyingCoupon(false);
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponCode('');
        setCouponError('');
    };

    const deliveryFee = checkoutTotals.totalAmount >= 100 ? 0 : 40;
    const subtotalAfterCoupon = checkoutTotals.totalAmount - couponDiscount;
    const finalTotal = subtotalAfterCoupon + deliveryFee;

    const isFormValid = () => {
        const addressValid = deliveryAddress.fullName && deliveryAddress.phone && deliveryAddress.pincode &&
            deliveryAddress.address && deliveryAddress.city && deliveryAddress.state;
        const noErrors = !Object.values(validationErrors).some(e => e);
        return addressValid && noErrors && paymentMethod;
    };

    // ✅ Start payment countdown modal
    const startPaymentModal = (deepLinkUrl) => {
        setShowPaymentModal(true);
        setModalCountdown(180);

        // Tick countdown every second
        modalTimerRef.current = setInterval(() => {
            setModalCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(modalTimerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // visibilitychange: user returns from PhonePe app → navigate immediately
        const onVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('👁️ User returned from PhonePe app');
                cleanupAndNavigate();
            }
        };
        visibilityHandlerRef.current = onVisibilityChange;
        document.addEventListener('visibilitychange', onVisibilityChange);

        // 3-minute fallback
        autoNavTimerRef.current = setTimeout(() => {
            console.log('⏰ 3 minutes elapsed, auto navigating');
            cleanupAndNavigate();
        }, 180000);

        // Open PhonePe app
        window.location.href = deepLinkUrl;
    };

    const cleanupAndNavigate = () => {
        if (modalTimerRef.current) clearInterval(modalTimerRef.current);
        if (autoNavTimerRef.current) clearTimeout(autoNavTimerRef.current);
        if (visibilityHandlerRef.current) {
            document.removeEventListener('visibilitychange', visibilityHandlerRef.current);
            visibilityHandlerRef.current = null;
        }
        setShowPaymentModal(false);
        navigate('/payment-status');
    };

    const handlePlaceOrder = async () => {
        const errors = {
            fullName: validateFullName(deliveryAddress.fullName),
            phone: validatePhone(deliveryAddress.phone),
            pincode: validatePincode(deliveryAddress.pincode),
            city: validateCity(deliveryAddress.city),
            state: validateState(deliveryAddress.state),
            address: validateAddress(deliveryAddress.address)
        };

        setValidationErrors(errors);

        if (Object.values(errors).some(error => error !== '')) {
            alert('Please fix all validation errors before proceeding');
            return;
        }

        if (!isFormValid()) {
            alert('Please fill all delivery address fields correctly');
            return;
        }

        setIsProcessingOrder(true);

        try {
            const orderData = {
                userId: null,
                deliveryAddress: {
                    fullName: deliveryAddress.fullName,
                    phone: deliveryAddress.phone,
                    pincode: deliveryAddress.pincode,
                    address: deliveryAddress.address,
                    city: deliveryAddress.city,
                    state: deliveryAddress.state
                },
                products: checkoutItems.map(item => ({ id: item.id, quantity: item.quantity })),
                orderSummary: {
                    totalItems: checkoutTotals.totalItems,
                    subtotal: checkoutTotals.totalAmount,
                    totalMRP: checkoutTotals.totalMRP,
                    totalSavings: checkoutTotals.totalSavings,
                    couponDiscount: couponDiscount,
                    deliveryFee: deliveryFee,
                    finalTotal: finalTotal
                },
                couponUsed: appliedCoupon ? { code: appliedCoupon.code, discount: appliedCoupon.calculatedDiscount, discountType: appliedCoupon.type } : null,
                paymentMethod: 'online',
                dataSource: dataSource
            };

            const orderResult = await apiCreateOrder(orderData);
            const orderId = orderResult.data.orderId;
            const orderNumber = orderResult.data.orderNumber;

            const paymentData = {
                amount: finalTotal,
                payType: paymentMethod,
                orderId: orderId,
                userId: null
            };

            const paymentResponse = await paymentAPI.createPayment(paymentData);

            // ✅ Store in localStorage
            localStorage.setItem('last_tid', paymentResponse.tid);
            localStorage.setItem('payment_amount', paymentResponse.amount);
            localStorage.setItem('order_id', orderId);
            localStorage.setItem('order_number', orderNumber);
            localStorage.setItem('order_data', JSON.stringify({
                productIds: checkoutItems.map(item => item.id),
                totalItems: checkoutTotals.totalItems,
                amount: finalTotal
            }));

            trackAddPaymentInfo({
                content_ids: checkoutItems.map(item => item.id),
                value: finalTotal,
                currency: 'INR'
            });

            if (paymentResponse && (paymentResponse.redirect_url || paymentResponse.ios_url || paymentResponse.android_url)) {
                if (dataSource === 'cart') dispatch(clearCart());

                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                const isAndroid = /Android/.test(navigator.userAgent);

                let deepLinkUrl;
                if (isIOS && paymentResponse.ios_url) {
                    deepLinkUrl = paymentResponse.ios_url;
                } else if (isAndroid && paymentResponse.android_url) {
                    deepLinkUrl = paymentResponse.android_url;
                } else {
                    deepLinkUrl = paymentResponse.redirect_url;
                }

                setIsProcessingOrder(false);

                // ✅ Show modal, start timer, open app
                startPaymentModal(deepLinkUrl);

            } else {
                alert('Payment link not received. Please try again.');
                setIsProcessingOrder(false);
            }

        } catch (error) {
            console.error('❌ Error during checkout:', error);
            let errorMessage = 'Failed to place order. Please try again.';
            if (error.response?.data?.error) errorMessage = error.response.data.error;
            alert(errorMessage);
            setIsProcessingOrder(false);
        }
    };

    if (!checkoutItems.length && !checkoutData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-sm">Loading checkout...</p>
                </div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ✅ Payment Countdown Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
                        >
                            {/* PhonePe Logo */}
                            <div className="flex justify-center mb-4">
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden' }}>
                                    <img src="https://i.pinimg.com/736x/b6/e6/1a/b6e61a9597b648e1eebe3b599030c9e6.jpg" alt="PhonePe" style={{ width: '100%', objectFit: 'cover' }} />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-gray-800 mb-1">Complete Payment in PhonePe</h2>
                            <p className="text-sm text-gray-500 mb-6">Your payment window is open. Complete the transfer and come back.</p>

                            {/* Countdown ring */}
                            <div className="relative flex items-center justify-center mb-6">
                                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                                    <circle
                                        cx="60" cy="60" r="50" fill="none"
                                        stroke={modalCountdown > 60 ? '#7c3aed' : modalCountdown > 30 ? '#f59e0b' : '#ef4444'}
                                        strokeWidth="10"
                                        strokeDasharray={`${2 * Math.PI * 50}`}
                                        strokeDashoffset={`${2 * Math.PI * 50 * (1 - modalCountdown / 180)}`}
                                        strokeLinecap="round"
                                        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <div className={`text-3xl font-bold ${modalCountdown > 60 ? 'text-purple-600' : modalCountdown > 30 ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {formatTime(modalCountdown)}
                                    </div>
                                    <div className="text-xs text-gray-400">remaining</div>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-xl p-4 mb-4 text-left">
                                <p className="text-sm font-semibold text-purple-700 mb-2">💡 Instructions:</p>
                                <ul className="text-xs text-purple-600 space-y-1">
                                    <li>1. Complete the ₹{finalTotal} payment in PhonePe</li>
                                    <li>2. Press Back to return to this app</li>
                                    <li>3. Wait for admin confirmation</li>
                                </ul>
                            </div>

                            <p className="text-xs text-gray-400">Page will auto-update when you return from PhonePe</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:static">
                <div className="px-4 py-3 sm:px-6">
                    <div className="flex items-center justify-between">
                        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                            <ArrowBack className="w-5 h-5 mr-2" />
                            <span className="font-medium text-sm sm:text-base">Back</span>
                        </button>
                        <div className="text-center">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Checkout</h1>
                            <p className="text-xs sm:text-sm text-gray-600">{checkoutTotals.totalItems} item{checkoutTotals.totalItems > 1 ? 's' : ''}</p>
                        </div>
                        <div className="w-12 sm:w-16"></div>
                    </div>
                </div>
            </div>

            {/* Mobile Order Summary Toggle */}
            <div className="lg:hidden border-t border-gray-200">
                <button onClick={() => setShowOrderSummary(!showOrderSummary)} className="w-full px-4 py-3 flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center">
                        <ShoppingCart className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm font-medium">Order Summary</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm font-bold mr-2">₹{finalTotal?.toLocaleString()}</span>
                        {showOrderSummary ? <ExpandLess /> : <ExpandMore />}
                    </div>
                </button>
                <AnimatePresence>
                    {showOrderSummary && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white border-t border-gray-200">
                            <div className="p-4">
                                <div className="space-y-3 max-h-48 overflow-y-auto">
                                    {checkoutItems.map(item => (
                                        <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                                            <img src={item.images?.[0]?.url || 'https://via.placeholder.com/40x40?text=P'} alt={item.name} className="w-10 h-10 object-cover rounded bg-white border flex-shrink-0" onError={e => e.target.src = 'https://via.placeholder.com/40x40?text=P'} />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</h4>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                                                    <span className="text-xs font-semibold">₹{(item.dmartPrice * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>₹{checkoutTotals.totalAmount?.toLocaleString()}</span></div>
                                    {appliedCoupon && <div className="flex justify-between text-sm text-orange-600 mb-1"><span>Coupon Discount</span><span>-₹{couponDiscount.toLocaleString()}</span></div>}
                                    <div className="flex justify-between text-sm mb-2"><span>Delivery</span><span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                                    <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{finalTotal?.toLocaleString()}</span></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">

                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                                    <LocationOn className="w-5 h-5 mr-2 text-blue-600" /> Delivery Address
                                </h3>
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                            <input type="text" value={deliveryAddress.fullName} onChange={e => handleAddressChange('fullName', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors text-sm ${validationErrors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="Enter full name" />
                                            {validationErrors.fullName && <div className="flex items-center mt-1 text-red-600 text-xs"><ErrorOutline className="w-3 h-3 mr-1" />{validationErrors.fullName}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                                            <input type="tel" value={deliveryAddress.phone} onChange={e => handleAddressChange('phone', e.target.value)} maxLength={10} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors text-sm ${validationErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="Enter 10-digit mobile number" />
                                            {validationErrors.phone && <div className="flex items-center mt-1 text-red-600 text-xs"><ErrorOutline className="w-3 h-3 mr-1" />{validationErrors.phone}</div>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode <span className="text-red-500">*</span></label>
                                            <input type="text" value={deliveryAddress.pincode} onChange={e => handleAddressChange('pincode', e.target.value)} maxLength={6} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors text-sm ${validationErrors.pincode ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="6-digit pincode" />
                                            {validationErrors.pincode && <div className="flex items-center mt-1 text-red-600 text-xs"><ErrorOutline className="w-3 h-3 mr-1" />{validationErrors.pincode}</div>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
                                            <input type="text" value={deliveryAddress.city} onChange={e => handleAddressChange('city', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors text-sm ${validationErrors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="City" />
                                            {validationErrors.city && <div className="flex items-center mt-1 text-red-600 text-xs"><ErrorOutline className="w-3 h-3 mr-1" />{validationErrors.city}</div>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State <span className="text-red-500">*</span></label>
                                        <input type="text" value={deliveryAddress.state} onChange={e => handleAddressChange('state', e.target.value)} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors text-sm ${validationErrors.state ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="State" />
                                        {validationErrors.state && <div className="flex items-center mt-1 text-red-600 text-xs"><ErrorOutline className="w-3 h-3 mr-1" />{validationErrors.state}</div>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address <span className="text-red-500">*</span></label>
                                        <textarea value={deliveryAddress.address} onChange={e => handleAddressChange('address', e.target.value)} rows={3} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-colors text-sm resize-none ${validationErrors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} placeholder="House no., street, area, landmark" />
                                        {validationErrors.address && <div className="flex items-center mt-1 text-red-600 text-xs"><ErrorOutline className="w-3 h-3 mr-1" />{validationErrors.address}</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                                    <Payment className="w-5 h-5 mr-2 text-blue-600" /> Select Payment Method
                                </h3>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                <div className={`border rounded-lg transition-all cursor-pointer ${paymentMethod === 'phonepe' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                                    <label className="flex items-center p-4 cursor-pointer">
                                        <button type="button" onClick={() => setPaymentMethod('phonepe')} className="mr-4 flex-shrink-0">
                                            {paymentMethod === 'phonepe' ? <RadioButtonChecked className="text-purple-600" /> : <RadioButtonUnchecked className="text-gray-400" />}
                                        </button>
                                        <PhonePeLogo />
                                        <div className="flex-1 min-w-0 ml-3">
                                            <div className="font-medium text-sm">PhonePe</div>
                                            <div className="text-xs text-gray-600">Pay using PhonePe UPI</div>
                                        </div>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">UPI</span>
                                    </label>
                                </div>

                                <div className={`border rounded-lg transition-all cursor-pointer ${paymentMethod === 'paytm' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                                    <label className="flex items-center p-4 cursor-pointer">
                                        <button type="button" onClick={() => setPaymentMethod('paytm')} className="mr-4 flex-shrink-0">
                                            {paymentMethod === 'paytm' ? <RadioButtonChecked className="text-blue-600" /> : <RadioButtonUnchecked className="text-gray-400" />}
                                        </button>
                                        <PaytmLogo />
                                        <div className="flex-1 min-w-0 ml-3">
                                            <div className="font-medium text-sm">Paytm</div>
                                            <div className="text-xs text-gray-600">Pay using Paytm Wallet/UPI</div>
                                        </div>
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Wallet</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Coupon Code */}
                        <div className="bg-white rounded-lg shadow-sm">
                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                <h3 className="text-base sm:text-lg font-semibold flex items-center">
                                    <LocalOffer className="w-5 h-5 mr-2 text-orange-600" /> Coupon / Offers
                                </h3>
                            </div>
                            <div className="p-4 sm:p-6">
                                {!appliedCoupon ? (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm" placeholder="Enter coupon code" />
                                            <button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()} className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                                                {isApplyingCoupon ? 'Applying...' : 'Apply'}
                                            </button>
                                        </div>
                                        {couponError && <p className="text-red-500 text-sm">{couponError}</p>}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="text-green-600 mr-2" />
                                            <div>
                                                <p className="font-medium text-green-800 text-sm">{appliedCoupon.code} applied!</p>
                                                <p className="text-xs text-green-600">You save ₹{couponDiscount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={handleRemoveCoupon} className="text-gray-400 hover:text-red-500 transition-colors"><Close /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column — Order Summary */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-lg shadow-sm sticky top-24">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">Order Summary</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                                    {checkoutItems.map(item => (
                                        <div key={item.id} className="flex items-center space-x-3">
                                            <img src={item.images?.[0]?.url || 'https://via.placeholder.com/48x48?text=P'} alt={item.name} className="w-12 h-12 object-cover rounded border flex-shrink-0" onError={e => e.target.src = 'https://via.placeholder.com/48x48?text=P'} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.dmartPrice}</p>
                                            </div>
                                            <span className="text-sm font-semibold">₹{(item.dmartPrice * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 border-t border-gray-200 pt-4">
                                    <div className="flex justify-between text-sm"><span className="text-gray-600">MRP Total</span><span className="line-through text-gray-400">₹{checkoutTotals.totalMRP?.toLocaleString()}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>₹{checkoutTotals.totalAmount?.toLocaleString()}</span></div>
                                    {checkoutTotals.totalSavings > 0 && <div className="flex justify-between text-sm text-green-600"><span>You Save</span><span>-₹{checkoutTotals.totalSavings?.toLocaleString()}</span></div>}
                                    {appliedCoupon && <div className="flex justify-between text-sm text-orange-600"><span>Coupon ({appliedCoupon.code})</span><span>-₹{couponDiscount.toLocaleString()}</span></div>}
                                    <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery</span><span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2"><span>Total</span><span>₹{finalTotal?.toLocaleString()}</span></div>
                                </div>

                                <div className="mt-4 flex items-center text-xs text-gray-500"><Security className="w-4 h-4 mr-1 text-green-600" /><span>Secured by 256-bit SSL encryption</span></div>
                            </div>

                            <div className="p-6 pt-0">
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessingOrder || !isFormValid()}
                                    className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    {isProcessingOrder ? (
                                        <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Processing...</>
                                    ) : (
                                        <><Lock className="w-5 h-5" /> Pay ₹{finalTotal?.toLocaleString()}</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Pay Button */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
                    <button
                        onClick={handlePlaceOrder}
                        disabled={isProcessingOrder || !isFormValid()}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        {isProcessingOrder ? (
                            <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> Processing...</>
                        ) : (
                            <><Lock className="w-5 h-5" /> Pay ₹{finalTotal?.toLocaleString()}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;