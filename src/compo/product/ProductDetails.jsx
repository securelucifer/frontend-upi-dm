import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/pagination";
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    Bolt,
    Star,
    StarBorder,
    ArrowBack,
    ArrowBackIos,
    ArrowForwardIos,
    Favorite,
    FavoriteBorder,
    Add,
    Remove,
    CheckCircle,
    LocalOffer,
    Verified,
    Security,
    LocalShipping,
    Share,
    ExpandMore
} from "@mui/icons-material";
import { fetchProductById, fetchSimilarProducts, clearCurrentProduct } from '../../store/slices/productSlice';
import { addToCart, updateQuantity, removeFromCart } from '../../store/slices/cartSlice';
import useMetaPixel from '../../hooks/useMetaPixel';


// Throttle utility to prevent excessive scroll events
const throttle = (func, wait) => {
    let lastTime = 0;
    return function executedFunction(...args) {
        const now = Date.now();
        if (now - lastTime >= wait) {
            func(...args);
            lastTime = now;
        }
    };
};

const Qty = ({ value, onChange, max = 99, size = "default" }) => {
    const isSmall = size === "small";

    return (
        <div className={`inline-flex items-center rounded-lg border border-gray-300 overflow-hidden bg-white shadow-sm transition-all duration-200 ${isSmall ? 'h-8' : 'h-10'}`}>
            <button
                className={`${isSmall ? 'px-2 py-1' : 'px-3 py-2'} hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150`}
                onClick={() => onChange(Math.max(1, value - 1))}
                type="button"
                disabled={value <= 1}
            >
                <Remove className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 transition-colors duration-150`} />
            </button>
            <div className={`${isSmall ? 'px-2 py-1 min-w-[32px]' : 'px-4 py-2 min-w-[40px]'} text-center font-semibold text-sm border-l border-r border-gray-300 transition-all duration-150`}>
                {value}
            </div>
            <button
                className={`${isSmall ? 'px-2 py-1' : 'px-3 py-2'} hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150`}
                onClick={() => onChange(Math.min(max, value + 1))}
                type="button"
                disabled={value >= max}
            >
                <Add className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600 transition-colors duration-150`} />
            </button>
        </div>
    );
};

const Pill = ({ children, color = "bg-green-100 text-green-700", size = "default" }) => {
    const sizeClasses = size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs sm:text-sm";
    return (
        <span className={`${sizeClasses} rounded-full font-medium transition-all duration-200 ${color}`}>
            {children}
        </span>
    );
};

// Enhanced Star Rating Component
const StarRating = ({ rating = 0, maxStars = 5, size = "default", showText = true, reviews = 0 }) => {
    const starSize = {
        small: "w-3 h-3",
        default: "w-4 h-4",
        large: "w-5 h-5"
    };

    const textSize = {
        small: "text-xs",
        default: "text-sm",
        large: "text-base"
    };

    return (
        <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-0.5">
                {[...Array(maxStars)].map((_, index) => {
                    const isFilled = index < Math.floor(rating);
                    const isHalf = index === Math.floor(rating) && rating % 1 !== 0;

                    return (
                        <div key={index} className="relative">
                            {isFilled ? (
                                <Star className={`${starSize[size]} text-yellow-400 drop-shadow-sm`} />
                            ) : isHalf ? (
                                <div className="relative">
                                    <StarBorder className={`${starSize[size]} text-gray-300`} />
                                    <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                                        <Star className={`${starSize[size]} text-yellow-400 drop-shadow-sm`} />
                                    </div>
                                </div>
                            ) : (
                                <StarBorder className={`${starSize[size]} text-gray-300`} />
                            )}
                        </div>
                    );
                })}
            </div>
            {showText && (
                <>
                    <span className={`font-semibold text-gray-800 ${textSize[size]}`}>
                        {rating.toFixed(1)}
                    </span>
                    {reviews > 0 && (
                        <span className={`text-gray-500 ${textSize[size]}`}>
                            ({reviews.toLocaleString()})
                        </span>
                    )}
                </>
            )}
        </div>
    );
};

