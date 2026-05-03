import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    ArrowBackIos,
    ArrowForwardIos,
    Star,
    StarBorder,
    Add,
    CheckCircle,
    Remove
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { fetchFeaturedProducts } from '../../store/slices/productSlice';
import { addToCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import useMetaPixel from '../../hooks/useMetaPixel'; // Add Meta Pixel hook

const ThisWeeksSavers = () => {
    const dispatch = useDispatch();
    const { featuredProducts, featuredLoading, featuredError } = useSelector(state => state.products);
    const { items: cartItems, message: cartMessage } = useSelector(state => state.cart);

    // Add Meta Pixel hook
    const { trackAddToCart } = useMetaPixel();

    const navigationPrevRef = useRef(null);
    const navigationNextRef = useRef(null);
    const [addingToCart, setAddingToCart] = useState({});
    const [showSuccessMessage, setShowSuccessMessage] = useState({});

    useEffect(() => {
        dispatch(fetchFeaturedProducts({ limit: 10 }));
    }, [dispatch]);

    // Show success message when item is added to cart
    useEffect(() => {
        if (cartMessage) {
            const productId = cartItems[cartItems.length - 1]?.id;
            if (productId) {
                setShowSuccessMessage(prev => ({ ...prev, [productId]: true }));
                setTimeout(() => {
                    setShowSuccessMessage(prev => ({ ...prev, [productId]: false }));
                }, 2000);
            }
        }
    }, [cartMessage, cartItems]);

    const handleAddToCart = async (product, e) => {
        e.preventDefault();
        e.stopPropagation();

        setAddingToCart(prev => ({ ...prev, [product.id]: true }));

        try {
            // Add to cart with animation delay
            setTimeout(() => {
                dispatch(addToCart({
                    id: product.id,
                    name: product.name,
                    images: product.images,
                    mrp: product.mrp,
                    dmartPrice: product.dmartPrice,
                    weight: product.weight,
                    pricePerUnit: product.pricePerUnit,
                    brand: product.brand,
                    category: product.category,
                    isVeg: product.isVeg,
                    badge: product.badge,
                    discount: product.discount || (product.mrp - product.dmartPrice),
                    discountPercent: product.discountPercent || Math.round(((product.mrp - product.dmartPrice) / product.mrp) * 100)
                }));

                // Track AddToCart event with Meta Pixel
                trackAddToCart({
                    content_ids: [product.id],
                    content_name: product.name,
                    content_category: product.category,
                    value: product.dmartPrice,
                    currency: 'INR'
                });

                console.log('📊 Meta Pixel: AddToCart tracked for', product.name);

                setAddingToCart(prev => ({ ...prev, [product.id]: false }));
            }, 800);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setAddingToCart(prev => ({ ...prev, [product.id]: false }));
        }
    };

    const handleQuantityUpdate = (productId, newQuantity, e) => {
        e.preventDefault();
        e.stopPropagation();

        const oldQuantity = getCartItemQuantity(productId);

        if (newQuantity <= 0) {
            dispatch(removeFromCart(productId));
        } else {
            dispatch(updateQuantity({ productId, quantity: newQuantity }));

            // Track AddToCart for quantity increase
            if (newQuantity > oldQuantity) {
                const product = featuredProducts.find(p => p.id === productId);
                if (product) {
                    trackAddToCart({
                        content_ids: [product.id],
                        content_name: product.name,
                        content_category: product.category,
                        value: product.dmartPrice * (newQuantity - oldQuantity),
                        currency: 'INR'
                    });

                    console.log('📊 Meta Pixel: AddToCart tracked for quantity increase');
                }
            }
        }
    };

    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    const getCartItemQuantity = (productId) => {
        const item = cartItems.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => {
            const filled = index < Math.floor(rating);
            const halfFilled = index === Math.floor(rating) && rating % 1 !== 0;

            return (
                <div key={index} className="relative">
                    {filled ? (
                        <Star className="text-yellow-400" sx={{ fontSize: 16 }} />
                    ) : halfFilled ? (
                        <div className="relative">
                            <StarBorder className="text-gray-300" sx={{ fontSize: 16 }} />
                            <Star
                                className="text-yellow-400 absolute top-0 left-0"
                                sx={{ fontSize: 16, clipPath: 'inset(0 50% 0 0)' }}
                            />
                        </div>
                    ) : (
                        <StarBorder className="text-gray-300" sx={{ fontSize: 16 }} />
                    )}
                </div>
            );
        });
    };

    // Loading state
    if (featuredLoading) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">This {"Week's"} Savers</h2>
                        <p className="text-sm text-gray-600">Loading great deals...</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="bg-gray-200 rounded-xl p-4 animate-pulse">
                            <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                            <div className="bg-gray-300 h-4 rounded mb-2"></div>
                            <div className="bg-gray-300 h-4 rounded mb-2 w-3/4"></div>
                            <div className="bg-gray-300 h-8 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (featuredError) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center py-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Products</h3>
                    <p className="text-gray-600 mb-4">{featuredError}</p>
                    <button
                        onClick={() => dispatch(fetchFeaturedProducts({ limit: 10 }))}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (!featuredProducts || featuredProducts.length === 0) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-center py-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Products</h3>
                    <p className="text-gray-600">Check back later for great deals!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">This {"Week's"} Savers</h2>
                    <p className="text-sm text-gray-600">Great deals on your favorite products</p>
                </div>
            </div>

            <div className="relative">
                <Swiper
                    modules={[Navigation, Pagination]}
                    slidesPerView={4}
                    spaceBetween={24}
                    navigation={{
                        prevEl: navigationPrevRef.current,
                        nextEl: navigationNextRef.current,
                    }}
                    onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = navigationPrevRef.current;
                        swiper.params.navigation.nextEl = navigationNextRef.current;
                    }}
                    className="product-swiper"
                    breakpoints={{
                        320: { slidesPerView: 1, spaceBetween: 12 },
                        640: { slidesPerView: 2, spaceBetween: 16 },
                        768: { slidesPerView: 3, spaceBetween: 20 },
                        1024: { slidesPerView: 4, spaceBetween: 24 },
                        1280: { slidesPerView: 5, spaceBetween: 12 },
                    }}
                >
                    {featuredProducts.map((product) => {
                        const cartQuantity = getCartItemQuantity(product.id);
                        const inCart = isInCart(product.id);
                        const isAdding = addingToCart[product.id];
                        const showSuccess = showSuccessMessage[product.id];

                        return (
                            <SwiperSlide key={product.id}>
                                <div className="relative">
                                    {/* FIXED: Wrap only the product info in Link, not the buttons */}
                                    <motion.div
                                        whileHover={{
                                            y: -8,
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.12)'
                                        }}
                                        className="bg-white border border-gray-200 rounded-xl p-4 h-full flex flex-col relative group transition-all duration-300 hover:border-green-300"
                                    >
                                        {/* Badge */}
                                        {product.badge && (
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}

                                        {/* FIXED: Link only wraps the clickable area (image and product info) */}
                                        <Link to={`/product/${product.id}`} className="block group flex-1">
                                            {/* Product Image Container */}
                                            <div className="relative w-full h-48 mb-4 bg-gray-50 rounded-lg overflow-hidden">
                                                <img
                                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                                                    alt={product.images?.[0]?.alt || product.name}
                                                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                                    }}
                                                />
                                            </div>

                                            {/* Product Name */}
                                            <h3 className="text-sm font-semibold text-gray-800 mb-3 text-center px-2 line-clamp-2 h-10">
                                                {product.name} : {product.weight}
                                            </h3>

                                            {/* Rating and Reviews */}
                                            <div className="flex items-center justify-center space-x-2 mb-3">
                                                <div className="flex items-center">
                                                    {renderStars(product.rating || 0)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {product.rating || 0}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    ({product.reviewsCount || 0} reviews)
                                                </span>
                                            </div>

                                            {/* Price Section */}
                                            <div className="mb-4 flex-grow">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>MRP</span>
                                                    <span>DMart</span>
                                                </div>

                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="text-left">
                                                        <span className="text-gray-500 line-through text-sm">
                                                            ₹ {product.mrp}
                                                        </span>
                                                        <div className="text-xs text-red-600 font-medium">
                                                            -{product.discountPercent || 0}%
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-gray-900">
                                                            ₹ {product.dmartPrice}
                                                        </div>
                                                        <div className="text-green-600 text-sm font-semibold">
                                                            ₹ {product.discount || (product.mrp - product.dmartPrice)} OFF
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="text-xs text-gray-400 text-center mb-2">
                                                    (Inclusive of all taxes)
                                                </div>

                                                <div className="text-center">
                                                    <span className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                        {product.pricePerUnit}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>

                                        {/* FIXED: Cart Controls outside Link to prevent navigation */}
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
                                                        onClick={(e) => handleQuantityUpdate(product.id, cartQuantity - 1, e)}
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
                                                        onClick={(e) => handleQuantityUpdate(product.id, cartQuantity + 1, e)}
                                                        className="p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-green-200"
                                                    >
                                                        <Add className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                                    </motion.button>
                                                </motion.div>
                                            ) : (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={(e) => handleAddToCart(product, e)}
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
                                    </motion.div>

                                    {/* Success Message Animation */}
                                    <AnimatePresence>
                                        {showSuccess && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                                                className="absolute top-0 left-0 right-0 bg-green-600 text-white text-sm p-2 rounded-t-xl flex items-center justify-center space-x-2 z-30"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Added to Cart!</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Custom Navigation Buttons */}
                <motion.button
                    ref={navigationPrevRef}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white border-2 border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:border-green-400 hover:text-green-600 z-10 transition-all duration-300"
                >
                    <ArrowBackIos className="text-gray-600 text-lg ml-1" />
                </motion.button>

                <motion.button
                    ref={navigationNextRef}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white border-2 border-gray-200 rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:border-green-400 hover:text-green-600 z-10 transition-all duration-300"
                >
                    <ArrowForwardIos className="text-gray-600 text-lg" />
                </motion.button>
            </div>
        </div>
    );
};

export default ThisWeeksSavers;
