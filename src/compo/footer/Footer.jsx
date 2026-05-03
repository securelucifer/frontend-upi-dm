import { Facebook, Instagram, Mail, X, YouTube, LocationOn } from '@mui/icons-material';
import { useState } from 'react';

const Footer = () => {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <>
            {/* Main Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 sm:py-8 lg:py-12">
                <div className="container mx-auto px-4 sm:px-6">

                    {/* Mobile App Download Section - Always Visible */}
                    <div className="mb-8 lg:mb-12">
                        <div className="text-center lg:text-left">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                                Download DMart Ready Mobile App
                            </h3>

                            {/* App Store Badges - Mobile Optimized */}
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-6">
                                <div className="inline-block hover:opacity-80 transition-opacity"
                                    aria-label="Download on Google Play"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                        alt="Get it on Google Play"
                                        className="h-10 sm:h-12 w-auto"
                                    />
                                </div>
                                <div
                                    className="inline-block hover:opacity-80 transition-opacity"
                                    aria-label="Download on App Store"
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                                        alt="Download on the App Store"
                                        className="h-10 sm:h-12 w-auto"
                                    />
                                </div>
                            </div>

                            {/* Payment Methods - Mobile Optimized */}
                            <div className="flex justify-center lg:justify-start">
                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png"
                                        alt="Visa"
                                        className="h-6 sm:h-8 w-auto filter grayscale hover:grayscale-0 transition-all"
                                    />
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                                        alt="Mastercard"
                                        className="h-6 sm:h-8 w-auto filter grayscale hover:grayscale-0 transition-all"
                                    />
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg"
                                        alt="American Express"
                                        className="h-6 sm:h-8 w-auto filter grayscale hover:grayscale-0 transition-all"
                                    />
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg"
                                        alt="PayPal"
                                        className="h-6 sm:h-8 w-auto filter grayscale hover:grayscale-0 transition-all"
                                    />
                                    <div className="h-6 sm:h-8 px-2 sm:px-3 bg-green-600 rounded flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                        UPI
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Accordion & Desktop Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">

                        {/* Help & Policies */}
                        <div className="md:block">
                            {/* Mobile Accordion Header */}
                            <button
                                onClick={() => toggleSection('help')}
                                className="md:hidden w-full flex items-center justify-between py-3 text-left border-b border-gray-200"
                            >
                                <h3 className="text-base font-semibold text-gray-800">Help & Policies</h3>
                                <span className={`transform transition-transform ${expandedSection === 'help' ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {/* Desktop Header */}
                            <h3 className="hidden md:block text-lg font-semibold text-gray-800 mb-4">
                                Help & Policies
                            </h3>

                            {/* Links */}
                            <div className={`md:block ${expandedSection === 'help' ? 'block' : 'hidden'} py-3 md:py-0`}>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        FAQs
                                    </div>
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        Privacy Policy
                                    </div>
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        Pricing & Delivery
                                    </div>
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        Terms & Conditions
                                    </div>
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        Disclaimer
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Company Info */}
                        <div className="md:block">
                            {/* Mobile Accordion Header */}
                            <button
                                onClick={() => toggleSection('company')}
                                className="md:hidden w-full flex items-center justify-between py-3 text-left border-b border-gray-200"
                            >
                                <h3 className="text-base font-semibold text-gray-800">Company</h3>
                                <span className={`transform transition-transform ${expandedSection === 'company' ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {/* Desktop Header */}
                            <h3 className="hidden md:block text-lg font-semibold text-gray-800 mb-4">
                                Company
                            </h3>

                            {/* Links */}
                            <div className={`md:block ${expandedSection === 'company' ? 'block' : 'hidden'} py-3 md:py-0`}>
                                <div className="space-y-2 sm:space-y-3">
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        Contact Us
                                    </div>
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        About Us
                                    </div>
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        Join Us / Careers
                                    </div>
                                    <div className="block text-sm sm:text-base text-gray-600 hover:text-green-600 font-medium transition-colors py-1"
                                    >
                                        Pickup Points
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Social */}
                        <div className="md:block">
                            {/* Mobile Accordion Header */}
                            <button
                                onClick={() => toggleSection('contact')}
                                className="md:hidden w-full flex items-center justify-between py-3 text-left border-b border-gray-200"
                            >
                                <h3 className="text-base font-semibold text-gray-800">Contact & Follow</h3>
                                <span className={`transform transition-transform ${expandedSection === 'contact' ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </button>

                            {/* Desktop Header */}
                            <h3 className="hidden md:block text-lg font-semibold text-gray-800 mb-4">
                                Contact & Follow
                            </h3>

                            {/* Contact Info */}
                            <div className={`md:block ${expandedSection === 'contact' ? 'block' : 'hidden'} py-3 md:py-0`}>
                                <div className="space-y-3 sm:space-y-4">
                                    {/* Email */}
                                    <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-600">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                        <a
                                            href="mailto:info@dmart.com"
                                            className="hover:text-green-600 transition-colors"
                                        >
                                            info@dmart.com
                                        </a>
                                    </div>

                                    {/* Address */}
                                    <div className="flex items-start space-x-2 text-sm sm:text-base text-gray-600">
                                        <LocationOn className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5" />
                                        <span className="leading-relaxed">
                                            DMart House, Mumbai, India
                                        </span>
                                    </div>

                                    {/* Social Media */}
                                    <div className="pt-2">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Follow Us</h4>
                                        <div className="flex space-x-4">
                                            <a
                                                href="#"
                                                className="text-gray-600 hover:text-blue-600 transition-colors p-1"
                                                aria-label="Follow us on Facebook"
                                            >
                                                <Facebook className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-600 hover:text-black transition-colors p-1"
                                                aria-label="Follow us on X (Twitter)"
                                            >
                                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-600 hover:text-pink-600 transition-colors p-1"
                                                aria-label="Follow us on Instagram"
                                            >
                                                <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </a>
                                            <a
                                                href="#"
                                                className="text-gray-600 hover:text-red-600 transition-colors p-1"
                                                aria-label="Subscribe to our YouTube channel"
                                            >
                                                <YouTube className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Copyright Footer */}
            <div className="bg-gray-100 border-t border-gray-200 py-3 sm:py-4">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                        <p className="text-center sm:text-left text-xs sm:text-sm text-gray-600 leading-relaxed">
                            Copyright &copy; 2025 Avenue E-Commerce Limited (AEL). All Rights Reserved.
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Made in India 🇮🇳</span>
                            <span>•</span>
                            <span>v2.1.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Footer;
