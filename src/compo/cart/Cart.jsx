import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import useMetaPixel from '../../hooks/useMetaPixel';
import {
    ShoppingCartOutlined,
    Add,
    Remove,
    Delete,
    LocalOfferOutlined,
    ArrowBack,
    SecurityOutlined,
    LocalShippingOutlined,
    SupportAgentOutlined,
    CreditCardOutlined,
    ExpandMore,
    ExpandLess
} from '@mui/icons-material';
import {
    removeFromCart,
    updateQuantity,
    clearCart
} from '../../store/slices/cartSlice';
import { useState } from 'react';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showMobileSummary, setShowMobileSummary] = useState(false);

    // Meta Pixel tracking hook - with error handling
    let trackRemoveFromCart, trackInitiateCheckout, trackAddToCart;
    try {
        const metaPixel = useMetaPixel();
        trackRemoveFromCart = metaPixel.trackRemoveFromCart;
        trackInitiateCheckout = metaPixel.trackInitiateCheckout;
        trackAddToCart = metaPixel.trackAddToCart;
    } catch (error) {
        console.warn('Meta Pixel hook not available:', error);
        // Fallback functions
        trackRemoveFromCart = () => {};
        trackInitiateCheckout = () => {};
        trackAddToCart = () => {};
    }

    const {
        items,
        totalItems,
        totalAmount,
        totalMRP,
        totalSavings
    } = useSelector(state => state.cart);

    const deliveryFee = totalAmount > 200 ? 0 : 40;
    const finalTotal = totalAmount + deliveryFee;

    // Track cart view on component mount
    useEffect(() => {
        if (items.length > 0) {
            console.log('📊 Meta Pixel: Cart viewed with', items.length, 'items');
        }
    }, [items.length]);

    const handleQuantityChange = (productId, newQuantity) => {
        try {
            if (newQuantity < 0) return;

            const item = items.find(item => item.id === productId);
            
            if (!item) {
                console.error('Item not found:', productId);
                return;
            }

            if (newQuantity === 0) {
                // Remove item if quantity is 0
                handleRemoveItem(productId);
                return;
            }

            if (newQuantity > item.quantity) {
                // Quantity increased - track as AddToCart
                try {
                    trackAddToCart({
                        content_ids: [item.id],
                        content_name: item.name,
                        content_category: item.category || 'unknown',
                        value: item.dmartPrice,
                        currency: 'INR'
                    });
                } catch (error) {
                    console.warn('Meta Pixel trackAddToCart error:', error);
                }
            } else if (newQuantity < item.quantity) {
                // Quantity decreased - track as RemoveFromCart
                try {
                    trackRemoveFromCart({
                        content_ids: [item.id],
                        content_name: item.name,
                        content_category: item.category || 'unknown',
                        value: item.dmartPrice,
                        currency: 'INR'
                    });
                } catch (error) {
                    console.warn('Meta Pixel trackRemoveFromCart error:', error);
                }
            }
            
            dispatch(updateQuantity({ productId, quantity: newQuantity }));
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleRemoveItem = (productId) => {
        try {
            const item = items.find(item => item.id === productId);
            
            if (!item) {
                console.error('Item not found for removal:', productId);
                return;
            }

            // Track remove from cart event with error handling
            try {
                trackRemoveFromCart({
                    content_ids: [item.id],
                    content_name: item.name || 'Unknown Product',
                    content_category: item.category || 'unknown',
                    value: (item.dmartPrice || 0) * (item.quantity || 1),
                    currency: 'INR'
                });
            } catch (error) {
                console.warn('Meta Pixel trackRemoveFromCart error:', error);
            }
            
            dispatch(removeFromCart(productId));
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    const handleClearCart = () => {
        try {
            if (window.confirm('Are you sure you want to clear your cart?')) {
                // Track clear cart as custom event
                try {
                    if (typeof window !== 'undefined' && window.fbq) {
                        window.fbq('trackCustom', 'ClearCart', {
                            content_type: 'product',
                            num_items: totalItems,
                            value: totalAmount,
                            currency: 'INR'
                        });
                        console.log('📊 Meta Pixel: ClearCart tracked');
                    }
                } catch (error) {
                    console.warn('Meta Pixel ClearCart tracking error:', error);
                }
                
                dispatch(clearCart());
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const handleProceedToCheckout = () => {
        try {
            if (items.length === 0) {
                alert('Your cart is empty. Please add items to proceed.');
                return;
            }

            // Track initiate checkout event
            try {
                trackInitiateCheckout({
                    content_ids: items.map(item => item.id),
                    num_items: totalItems,
                    value: finalTotal,
                    currency: 'INR'
                });
            } catch (error) {
                console.warn('Meta Pixel trackInitiateCheckout error:', error);
            }

            navigate('/checkout', {
                state: {
                    type: 'cart',
                    items: items,
                    totalItems: totalItems,
                    totalAmount: totalAmount,
                    totalMRP: totalMRP,
                    totalSavings: totalSavings,
                    deliveryFee: deliveryFee,
                    finalTotal: finalTotal
                }
            });
        } catch (error) {
            console.error('Error proceeding to checkout:', error);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <ShoppingCartOutlined className="text-gray-300 mb-4" style={{ fontSize: '3rem' }} />
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-700 mb-3">Your cart is empty</h1>
                        <p className="text-gray-500 mb-6 max-w-sm text-sm px-4">
                            Looks like you {"haven't"} added anything to your cart yet.
                            Start shopping to fill it up!
                        </p>
                        <Link
                            to="/"
                            className="bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <ArrowBack className="w-4 h-4" />
                            <span>Continue Shopping</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-8">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
                {/* Mobile Header */}
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                    <Link
                        to="/"
                        className="flex items-center text-gray-600 hover:text-green-600 transition-colors"
                    >
                        <ArrowBack className="w-4 h-4 mr-2" />
                        <span className="font-medium text-xs sm:text-sm">Continue Shopping</span>
                    </Link>

                    <div className="flex items-center justify-between sm:justify-end">
                        <div className="flex items-center space-x-2">
                            <ShoppingCartOutlined className="text-green-600 w-5 h-5" />
                            <h1 className="text-base sm:text-xl font-bold text-gray-800">Cart</h1>
                        </div>
                        <span className="bg-green-600 text-white text-xs rounded-full px-2 py-1 ml-3">
                            {totalItems} items
                        </span>
                    </div>
                </div>

                {/* Mobile Summary Toggle */}
                <div className="lg:hidden mb-4">
                    <button
                        onClick={() => setShowMobileSummary(!showMobileSummary)}
                        className="w-full bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="font-semibold text-gray-800 text-sm">Order Total</span>
                            <span className="text-base font-bold text-green-600">₹{finalTotal.toLocaleString()}</span>
                        </div>
                        {showMobileSummary ? <ExpandLess className="w-5 h-5" /> : <ExpandMore className="w-5 h-5" />}
                    </button>

                    <AnimatePresence>
                        {showMobileSummary && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-white mt-2 rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-3 space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span>Items ({totalItems})</span>
                                        <span>₹{totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>MRP Total</span>
                                        <span className="line-through text-gray-500">₹{totalMRP.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-green-600 font-semibold">
                                        <span>Total Savings</span>
                                        <span>-₹{totalSavings.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span>Delivery Fee</span>
                                        {deliveryFee === 0 ? (
                                            <span className="text-green-600 font-semibold">FREE</span>
                                        ) : (
                                            <span>₹{deliveryFee}</span>
                                        )}
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between font-bold text-sm">
                                        <span>Total Amount</span>
                                        <span className="text-green-600">₹{finalTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3">
                        {/* Clear Cart Button */}
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm">
                            <h2 className="text-sm sm:text-base font-semibold">Cart Items ({totalItems})</h2>
                            <button
                                onClick={handleClearCart}
                                className="text-red-500 text-xs py-2 px-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Items List */}
                        <div className="space-y-3">
                            <AnimatePresence>
                                {items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-100"
                                    >
                                        <div className="flex items-start space-x-3">
                                            {/* Product Image */}
                                            <Link to={`/product/${item.id}`} className="flex-shrink-0">
                                                <img
                                                    src={item.images?.[0]?.url || 'https://via.placeholder.com/80x80?text=No+Image'}
                                                    alt={item.name || 'Product'}
                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg bg-gray-50 p-1 hover:scale-105 transition-transform"
                                                />
                                            </Link>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/product/${item.id}`}
                                                    className="hover:text-green-600 transition-colors block mb-1"
                                                >
                                                    <h3 className="font-semibold text-xs sm:text-sm text-gray-800 line-clamp-2 leading-tight">
                                                        {item.name || 'Unknown Product'}
                                                    </h3>
                                                </Link>

                                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                                                    {item.weight && <span>{item.weight}</span>}
                                                    {item.brand && <span>{item.brand}</span>}
                                                    {item.isVeg && (
                                                        <div className="w-3 h-3 border border-green-600 rounded-sm flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                                                    <span className="text-sm sm:text-base font-bold text-gray-900">
                                                        ₹{(item.dmartPrice || 0).toLocaleString()}
                                                    </span>
                                                    {item.mrp && (
                                                        <>
                                                            <span className="text-xs text-gray-500 line-through">
                                                                ₹{item.mrp.toLocaleString()}
                                                            </span>
                                                            <span className="text-xs text-green-600 font-semibold">
                                                                Save ₹{(item.mrp - (item.dmartPrice || 0)).toLocaleString()}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Quantity Controls and Actions */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                                                            className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
                                                            disabled={(item.quantity || 1) <= 1}
                                                        >
                                                            <Remove className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-3 py-1.5 text-sm font-semibold min-w-[40px] text-center bg-gray-50">
                                                            {item.quantity || 1}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                                                            className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
                                                        >
                                                            <Add className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id)}
                                                            className="text-red-500 hover:text-red-700 p-1 transition-colors"
                                                            title="Remove item"
                                                        >
                                                            <Delete className="w-4 h-4" />
                                                        </button>
                                                        <div className="text-right">
                                                            <span className="text-xs text-gray-600">Total:</span>
                                                            <div className="text-sm font-bold text-gray-900">
                                                                ₹{((item.dmartPrice || 0) * (item.quantity || 1)).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Desktop Cart Summary */}
                    <div className="hidden lg:block space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-4">
                            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span>Items ({totalItems})</span>
                                    <span>₹{totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>MRP Total</span>
                                    <span className="line-through text-gray-500">₹{totalMRP.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600 font-semibold">
                                    <span>Total Savings</span>
                                    <span>-₹{totalSavings.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Delivery Fee</span>
                                    {deliveryFee === 0 ? (
                                        <span className="text-green-600 font-semibold">FREE</span>
                                    ) : (
                                        <span>₹{deliveryFee}</span>
                                    )}
                                </div>
                                <hr />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-green-600">₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Free Delivery Notice */}
                            {deliveryFee > 0 && (
                                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                    <p className="text-sm text-blue-800 text-center">
                                        Add ₹{(499 - totalAmount).toLocaleString()} more for FREE delivery!
                                    </p>
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button
                                onClick={handleProceedToCheckout}
                                className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <CreditCardOutlined className="w-5 h-5" />
                                <span>Proceed to Checkout</span>
                            </button>
                        </div>

                        {/* Benefits */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h4 className="font-semibold mb-4">Why shop with DMart?</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center space-x-3">
                                    <SecurityOutlined className="text-green-600 w-5 h-5" />
                                    <span>100% Secure Payments</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <LocalShippingOutlined className="text-green-600 w-5 h-5" />
                                    <span>Free delivery on orders above ₹499</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <SupportAgentOutlined className="text-green-600 w-5 h-5" />
                                    <span>24/7 Customer Support</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <LocalOfferOutlined className="text-green-600 w-5 h-5" />
                                    <span>Best Prices Guaranteed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sticky Bottom Checkout */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-600">Total Amount</span>
                        <span className="text-base font-bold text-green-600">₹{finalTotal.toLocaleString()}</span>
                    </div>
                    {deliveryFee > 0 && (
                        <span className="text-xs text-blue-600 max-w-[140px] text-right leading-tight">
                            Add ₹{(499 - totalAmount).toLocaleString()} more for free delivery
                        </span>
                    )}
                </div>

                <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-green-600 text-white py-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                    <CreditCardOutlined className="w-4 h-4" />
                    <span>Proceed to Checkout</span>
                </button>
            </div>
        </div>
    );
};

export default Cart;
