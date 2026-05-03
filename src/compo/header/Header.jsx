import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    Search,
    Menu,
    Close,
    LocalOffer,
    Headset,
    Phone,
    Facebook,
    Twitter,
    Instagram,
    LocalOfferOutlined
} from '@mui/icons-material';
import { toggleCartSidebar } from '../../store/slices/cartSlice';

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Redux state
    const { totalItems, totalAmount, message } = useSelector(state => state.cart);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [showCartMessage, setShowCartMessage] = useState(false);

    // Refs
    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    // Handle search
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setIsMobileMenuOpen(false);
        }
    };

    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Show cart message when items are added
    useEffect(() => {
        if (message) {
            setShowCartMessage(true);
            const timer = setTimeout(() => {
                setShowCartMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            {/* Top Banner - Reduced Height */}
            <div className="bg-green-600 text-white text-center py-1">
                <div className="container mx-auto px-4 flex items-center justify-center text-xs">
                    <LocalOfferOutlined className="w-1 h-2" style={{ fontSize: "12px" }} />
                    <span className="ml-2">Mega Festive Sale – Up to 70% OFF!</span>
                    <span className="hidden md:inline mx-2">|</span>
                    <span className="hidden md:inline">Hurry! Limited Time Offers</span>
                </div>
            </div>

            {/* Main Header - Reduced Height */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="container mx-auto px-4">
                    {/* Top Header - Compact Version */}
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo - More Compact */}
                        <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-2 rounded-lg shadow-md">
                                <span className="font-bold text-lg sm:text-xl">D</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg sm:text-xl text-gray-800 tracking-tight leading-none">DMart</h1>
                                <p className="text-xs text-green-600 font-medium leading-none">Ready for You</p>
                            </div>
                        </Link>

                        {/* Search Bar - Desktop - Reduced Height */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-6">
                            <form onSubmit={handleSearch} className="relative w-full">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for products, brands and more..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm text-gray-700 placeholder-gray-400"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <Close className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            {/* Cart Button - Compact */}
                            <div className="relative">
                                <Link to={"/cart"}>
                                    <motion.button
                                        onClick={() => dispatch(toggleCartSidebar())}
                                        className="relative flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-lg transition-all duration-200 hover:from-green-700 hover:to-green-800"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        <div className="hidden sm:flex flex-col items-start">
                                            <span className="text-xs font-medium opacity-90 leading-none">Cart</span>
                                            <span className="text-xs font-bold leading-none">
                                                {totalAmount > 0 ? `₹${totalAmount.toLocaleString()}` : '₹0'}
                                            </span>
                                        </div>

                                        {/* Live Cart Count Badge */}
                                        <AnimatePresence>
                                            {totalItems > 0 && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-sm"
                                                >
                                                    {totalItems > 99 ? '99+' : totalItems}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </motion.button>
                                </Link>

                                {/* Cart Success Message */}
                                <AnimatePresence>
                                    {showCartMessage && message && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            className="absolute top-full right-0 mt-2 bg-green-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50"
                                        >
                                            {message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors rounded-lg hover:bg-gray-100"
                            >
                                {isMobileMenuOpen ? <Close className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu - Compact */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            ref={mobileMenuRef}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
                        >
                            <div className="px-4 py-3 space-y-3">
                                {/* Mobile Search - Compact */}
                                <form onSubmit={handleSearch} className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-green-500 focus:border-transparent text-sm"
                                    />
                                </form>

                                {/* Mobile User Menu - Compact */}
                                <div className="space-y-1">
                                    <Link
                                        to="/offers"
                                        className="flex items-center space-x-3 py-2 text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        <LocalOffer className="w-4 h-4" />
                                        <span className="text-sm">Offers & Deals</span>
                                    </Link>

                                    <Link
                                        to="/support"
                                        className="flex items-center space-x-3 py-2 text-gray-600 hover:text-green-600 transition-colors"
                                    >
                                        <Headset className="w-4 h-4" />
                                        <span className="text-sm">Customer Support</span>
                                    </Link>
                                </div>

                                {/* Mobile Social Links - Compact */}
                                <div className="border-t border-gray-200 pt-3">
                                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">Follow Us</h3>
                                    <div className="flex space-x-4">
                                        <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                                            <Facebook className="w-5 h-5" />
                                        </a>
                                        <a href="#" className="text-gray-600 hover:text-blue-400 transition-colors">
                                            <Twitter className="w-5 h-5" />
                                        </a>
                                        <a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">
                                            <Instagram className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header >
        </>
    );
};

export default Header;
