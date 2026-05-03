import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    ChevronLeft,
    ChevronRight,
    Add,
    Remove,
    CheckCircle,
    LocalOffer,
    Star,
    FlashOn,
    TrendingUp,
    Refresh
} from "@mui/icons-material";
import { Link } from 'react-router-dom';
import { fetchTopDeals } from '../../store/slices/productSlice';
import { addToCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import useMetaPixel from '../../hooks/useMetaPixel';

const TopDeals = () => {
    const dispatch = useDispatch();
    const { topDeals, topDealsLoading, topDealsError } = useSelector(state => state.products);
    const { items: cartItems, message: cartMessage } = useSelector(state => state.cart);

    // Refs for custom navigation
    const prevRef = useRef(null);
    const nextRef = useRef(null);
    const swiperRef = useRef(null);

    const { trackAddToCart } = useMetaPixel();

    // Local state for UI interactions
    const [addingToCart, setAddingToCart] = useState({});
    const [showSuccessMessage, setShowSuccessMessage] = useState({});
    const [hoveredCard, setHoveredCard] = useState(null);

    useEffect(() => {
        console.log('🔄 Fetching top deals...');
        dispatch(fetchTopDeals({
            limit: 50,
            minDiscount: 5,
            minDiscountAmount: 10
        }));
    }, [dispatch]);

    // Show success message when item is added to cart
    useEffect(() => {
        if (cartMessage) {
            const productId = cartItems[cartItems.length - 1]?.id;
            if (productId) {
                setShowSuccessMessage(prev => ({ ...prev, [productId]: true }));
                setTimeout(() => {
                    setShowSuccessMessage(prev => ({ ...prev, [productId]: false }));
                }, 3000);
            }
        }
    }, [cartMessage, cartItems]);

    // Debug logs
    useEffect(() => {
        console.log('📊 Top Deals State:', {
            deals: topDeals,
            loading: topDealsLoading,
            error: topDealsError,
            count: topDeals?.length || 0
        });
    }, [topDeals, topDealsLoading, topDealsError]);

    // Cart helper functions
    const handleAddToCart = async (deal, e) => {
        e.preventDefault();
        e.stopPropagation();

        setAddingToCart(prev => ({ ...prev, [deal.id || deal._id]: true }));

        try {
            // Add haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }

            setTimeout(() => {
                dispatch(addToCart({
                    id: deal.id || deal._id,
                    name: deal.name,
                    images: deal.images,
                    mrp: deal.mrp,
                    dmartPrice: deal.dmartPrice,
                    weight: deal.weight,
                    pricePerUnit: deal.pricePerUnit,
                    brand: deal.brand,
                    category: deal.category,
                    isVeg: deal.isVeg,
                    badge: deal.badge,
                    discount: deal.discount || (deal.mrp - deal.dmartPrice),
                    discountPercent: deal.discountPercent || Math.round(((deal.mrp - deal.dmartPrice) / deal.mrp) * 100)
                }));

                // Track Meta Pixel AddToCart event
                trackAddToCart({
                    content_ids: [deal.id],
                    content_name: deal.name,
                    content_category: deal.category,
                    value: deal.dmartPrice,
                    currency: 'INR'
                });

                setAddingToCart(prev => ({ ...prev, [deal.id || deal._id]: false }));
            }, 1000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setAddingToCart(prev => ({ ...prev, [deal.id || deal._id]: false }));
        }
    };

    const handleQuantityUpdate = (dealId, newQuantity, e) => {
        e.preventDefault();
        e.stopPropagation();

        // Add haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }

        if (newQuantity <= 0) {
            dispatch(removeFromCart(dealId));
        } else {
            dispatch(updateQuantity({ productId: dealId, quantity: newQuantity }));
        }
    };



    const isInCart = (dealId) => {
        return cartItems.some(item => item.id === dealId);
    };

    const getCartItemQuantity = (dealId) => {
        const item = cartItems.find(item => item.id === dealId);
        return item ? item.quantity : 0;
    };

    // Enhanced Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8">
                    <div className="mb-4 sm:mb-0">
                        <div className="h-6 sm:h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 sm:w-64 mb-2 animate-pulse"></div>
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-32 sm:w-48 animate-pulse"></div>
                    </div>
                    <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-20 sm:w-24 animate-pulse"></div>
                </div>

                {/* Cards Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                    {[...Array(10)].map((_, index) => (
                        <div key={index} className="bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-32 sm:h-40 lg:h-48 animate-pulse"></div>
                            <div className="p-3 sm:p-4">
                                <div className="bg-gray-200 h-3 sm:h-4 rounded mb-2 animate-pulse"></div>
                                <div className="bg-gray-200 h-3 sm:h-4 rounded mb-3 w-3/4 animate-pulse"></div>
                                <div className="flex justify-between mb-3">
                                    <div className="bg-gray-200 h-4 sm:h-5 rounded w-16 animate-pulse"></div>
                                    <div className="bg-gray-200 h-4 sm:h-5 rounded w-20 animate-pulse"></div>
                                </div>
                                <div className="bg-gray-200 h-8 sm:h-10 rounded-lg animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    // Loading state
    if (topDealsLoading) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (topDealsError) {
        return (
            <div className="py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8 sm:py-12"
                    >
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 max-w-md mx-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FlashOn className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Unable to Load Top Deals</h3>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">{topDealsError}</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => dispatch(fetchTopDeals({ limit: 50 }))}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
                            >
                                <Refresh className="w-4 h-4" />
                                <span>Try Again</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Empty state
    if (!topDeals || topDeals.length === 0) {
        return (
            <div className="py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-8 sm:py-12"
                    >
                        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 max-w-md mx-auto">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LocalOffer className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Top Deals Available</h3>
                            <p className="text-gray-600 mb-6 text-sm sm:text-base">Check back later for amazing deals!</p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => dispatch(fetchTopDeals({ limit: 50 }))}
                                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2 mx-auto"
                            >
                                <Refresh className="w-4 h-4" />
                                <span>Refresh</span>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 sm:py-8 lg:py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
            {/* Add custom CSS for pagination */}
            <style jsx>{`
                .custom-pagination .swiper-pagination-bullet {
                    background-color: #cbd5e1 !important;
                    opacity: 0.5;
                    transition: all 0.3s ease;
                }
                .custom-pagination .swiper-pagination-bullet-active {
                    background-color: #2563eb !important;
                    opacity: 1;
                    transform: scale(1.2);
                }
                .custom-pagination .swiper-pagination {
                    bottom: 0 !important;
                }
            `}</style>

            <div className="container mx-auto px-3 sm:px-4 lg:px-6">
                {/* Enhanced Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8"
                >
                    <div className="mb-4 sm:mb-0">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl">
                                <FlashOn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Top 50 Deals
                            </h2>
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                HOT
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <p className="text-sm sm:text-base text-gray-600">
                                Amazing discounts on <span className="font-semibold text-green-600">{topDeals.length}</span> products
                            </p>
                            <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 text-green-600" />
                                <span className="text-xs font-semibold text-green-700">TRENDING</span>
                            </div>
                        </div>
                    </div>


                </motion.div>

                {/* Enhanced Swiper */}
                <div className="relative group">
                    <Swiper
                        ref={swiperRef}
                        modules={[Navigation, Autoplay]}
                        spaceBetween={12}
                        slidesPerView={2}
                        autoplay={{
                            delay: 1000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true
                        }}
                        breakpoints={{
                            320: {
                                slidesPerView: 1.2,
                                spaceBetween: 12
                            },
                            480: {
                                slidesPerView: 1,
                                spaceBetween: 8
                            },
                            640: {
                                slidesPerView: 3,
                                spaceBetween: 16
                            },
                            768: {
                                slidesPerView: 3.5,
                                spaceBetween: 20
                            },
                            1024: {
                                slidesPerView: 4,
                                spaceBetween: 20
                            },
                            1280: {
                                slidesPerView: 5,
                                spaceBetween: 24
                            },
                            1536: {
                                slidesPerView: 6,
                                spaceBetween: 24
                            }
                        }}
                        navigation={{
                            nextEl: nextRef.current,
                            prevEl: prevRef.current
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        onBeforeInit={(swiper) => {
                            swiper.params.navigation.prevEl = prevRef.current;
                            swiper.params.navigation.nextEl = nextRef.current;
                        }}
                        className="deals-swiper custom-pagination pb-12"
                    >
                        {topDeals.map((deal, index) => {
                            const dealId = deal.id || deal._id;
                            const cartQuantity = getCartItemQuantity(dealId);
                            const inCart = isInCart(dealId);
                            const isAdding = addingToCart[dealId];
                            const showSuccess = showSuccessMessage[dealId];

                            const discountPercent = deal.discountPercent || Math.round(((deal.mrp - deal.dmartPrice) / deal.mrp) * 100);

                            return (
                                <SwiperSlide key={dealId}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative h-full"
                                        onHoverStart={() => setHoveredCard(dealId)}
                                        onHoverEnd={() => setHoveredCard(null)}
                                    >
                                        <Link to={`/product/${dealId}`} className="block group h-full">
                                            <motion.div
                                                whileHover={{
                                                    y: -8,
                                                    scale: 1.02,
                                                    boxShadow: "0 20px 40px rgba(0,0,0,0.12)"
                                                }}
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-2xl overflow-hidden h-full flex flex-col relative border border-gray-100 group-hover:border-blue-200 transition-all duration-300"
                                            >
                                                {/* Image Container */}
                                                <div className="relative overflow-hidden bg-gray-50">
                                                    <motion.img
                                                        whileHover={{ scale: 1.1 }}
                                                        transition={{ duration: 0.6 }}
                                                        src={deal.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                        alt={deal.images?.[0]?.alt || deal.name}
                                                        className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                                        }}
                                                    />

                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                                    {/* Discount Badge */}
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs sm:text-sm px-2 py-1 rounded-lg font-bold shadow-lg flex items-center space-x-1"
                                                    >
                                                        <LocalOffer className="w-3 h-3" />
                                                        <span>{discountPercent}% OFF</span>
                                                    </motion.div>



                                                    {/* Deal Badge */}
                                                    {deal.badge && (
                                                        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-lg font-semibold shadow-lg">
                                                            {deal.badge}
                                                        </div>
                                                    )}

                                                    {/* Quick View on Hover */}
                                                    <AnimatePresence>
                                                        {hoveredCard === dealId && (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                className="absolute inset-0 bg-black/40 flex items-center justify-center"
                                                            >
                                                                <motion.div
                                                                    initial={{ scale: 0.8 }}
                                                                    animate={{ scale: 1 }}
                                                                    exit={{ scale: 0.8 }}
                                                                    className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-semibold text-gray-800"
                                                                >
                                                                    Quick View
                                                                </motion.div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Content */}
                                                <div className="p-3 sm:p-4 flex flex-col flex-grow">
                                                    {/* Product Name */}
                                                    <h3 className="font-semibold text-gray-800 mb-2 text-xs sm:text-sm leading-tight line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                                                        {deal.name} : {deal.weight}
                                                    </h3>

                                                    {/* Rating */}
                                                    <div className="flex items-center space-x-1 mb-2">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`w-3 h-3 ${i < 4 ? 'text-yellow-400' : 'text-gray-200'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-xs text-gray-500">(4.2)</span>
                                                    </div>

                                                    {/* Price Section */}
                                                    <div className="mb-3">
                                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                            <span>MRP</span>
                                                            <span className="font-semibold text-green-600">DMart Price</span>
                                                        </div>

                                                        <div className="flex justify-between items-center">
                                                            <span className="text-gray-500 line-through text-sm">
                                                                ₹{deal.mrp}
                                                            </span>
                                                            <div className="text-right">
                                                                <span className="text-lg font-bold text-gray-800">
                                                                    ₹{deal.dmartPrice}
                                                                </span>
                                                                <div className="text-green-600 text-xs font-semibold">
                                                                    Save ₹{deal.discount || (deal.mrp - deal.dmartPrice)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-xs text-gray-500 mb-2">
                                                        (Inclusive of all taxes)
                                                    </div>

                                                    <div className="text-xs text-gray-600 mb-3 flex-grow">
                                                        {deal.pricePerUnit}
                                                    </div>

                                                    {/* Enhanced Cart Controls */}
                                                    <div className="mt-auto">
                                                        {inCart ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-2 border border-green-200"
                                                            >
                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={(e) => handleQuantityUpdate(dealId, cartQuantity - 1, e)}
                                                                    className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-green-200"
                                                                >
                                                                    <Remove className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                                </motion.button>

                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-lg font-bold text-green-700">{cartQuantity}</span>
                                                                    <span className="text-xs text-green-600 font-medium">in cart</span>
                                                                </div>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={(e) => handleQuantityUpdate(dealId, cartQuantity + 1, e)}
                                                                    className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-green-200"
                                                                >
                                                                    <Add className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                                </motion.button>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={(e) => handleAddToCart(deal, e)}
                                                                disabled={isAdding}
                                                                className={`w-full py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base shadow-lg hover:shadow-xl ${isAdding
                                                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-wait'
                                                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                                                    }`}
                                                            >
                                                                {isAdding ? (
                                                                    <>
                                                                        <motion.div
                                                                            animate={{ rotate: 360 }}
                                                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                                        >
                                                                            <Add className="w-4 h-4" />
                                                                        </motion.div>
                                                                        <span>ADDING...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <ShoppingCart className="w-4 h-4" />
                                                                        <span className="hidden sm:inline">ADD TO CART</span>
                                                                        <span className="sm:hidden">ADD</span>
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>

                                        {/* Enhanced Success Message */}
                                        <AnimatePresence>
                                            {showSuccess && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                                    className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm p-3 rounded-t-xl flex items-center justify-center space-x-2 z-30 shadow-lg"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span className="font-semibold">Added to Cart!</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>

                    {/* Enhanced Custom Navigation Buttons */}
                    <motion.button
                        ref={prevRef}
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl cursor-pointer hover:bg-white transition-all duration-300 border border-gray-100 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </motion.button>

                    <motion.button
                        ref={nextRef}
                        whileHover={{ scale: 1.1, x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl cursor-pointer hover:bg-white transition-all duration-300 border border-gray-100 opacity-0 group-hover:opacity-100"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default TopDeals;