export default function ProductDetails() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Add Meta Pixel hook
    const { trackViewContent, trackAddToCart, trackInitiateCheckout } = useMetaPixel();


    const {
        currentProduct: product,
        currentProductLoading: loading,
        currentProductError: error,
        similarProducts,
    } = useSelector(state => state.products);

    const { items: cartItems } = useSelector(state => state.cart);

    const [qty, setQty] = useState(1);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [wishlist, setWishlist] = useState({});
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [expandedDetails, setExpandedDetails] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isImageSticky, setIsImageSticky] = useState(false);

    // Refs for sticky functionality and similar products
    const navigationPrevRef = useRef(null);
    const navigationNextRef = useRef(null);
    const imageGalleryRef = useRef(null);
    const similarProductsRef = useRef(null);
    const productInfoRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    useEffect(() => {
        if (id) {
            dispatch(clearCurrentProduct());
            dispatch(fetchProductById(id));
            dispatch(fetchSimilarProducts(id));
            window.scrollTo(0, 0);
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [id, dispatch]);

    // Track ViewContent when product loads
    useEffect(() => {
        if (product && product.id) {
            // Track ViewContent event
            trackViewContent({
                content_ids: [product.id],
                content_name: product.name,
                content_category: product.category,
                value: product.dmartPrice,
                currency: 'INR'
            });

            console.log('📊 Meta Pixel: ViewContent tracked for', product.name);
        }
    }, [product, trackViewContent]);

    // Optimized Sticky Image Gallery Logic with throttling and smooth transitions
    const handleScroll = useCallback(
        throttle(() => {
            if (!imageGalleryRef.current || !similarProductsRef.current || !productInfoRef.current) return;

            const imageGalleryRect = imageGalleryRef.current.getBoundingClientRect();
            const similarProductsRect = similarProductsRef.current.getBoundingClientRect();
            const productInfoRect = productInfoRef.current.getBoundingClientRect();

            // Check if we're on desktop (lg breakpoint)
            const isDesktop = window.innerWidth >= 1024;

            if (isDesktop) {
                const shouldStartSticky = window.scrollY > 100 && imageGalleryRect.top <= 80;
                const shouldStopSticky = similarProductsRect.top <= window.innerHeight * 0.8;
                const productInfoTooFar = productInfoRect.bottom < window.innerHeight * 0.2;

                const newStickyState = shouldStartSticky && !shouldStopSticky && !productInfoTooFar;

                // Only update state if it actually changes to prevent unnecessary re-renders
                setIsImageSticky(prev => {
                    if (prev !== newStickyState) {
                        return newStickyState;
                    }
                    return prev;
                });
            } else {
                setIsImageSticky(false);
            }
        }, 16) // ~60fps throttling
        , []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [handleScroll]);

    // Cart helper functions
    const handleAddToCart = async () => {
        if (!product) return;

        setAddingToCart(true);

        // Add haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }

        try {
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
                discount: product.mrp - product.dmartPrice,
                discountPercent: product.discountPercent || Math.round(((product.mrp - product.dmartPrice) / product.mrp) * 100)
            }));

            // Track AddToCart event with Meta Pixel
            trackAddToCart({
                content_ids: [product.id],
                content_name: product.name,
                content_category: product.category,
                value: product.dmartPrice * qty,
                currency: 'INR'
            });

            setShowSuccessMessage(true);

            setTimeout(() => {
                setAddingToCart(false);
                setShowSuccessMessage(false);
            }, 3000);
        } catch (error) {
            console.error('Error adding to cart:', error);
            setAddingToCart(false);
        }
    };

    const handleQuantityUpdate = (newQuantity) => {
        if (!product) return;

        const oldQuantity = getCartItemQuantity(product.id);


        if (newQuantity <= 0) {
            dispatch(removeFromCart(product.id));
        } else {
            dispatch(updateQuantity({ productId: product.id, quantity: newQuantity }));

            // If quantity increased, track as AddToCart
            if (newQuantity > oldQuantity) {
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
    };

    const handleSimilarQuantityUpdate = (similarProduct, newQuantity, e) => {
        e.preventDefault();
        e.stopPropagation();

        const oldQuantity = getCartItemQuantity(similarProduct.id);

        if (newQuantity <= 0) {
            dispatch(removeFromCart(similarProduct.id));
        } else {
            dispatch(updateQuantity({ productId: similarProduct.id, quantity: newQuantity }));

            // If quantity increased, track as AddToCart
            if (newQuantity > oldQuantity) {
                trackAddToCart({
                    content_ids: [similarProduct.id],
                    content_name: similarProduct.name,
                    content_category: similarProduct.category,
                    value: similarProduct.dmartPrice * (newQuantity - oldQuantity),
                    currency: 'INR'
                });

                console.log('📊 Meta Pixel: AddToCart tracked for similar product quantity increase');
            }

        }
    };

    const handleBuyNow = async () => {
        if (!product) return;

        setBuyingNow(true);

        try {
            const buyNowItem = {
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
                discount: product.mrp - product.dmartPrice,
                discountPercent: product.discountPercent || Math.round(((product.mrp - product.dmartPrice) / product.mrp) * 100),
                quantity: inCart ? currentCartQuantity : qty
            };

            // Track InitiateCheckout with Meta Pixel for Buy Now
            trackInitiateCheckout({
                content_ids: [product.id],
                content_name: product.name,
                num_items: inCart ? currentCartQuantity : qty,
                value: product.dmartPrice * (inCart ? currentCartQuantity : qty),
                currency: 'INR'
            });

            navigate('/checkout', {
                state: {
                    type: 'buyNow',
                    items: [buyNowItem],
                    totalItems: inCart ? currentCartQuantity : qty,
                    totalAmount: product.dmartPrice * (inCart ? currentCartQuantity : qty),
                    totalMRP: product.mrp * (inCart ? currentCartQuantity : qty),
                    totalSavings: (product.mrp - product.dmartPrice) * (inCart ? currentCartQuantity : qty)
                }
            });
        } catch (error) {
            console.error('Error with Buy Now:', error);
            setBuyingNow(false);
        }
    };

    const handleSimilarAddToCart = async (similarProduct, e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            dispatch(addToCart({
                id: similarProduct.id,
                name: similarProduct.name,
                images: similarProduct.images,
                mrp: similarProduct.mrp,
                dmartPrice: similarProduct.dmartPrice,
                weight: similarProduct.weight,
                pricePerUnit: similarProduct.pricePerUnit,
                brand: similarProduct.brand,
                category: similarProduct.category,
                isVeg: similarProduct.isVeg,
                badge: similarProduct.badge,
                discount: similarProduct.discount || (similarProduct.mrp - similarProduct.dmartPrice),
                discountPercent: similarProduct.discountPercent || Math.round(((similarProduct.mrp - similarProduct.dmartPrice) / similarProduct.mrp) * 100)
            }));

            // Track AddToCart for similar product with Meta Pixel
            trackAddToCart({
                content_ids: [similarProduct.id],
                content_name: similarProduct.name,
                content_category: similarProduct.category,
                value: similarProduct.dmartPrice,
                currency: 'INR'
            });
        } catch (error) {
            console.error('Error adding similar product to cart:', error);
        }
    };

    const toggleWishlist = (productId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setWishlist(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));

        // Track wishlist action as custom event
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('trackCustom', 'AddToWishlist', {
                content_ids: [productId],
                currency: 'INR'
            });
            console.log('📊 Meta Pixel: AddToWishlist tracked for product', productId);
        }
    };


    const isInCart = (productId) => {
        return cartItems.some(item => item.id === productId);
    };

    const getCartItemQuantity = (productId) => {
        const item = cartItems.find(item => item.id === productId);
        return item ? item.quantity : 0;
    };

    // Enhanced Loading Skeleton
    const LoadingSkeleton = () => (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                <div className="flex items-center space-x-2 mb-4 sm:mb-6">
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 lg:gap-8">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-sm">
                        <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-64 sm:h-80 lg:h-96 xl:h-[28rem] rounded-lg sm:rounded-xl animate-pulse mb-4"></div>
                        <div className="flex space-x-2 sm:space-x-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-gray-200 h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg animate-pulse flex-shrink-0"></div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div className="bg-gray-200 h-6 sm:h-8 rounded animate-pulse mb-4"></div>
                            <div className="space-y-2 mb-4">
                                <div className="bg-gray-200 h-4 rounded animate-pulse w-3/4"></div>
                                <div className="bg-gray-200 h-4 rounded animate-pulse w-1/2"></div>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-4 mb-4">
                                <div className="bg-gray-200 h-8 sm:h-10 rounded animate-pulse mb-2"></div>
                                <div className="bg-gray-200 h-4 rounded animate-pulse w-1/3"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Loading state
    if (loading) {
        return <LoadingSkeleton />;
    }

    // Error state
    if (error) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
                    <Link to="/" className="inline-flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors text-sm sm:text-base">
                        <ArrowBack className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Back to Homepage
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm text-center max-w-md mx-auto"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ArrowBack className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-red-600">Error Loading Product</h2>
                        <p className="text-gray-600 mb-6 text-sm sm:text-base">{error}</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => dispatch(fetchProductById(id))}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                        >
                            Try Again
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Product not found
    if (!product) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
                    <Link to="/" className="inline-flex items-center text-blue-600 mb-6 hover:text-blue-800 transition-colors text-sm sm:text-base">
                        <ArrowBack className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Back to Homepage
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm text-center max-w-md mx-auto"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">Product not found</h2>
                        <p className="text-gray-600 text-sm sm:text-base">The product may be unavailable or removed.</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    const savings = product.mrp - product.dmartPrice;
    const currentCartQuantity = getCartItemQuantity(product.id);
    const inCart = isInCart(product.id);
    const discountPercent = product.discountPercent || Math.round((savings / product.mrp) * 100);

    return (
        <div className="bg-gray-50 relative min-h-screen pb-20 sm:pb-6">
            {/* Enhanced Success Message */}
            <AnimatePresence>
                {showSuccessMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="fixed top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg z-50 flex items-center space-x-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Added to cart successfully!</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                {/* Enhanced Breadcrumb */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 flex items-center flex-wrap gap-1 sm:gap-2"
                >
                    <Link to="/" className="hover:text-green-600 transition-colors flex items-center">
                        <ArrowBack className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Home
                    </Link>
                    <span>/</span>
                    <span className="text-gray-700 font-medium">{product.brand}</span>
                </motion.div>

                {/* Main Grid - Enhanced Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 lg:gap-8 xl:gap-12">
                    {/* Enhanced Image Gallery with Smooth Sticky Functionality - NO ARROWS OR DOTS */}
                    <motion.div
                        ref={imageGalleryRef}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`transition-all duration-500 ease-in-out will-change-transform ${isImageSticky
                            ? 'fixed top-20 left-3 sm:left-4 lg:left-6 w-[calc(50%-2rem)] lg:w-[calc(50%-3rem)] xl:w-[calc(50%-4.5rem)] z-30 transform-gpu'
                            : 'relative'
                            }`}
                        style={{
                            transform: isImageSticky ? 'translateZ(0)' : 'none' // Force GPU acceleration
                        }}
                    >
                        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 shadow-lg transition-shadow duration-300">
                            {product.images && product.images.length > 0 ? (
                                <>
                                    <div className="relative mb-4">
                                        {/* UPDATED: Removed Navigation, Pagination modules and props */}
                                        <Swiper
                                            modules={[Thumbs]}
                                            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                            spaceBetween={10}
                                            onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                                            className="rounded-lg sm:rounded-xl overflow-hidden"
                                        >
                                            {product.images.map((image, idx) => (
                                                <SwiperSlide key={idx}>
                                                    <div className="relative bg-gray-50 rounded-lg sm:rounded-xl overflow-hidden">
                                                        <img
                                                            src={image.url}
                                                            alt={image.alt || `${product.name} ${idx + 1}`}
                                                            className={`w-full h-full object-contain transition-all duration-300 ${isImageSticky ? 'h-48 sm:h-64 lg:h-80' : 'h-64 sm:h-80 lg:h-96 xl:h-[28rem]'
                                                                }`}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/600x600?text=No+Image';
                                                            }}
                                                        />

                                                        {/* Image Counter */}
                                                        {/* <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                            {idx + 1} / {product.images.length}
                                                        </div> */}
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>

                                        {/* Share Button */}
                                    
                                    </div>

                                    {/* Enhanced Responsive Thumbnails with Smooth Transitions */}
                                    <div className="w-full">
                                        <Swiper
                                            modules={[Thumbs]}
                                            onSwiper={setThumbsSwiper}
                                            slidesPerView="auto"
                                            spaceBetween={8}
                                            watchSlidesProgress
                                            freeMode={true}
                                            className="thumbnail-swiper w-full"
                                            breakpoints={{
                                                320: {
                                                    slidesPerView: 3,
                                                    spaceBetween: 6
                                                },
                                                480: {
                                                    slidesPerView: 4,
                                                    spaceBetween: 8
                                                },
                                                640: {
                                                    slidesPerView: 5,
                                                    spaceBetween: 10
                                                },
                                                768: {
                                                    slidesPerView: 6,
                                                    spaceBetween: 12
                                                },
                                                1024: {
                                                    slidesPerView: isImageSticky ? 4 : 5,
                                                    spaceBetween: 12
                                                }
                                            }}
                                        >
                                            {product.images.map((image, idx) => (
                                                <SwiperSlide key={idx} className="!w-auto">
                                                    <div className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 ${activeImageIndex === idx
                                                        ? 'ring-2 ring-green-500 ring-offset-2 shadow-lg scale-105'
                                                        : 'hover:ring-2 hover:ring-gray-300 shadow-sm hover:shadow-md hover:scale-105'
                                                        }`}>
                                                        <img
                                                            src={image.url}
                                                            alt={image.alt || `thumb ${idx + 1}`}
                                                            className={`object-cover transition-all duration-300 ${isImageSticky
                                                                ? 'w-12 h-12 sm:w-14 sm:h-14'
                                                                : 'w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20'
                                                                }`}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                                                            }}
                                                        />
                                                        {activeImageIndex === idx && (
                                                            <div className="absolute inset-0 bg-green-500/10 rounded-lg transition-opacity duration-300"></div>
                                                        )}
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </>
                            ) : (
                                <div className={`w-full bg-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${isImageSticky
                                    ? 'h-48 sm:h-64 lg:h-80'
                                    : 'h-64 sm:h-80 lg:h-96 xl:h-[28rem]'
                                    }`}>
                                    <span className="text-gray-500 text-sm sm:text-base">No Image Available</span>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Spacer for sticky gallery */}
                    {isImageSticky && (
                        <div className="hidden lg:block"></div>
                    )}

                    {/* Enhanced Product Info */}
                    <motion.div
                        ref={productInfoRef}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 sm:space-y-5"
                    >
                        {/* Main Product Info Card */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm relative">
                            {/* Wishlist Button */}


                            {/* Product Title */}
                            <h1 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-600 mb-2 sm:mb-3 leading-tight">
                                {product.name} : {product.weight}
                            </h1>

                            {/* Enhanced Pills & Rating */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">


                                {/* Enhanced Star Rating */}
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-full border border-yellow-200">
                                    <StarRating
                                        rating={product.rating || 4.2}
                                        reviews={product.reviewsCount || 156}
                                        size="default"
                                    />
                                </div>

                                {product.badge && (
                                    <Pill color="bg-orange-100 text-orange-700">{product.badge}</Pill>
                                )}



                                <div className="flex items-center bg-green-50 px-2 sm:px-3 py-1 rounded-full border border-green-200">
                                    <Verified className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1" />
                                    <span className="text-xs sm:text-sm font-medium text-green-700">Verified</span>
                                </div>
                            </div>

                            {/* Enhanced Price Block */}
                            <div className="rounded-xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-3 sm:p-5 mb-3 sm:mb-5">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                            <span className="text-gray-500 line-through text-base sm:text-lg">
                                                MRP: ₹{product.mrp}
                                            </span>
                                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-lg text-xs sm:text-sm font-bold shadow-sm">
                                                -{discountPercent}%
                                            </div>
                                        </div>
                                        <div className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-1">
                                            ₹{product.dmartPrice}
                                        </div>
                                        <div className="text-green-700 font-semibold text-sm sm:text-base lg:text-lg flex items-center">
                                            <LocalOffer className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                                            Save ₹{savings} ({discountPercent}% off)
                                        </div>
                                        <div className="text-xs sm:text-sm text-gray-600 mt-2">
                                            {product.pricePerUnit}
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="flex flex-col space-y-2">
                                            <Pill color="bg-blue-100 text-blue-700" size="small">
                                                <Security className="w-3 h-3 mr-1" />
                                                Assured Quality
                                            </Pill>
                                            <Pill color="bg-green-100 text-green-700" size="small">
                                                <LocalShipping className="w-3 h-3 mr-1" />
                                                Fast Delivery
                                            </Pill>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Cart Controls */}
                            <div className="space-y-4 sm:space-y-5">
                                {inCart ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm sm:text-base font-semibold text-blue-800">
                                                Quantity in cart:
                                            </span>
                                            <div className="flex items-center space-x-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleQuantityUpdate(currentCartQuantity - 1)}
                                                    className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200"
                                                >
                                                    <Remove className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                                </motion.button>

                                                <div className="flex flex-col items-center bg-white rounded-xl px-4 py-2 shadow-sm border border-blue-200">
                                                    <span className="text-xl sm:text-2xl font-bold text-blue-700">
                                                        {currentCartQuantity}
                                                    </span>
                                                    <span className="text-xs text-blue-600 font-medium">in cart</span>
                                                </div>

                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleQuantityUpdate(currentCartQuantity + 1)}
                                                    className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200"
                                                >
                                                    <Add className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <span className="text-sm sm:text-base font-semibold text-gray-700">
                                            Quantity:
                                        </span>
                                        <Qty
                                            value={qty}
                                            onChange={setQty}
                                            max={product.stockQuantity || 10}
                                            size="default"
                                        />
                                    </div>
                                )}

                                {/* Enhanced Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                    {!inCart && (
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={handleAddToCart}
                                            disabled={addingToCart}
                                            className={`flex-1 py-3 sm:py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl ${addingToCart
                                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white cursor-wait'
                                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                                                }`}
                                        >
                                            {addingToCart ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                    >
                                                        <Add className="w-5 h-5" />
                                                    </motion.div>
                                                    <span>ADDING TO CART...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingCart className="w-5 h-5" />
                                                    <span>ADD TO CART</span>
                                                </>
                                            )}
                                        </motion.button>
                                    )}

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={handleBuyNow}
                                        disabled={buyingNow}
                                        className={`flex-1 py-3 sm:py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl ${buyingNow
                                            ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white cursor-wait'
                                            : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                                            }`}
                                    >
                                        {buyingNow ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <Bolt className="w-5 h-5" />
                                                </motion.div>
                                                <span>PROCESSING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Bolt className="w-5 h-5" />
                                                <span>BUY NOW</span>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </div>

                            {/* Enhanced Total Preview */}
                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 sm:p-5 mt-4 sm:mt-6 border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm sm:text-base font-semibold text-gray-700">
                                        Total ({inCart ? currentCartQuantity : qty} item{(inCart ? currentCartQuantity : qty) > 1 ? 's' : ''})
                                    </span>
                                    <span className="font-bold text-xl sm:text-2xl text-green-600">
                                        ₹{(product.dmartPrice * (inCart ? currentCartQuantity : qty)).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xs sm:text-sm text-gray-500">
                                    <span>Total Savings</span>
                                    <span className="text-green-600 font-semibold">
                                        ₹{(savings * (inCart ? currentCartQuantity : qty)).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* View Cart Button */}
                            {inCart && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 sm:mt-6"
                                >
                                    <Link
                                        to="/cart"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 sm:py-4 rounded-xl font-bold inline-flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 text-sm sm:text-base shadow-lg hover:shadow-xl"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <span>VIEW CART & CHECKOUT</span>
                                    </Link>
                                </motion.div>
                            )}

                            {/* Enhanced Offers */}
                            <div className="mt-6 sm:mt-8">
                                <div className="font-bold mb-3 sm:mb-4 text-base sm:text-lg text-gray-800">
                                    Special Offers
                                </div>
                                <div className="space-y-2 sm:space-y-3">
                                    {[
                                        { icon: "💳", text: "5% Instant Discount with select bank cards" },
                                        { icon: "🚚", text: "Free delivery on orders above ₹499" },
                                        { icon: "💰", text: "No-cost EMI on eligible orders" },
                                        { icon: "🎁", text: "Extra 2% off on prepaid orders" }
                                    ].map((offer, idx) => (
                                        <div key={idx} className="flex items-center text-xs sm:text-sm text-gray-700 bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-200 hover:bg-yellow-100 transition-colors duration-200">
                                            <span className="mr-2 sm:mr-3 text-base sm:text-lg">{offer.icon}</span>
                                            <span>{offer.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Product Details */}
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                            <div
                                className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors duration-200"
                                onClick={() => setExpandedDetails(!expandedDetails)}
                            >
                                <h3 className="font-bold mb-0 text-base sm:text-lg text-gray-800">
                                    Product Details
                                </h3>
                                <motion.div
                                    animate={{ rotate: expandedDetails ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ExpandMore className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                                </motion.div>
                            </div>

                            <AnimatePresence>
                                {expandedDetails && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed mt-4">
                                            {product.description || `${product.name} is a quality selection perfect for everyday needs, presented in value-friendly pack sizes with trusted brand assurance. Our commitment to quality ensures you get the best value for your money with every purchase.`}
                                        </p>

                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                                            {[
                                                { label: "Brand", value: product.brand },
                                                { label: "Weight", value: product.weight },
                                                { label: "Stock", value: "In Stock", color: "text-green-600" },
                                                { label: "Rating", value: `${product.rating || 4.2}`, icon: "⭐" },
                                                { label: "Reviews", value: (product.reviewsCount || 156).toLocaleString() }
                                            ].map((detail, idx) => (
                                                <div key={idx} className="p-3 sm:p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:shadow-sm">
                                                    <div className="text-gray-500 mb-1 font-medium">{detail.label}</div>
                                                    <div className={`font-bold flex items-center ${detail.color || 'text-gray-900'}`}>
                                                        {detail.value}
                                                        {detail.icon && <span className="ml-1">{detail.icon}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Enhanced Mobile-Responsive Similar Products Section */}
                {similarProducts && similarProducts.length > 0 && (
                    <motion.div
                        ref={similarProductsRef}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 sm:mt-12"
                    >
                        <div className="bg-white p-3 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
                            {/* Header Section - Mobile Optimized */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 lg:mb-8">
                                <div className="mb-3 sm:mb-0">
                                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                                        Similar Products
                                    </h2>
                                    <p className="text-xs sm:text-base text-gray-600">
                                        Other products you might like
                                    </p>
                                </div>

                            </div>

                            {/* Products Swiper - Enhanced Mobile Responsiveness */}
                            <div className="relative -mx-1 sm:mx-0">
                                <Swiper
                                    modules={[Navigation, Autoplay]}
                                    slidesPerView={1.5}
                                    spaceBetween={8}
                                    centeredSlides={false}
                                    autoplay={{
                                        delay: 4000,
                                        disableOnInteraction: false,
                                        pauseOnMouseEnter: true
                                    }}
                                    navigation={{
                                        prevEl: navigationPrevRef.current,
                                        nextEl: navigationNextRef.current,
                                    }}
                                    onBeforeInit={(swiper) => {
                                        swiper.params.navigation.prevEl = navigationPrevRef.current;
                                        swiper.params.navigation.nextEl = navigationNextRef.current;
                                    }}
                                    className="product-swiper px-1 sm:px-0"
                                    breakpoints={{
                                        375: {
                                            slidesPerView: 1.7,
                                            spaceBetween: 10
                                        },
                                        425: {
                                            slidesPerView: 2.1,
                                            spaceBetween: 12
                                        },
                                        480: {
                                            slidesPerView: 2.3,
                                            spaceBetween: 14
                                        },
                                        640: {
                                            slidesPerView: 2.8,
                                            spaceBetween: 16
                                        },
                                        768: {
                                            slidesPerView: 3.2,
                                            spaceBetween: 18
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
                                >
                                    {similarProducts.map((p, index) => {
                                        const similarInCart = isInCart(p.id);
                                        const similarCartQuantity = getCartItemQuantity(p.id);

                                        return (
                                            <SwiperSlide key={p.id}>
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="relative h-full"
                                                >
                                                    <Link to={`/product/${p.id}`} className="block group h-full">
                                                        <motion.div
                                                            whileHover={{
                                                                y: -4,
                                                                scale: 1.01,
                                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                                            }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            className="bg-white border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 h-full flex flex-col relative group transition-all duration-300 hover:border-green-300 shadow-sm hover:shadow-lg"
                                                        >
                                                            {/* Enhanced Badges - Mobile Optimized */}
                                                            <div className="absolute top-1.5 left-1.5 z-10 flex flex-col space-y-1">
                                                                <span className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg">
                                                                    SIMILAR
                                                                </span>
                                                                {similarInCart && (
                                                                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg shadow-lg">
                                                                        {similarCartQuantity}x
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Wishlist Button - Mobile Optimized */}
                                                            <motion.button
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => toggleWishlist(p.id, e)}
                                                                className="absolute top-1.5 right-1.5 z-10 p-1 sm:p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                            >
                                                                {wishlist[p.id] ? (
                                                                    <Favorite className="text-red-500 transition-colors duration-200 w-3 h-3 sm:w-4 sm:h-4" />
                                                                ) : (
                                                                    <FavoriteBorder className="text-gray-400 hover:text-red-500 transition-colors duration-200 w-3 h-3 sm:w-4 sm:h-4" />
                                                                )}
                                                            </motion.button>

                                                            {/* Enhanced Product Image - Mobile Optimized */}
                                                            <div className="relative w-full h-20 xs:h-24 sm:h-32 lg:h-40 mb-2 sm:mb-3 bg-gray-50 rounded-md sm:rounded-lg overflow-hidden">
                                                                <motion.img
                                                                    whileHover={{ scale: 1.05 }}
                                                                    transition={{ duration: 0.3 }}
                                                                    src={p.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image'}
                                                                    alt={p.images?.[0]?.alt || p.name}
                                                                    className="w-full h-full object-contain p-1 sm:p-2"
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                                                                    }}
                                                                />

                                                                {/* Discount Badge - Mobile Optimized */}
                                                                <div className="absolute bottom-1 right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-md shadow-sm">
                                                                    -{p.discountPercent || Math.round(((p.mrp - p.dmartPrice) / p.mrp) * 100)}%
                                                                </div>

                                                                {/* Veg/Non-Veg Indicator - Mobile Optimized */}
                                                                {p.isVeg && (
                                                                    <div className="absolute bottom-1 left-1 w-3 h-3 sm:w-4 sm:h-4 border border-green-600 rounded-sm flex items-center justify-center bg-white">
                                                                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-600 rounded-full"></div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Product Name - Mobile Optimized */}
                                                            <h3 className="text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2 text-center px-0.5 sm:px-1 line-clamp-2 min-h-[1.5rem] xs:min-h-[2rem] sm:min-h-[2.5rem] leading-tight">
                                                                {p.name.length > 35 ? `${p.name.substring(0, 35)}...` : p.name}
                                                            </h3>

                                                            {/* Enhanced Rating - Mobile Optimized */}
                                                            <div className="flex items-center justify-center mb-2 sm:mb-3">
                                                                <StarRating
                                                                    rating={p.rating || 4.2}
                                                                    reviews={p.reviewsCount || 87}
                                                                    size="small"
                                                                />
                                                            </div>

                                                            {/* Enhanced Price Section - Mobile Optimized */}
                                                            <div className="mb-2 sm:mb-4 flex-grow">
                                                                <div className="text-center">
                                                                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mb-0.5 sm:mb-1">
                                                                        <span className="text-gray-500 line-through text-[10px] xs:text-xs sm:text-sm">
                                                                            ₹{p.mrp}
                                                                        </span>
                                                                        <span className="text-xs xs:text-sm sm:text-base font-bold text-gray-900">
                                                                            ₹{p.dmartPrice}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-green-600 text-[10px] xs:text-xs sm:text-sm font-semibold">
                                                                        Save ₹{(p.mrp - p.dmartPrice)}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Enhanced Cart Controls - Mobile Optimized */}
                                                            <div className="mt-auto">
                                                                {similarInCart ? (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-1.5 sm:p-2 border border-blue-200"
                                                                    >
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={(e) => handleSimilarQuantityUpdate(p, similarCartQuantity - 1, e)}
                                                                            className="p-1 sm:p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200"
                                                                        >
                                                                            <Remove className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                                                                        </motion.button>

                                                                        <div className="flex flex-col items-center px-1 sm:px-2">
                                                                            <span className="text-xs sm:text-sm font-bold text-blue-700">
                                                                                {similarCartQuantity}
                                                                            </span>
                                                                            <span className="text-[8px] xs:text-[10px] sm:text-xs text-blue-600 font-medium">
                                                                                in cart
                                                                            </span>
                                                                        </div>

                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={(e) => handleSimilarQuantityUpdate(p, similarCartQuantity + 1, e)}
                                                                            className="p-1 sm:p-1.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-blue-200"
                                                                        >
                                                                            <Add className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
                                                                        </motion.button>
                                                                    </motion.div>
                                                                ) : (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.01 }}
                                                                        whileTap={{ scale: 0.99 }}
                                                                        onClick={(e) => handleSimilarAddToCart(p, e)}
                                                                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold flex items-center justify-center space-x-1 sm:space-x-2 transition-all duration-300 shadow-md hover:shadow-lg text-[10px] xs:text-xs sm:text-sm"
                                                                    >
                                                                        <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                                                                        <span className="hidden xs:inline">ADD TO CART</span>
                                                                        <span className="xs:hidden">ADD</span>
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    </Link>
                                                </motion.div>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>

                                {/* Enhanced Custom Navigation Buttons - Desktop Only */}
                                <motion.button
                                    ref={navigationPrevRef}
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="hidden lg:flex absolute top-1/2 -left-4 xl:-left-6 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-full w-10 h-10 xl:w-12 xl:h-12 items-center justify-center shadow-lg hover:border-green-400 hover:text-green-600 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                >
                                    <ArrowBackIos className="text-gray-600 text-base xl:text-lg ml-0.5" />
                                </motion.button>

                                <motion.button
                                    ref={navigationNextRef}
                                    whileHover={{ scale: 1.1, x: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="hidden lg:flex absolute top-1/2 -right-4 xl:-right-6 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-full w-10 h-10 xl:w-12 xl:h-12 items-center justify-center shadow-lg hover:border-green-400 hover:text-green-600 z-10 transition-all duration-300 opacity-0 group-hover:opacity-100"
                                >
                                    <ArrowForwardIos className="text-gray-600 text-base xl:text-lg" />
                                </motion.button>
                            </div>

                            {/* Mobile Scroll Indicator */}
                            <div className="flex justify-center mt-3 sm:hidden">
                                <div className="flex space-x-1">
                                    {[...Array(Math.min(similarProducts.length, 5))].map((_, i) => (
                                        <div key={i} className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* Enhanced Sticky Mobile CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl p-3 sm:hidden z-50 backdrop-blur-sm bg-white/95">
                <div className="flex items-center gap-3">
                    {inCart ? (
                        <>
                            <div className="flex items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-2 border border-blue-200">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleQuantityUpdate(currentCartQuantity - 1)}
                                    className="p-1.5 bg-white rounded-full shadow-sm border border-blue-200"
                                >
                                    <Remove className="w-3 h-3 text-blue-600" />
                                </motion.button>
                                <span className="px-3 font-bold text-sm text-blue-700">
                                    {currentCartQuantity}
                                </span>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleQuantityUpdate(currentCartQuantity + 1)}
                                    className="p-1.5 bg-white rounded-full shadow-sm border border-blue-200"
                                >
                                    <Add className="w-3 h-3 text-blue-600" />
                                </motion.button>
                            </div>
                            <Link
                                to="/cart"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold text-center text-sm shadow-lg"
                            >
                                Cart — ₹{(product.dmartPrice * currentCartQuantity).toLocaleString()}
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBuyNow}
                                disabled={buyingNow}
                                className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 text-sm shadow-lg ${buyingNow
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                    }`}
                            >
                                {buyingNow ? '...' : 'Buy'}
                            </motion.button>
                        </>
                    ) : (
                        <>
                            <Qty value={qty} onChange={setQty} max={product.stockQuantity || 10} size="small" />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 text-sm shadow-lg ${addingToCart
                                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                    }`}
                            >
                                {addingToCart ? 'Adding...' : `Add`}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleBuyNow}
                                disabled={buyingNow}
                                className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 text-sm shadow-lg ${buyingNow
                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                    : 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                                    }`}
                            >
                                {buyingNow ? '...' : 'Buy'}
                            </motion.button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

}
