import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import useMetaPixel from '../../hooks/useMetaPixel';

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL?.replace('/api', '') ||
    'http://localhost:5000';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const PaymentStatusPage = () => {
    const [status, setStatus] = useState('waiting');
    const [countdown, setCountdown] = useState(180);
    const navigate = useNavigate();
    const { trackPurchase } = useMetaPixel();

    const socketRef = useRef(null);
    const pollingRef = useRef(null);
    const countdownRef = useRef(null);
    const pixelFired = useRef(false);

    const orderId = localStorage.getItem('order_id');
    const tid = localStorage.getItem('last_tid');
    const amount = localStorage.getItem('payment_amount');
    const orderNumber = localStorage.getItem('order_number');

    const firePixel = () => {
        if (pixelFired.current) return;
        pixelFired.current = true;
        try {
            const orderData = JSON.parse(localStorage.getItem('order_data') || '{}');
            trackPurchase({
                content_ids: orderData.productIds || [],
                value: parseFloat(amount) || 0,
                currency: 'INR',
                num_items: orderData.totalItems || 1,
            });
        } catch (e) {
            console.warn('Pixel error:', e);
        }
    };

    const clearAll = () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (socketRef.current) socketRef.current.disconnect();
    };

    const startPolling = () => {
        if (!orderId) return;
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/order/payment-status/${orderId}`);
                const data = await res.json();
                if (data.paymentStatus === 'paid') {
                    clearAll(); firePixel(); setStatus('approved');
                } else if (data.paymentStatus === 'failed') {
                    clearAll(); setStatus('rejected');
                }
            } catch (e) {
                console.warn('Polling error:', e);
            }
        }, 8000);
    };

    const connectSocket = () => {
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            withCredentials: true,
        });

        socketRef.current.on('payment_approved', ({ orderId: aId, tid: aTid }) => {
            if (aId === localStorage.getItem('order_id') || aTid === localStorage.getItem('last_tid')) {
                clearAll(); firePixel(); setStatus('approved');
            }
        });

        socketRef.current.on('payment_rejected', ({ orderId: rId, tid: rTid }) => {
            if (rId === localStorage.getItem('order_id') || rTid === localStorage.getItem('last_tid')) {
                clearAll(); setStatus('rejected');
            }
        });
    };

    const startCountdown = () => {
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearAll(); setStatus('timeout'); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        if (!orderId) { navigate('/'); return; }
        connectSocket();
        startPolling();
        startCountdown();
        return () => clearAll();
    }, []);

    const formatTime = (s) =>
        `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    const clearStorage = () => {
        ['order_id', 'last_tid', 'payment_amount', 'order_data', 'order_number'].forEach(k =>
            localStorage.removeItem(k)
        );
    };

    /* ─────────────────────────────────────────────
       ✅ APPROVED
    ───────────────────────────────────────────── */
    if (status === 'approved') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">

                    {/* Green top banner */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
                        {/* Animated checkmark */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/40">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                            Payment Successful!
                        </h1>
                        <p className="text-green-100 text-sm sm:text-base">
                            Your order has been confirmed ✓
                        </p>
                    </div>

                    {/* Details */}
                    <div className="px-5 sm:px-8 py-6">
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 space-y-3">
                            {orderNumber && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Order No.</span>
                                    <span className="font-bold text-gray-800 text-sm">#{orderNumber}</span>
                                </div>
                            )}
                            {tid && (
                                <div className="flex items-start justify-between gap-2">
                                    <span className="text-sm text-gray-500 flex-shrink-0">Transaction ID</span>
                                    <span className="font-mono text-xs text-gray-700 text-right break-all">{tid}</span>
                                </div>
                            )}
                            {amount && (
                                <div className="flex items-center justify-between border-t border-green-200 pt-3">
                                    <span className="text-sm font-semibold text-gray-700">Amount Paid</span>
                                    <span className="text-xl font-black text-green-700">
                                        ₹{parseFloat(amount).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Steps */}
                        <div className="space-y-2 mb-6">
                            {[
                                { icon: '✅', text: 'Payment received' },
                                { icon: '📦', text: 'Order is being prepared' },
                                { icon: '🚚', text: 'Will be delivered soon' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                    <span className="text-lg">{step.icon}</span>
                                    <span>{step.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => { clearStorage(); navigate('/'); }}
                            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-green-700 active:scale-95 transition-all"
                        >
                            Continue Shopping 🛍️
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────────────
       ❌ REJECTED / PENDING
    ───────────────────────────────────────────── */
    if (status === 'rejected') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center px-4 py-8">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">

                    {/* Yellow top banner */}
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-8 text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/40">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Order Pending</h1>
                        <p className="text-yellow-100 text-sm sm:text-base">
                            We're verifying your payment
                        </p>
                    </div>

                    <div className="px-5 sm:px-8 py-6">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6 text-center">
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                Your order has been placed. Our team is verifying your payment and will confirm it shortly.
                            </p>
                        </div>

                        {tid && (
                            <div className="bg-gray-50 rounded-xl p-3 mb-6 text-center">
                                <p className="text-xs text-gray-400 mb-1">Reference</p>
                                <p className="font-mono text-xs text-gray-600 break-all">{tid}</p>
                            </div>
                        )}

                        <div className="space-y-2 mb-6">
                            {[
                                { icon: '🕐', text: 'Payment verification in progress' },
                                { icon: '📲', text: 'You will be notified once confirmed' },
                                { icon: '🛡️', text: 'Your order is safe with us' },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                                    <span className="text-lg">{step.icon}</span>
                                    <span>{step.text}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-yellow-600 active:scale-95 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────────────
       ⏰ TIMEOUT
    ───────────────────────────────────────────── */
    if (status === 'timeout') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-4 py-8">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">

                    <div className="bg-gradient-to-r from-gray-500 to-slate-600 px-6 py-8 text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/40">
                            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Order Placed</h1>
                        <p className="text-gray-200 text-sm sm:text-base">
                            Pending payment verification
                        </p>
                    </div>

                    <div className="px-5 sm:px-8 py-6">
                        <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-center">
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                Your order has been placed. Our team will verify your payment and confirm your order soon.
                            </p>
                        </div>

                        {tid && (
                            <div className="bg-gray-50 rounded-xl p-3 mb-6 text-center">
                                <p className="text-xs text-gray-400 mb-1">Reference ID</p>
                                <p className="font-mono text-xs text-gray-600 break-all">{tid}</p>
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gray-700 text-white py-4 rounded-2xl font-bold text-base sm:text-lg hover:bg-gray-800 active:scale-95 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ─────────────────────────────────────────────
       ⏳ WAITING — countdown screen
    ───────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-auto overflow-hidden">

                {/* Top purple header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-6 text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-4 border-white/30">
                        <img
                            src="https://i.pinimg.com/736x/b6/e6/1a/b6e61a9597b648e1eebe3b599030c9e6.jpg"
                            alt="PhonePe"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mb-0.5">
                        Verifying Payment
                    </h2>
                    <p className="text-purple-200 text-xs sm:text-sm">
                        Please wait for admin confirmation
                    </p>
                </div>

                <div className="px-5 sm:px-8 py-6">

                    {/* Circular countdown ring */}
                    <div className="relative flex items-center justify-center mx-auto mb-6"
                        style={{ width: 140, height: 140 }}>
                        <svg className="absolute -rotate-90" width="140" height="140" viewBox="0 0 140 140">
                            {/* Track */}
                            <circle cx="70" cy="70" r="58"
                                fill="none" stroke="#f3f4f6" strokeWidth="10" />
                            {/* Progress */}
                            <circle cx="70" cy="70" r="58"
                                fill="none"
                                stroke={countdown > 60 ? '#7c3aed' : countdown > 30 ? '#f59e0b' : '#ef4444'}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 58}`}
                                strokeDashoffset={`${2 * Math.PI * 58 * (1 - countdown / 180)}`}
                                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                            />
                        </svg>
                        <div className="relative text-center z-10">
                            <div className={`text-4xl font-black tabular-nums ${countdown > 60 ? 'text-purple-600'
                                    : countdown > 30 ? 'text-yellow-500'
                                        : 'text-red-500'
                                }`}>
                                {formatTime(countdown)}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">remaining</div>
                        </div>
                    </div>

                    {/* Live indicator */}
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 mb-1.5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500" />
                            </span>
                            <span className="text-sm font-semibold text-purple-700">
                                Waiting for admin confirmation
                            </span>
                        </div>
                        <p className="text-xs text-purple-400 text-center">
                            Complete your ₹{parseFloat(amount || 0).toLocaleString('en-IN')} transfer in PhonePe, then come back here.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-2 mb-5">
                        {[
                            { icon: '1️⃣', text: 'Complete payment in PhonePe app' },
                            { icon: '2️⃣', text: 'Return to this page' },
                            { icon: '3️⃣', text: 'Wait for admin to confirm' },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3 text-xs text-gray-500">
                                <span>{step.icon}</span>
                                <span>{step.text}</span>
                            </div>
                        ))}
                    </div>

                    {tid && (
                        <div className="text-center">
                            <p className="text-xs text-gray-300 font-mono break-all">Ref: {tid}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;