import { useState, useEffect } from 'react';

const AppLoader = ({ progress = 0, message = "Loading..." }) => {
    const [currentMessage, setCurrentMessage] = useState('');
    const [showLogo, setShowLogo] = useState(false);

    const loadingMessages = [
        "Initializing your shopping experience...",
        "Loading fresh products...",
        "Preparing best deals...",
        "Setting up your cart...",
        "Almost ready..."
    ];

    useEffect(() => {
        const logoTimer = setTimeout(() => setShowLogo(true), 200);
        let messageIndex = Math.floor((progress / 100) * (loadingMessages.length - 1));
        setCurrentMessage(loadingMessages[messageIndex] || loadingMessages[0]);
        return () => clearTimeout(logoTimer);
    }, [progress]);

    return (
        <div className="fixed inset-0 z-[10000] font-inter overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-600 to-green-800 animate-gradient-x">
                {/* Floating Circles */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute w-20 h-20 md:w-25 md:h-25 bg-white/10 rounded-full animate-float-1 top-[20%] left-[10%]"></div>
                    <div className="absolute w-12 h-12 md:w-15 md:h-15 bg-white/10 rounded-full animate-float-2 top-[60%] right-[20%]" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-full animate-float-3 bottom-[30%] left-[20%]" style={{ animationDelay: '4s' }}></div>
                    <div className="absolute w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-full animate-float-4 top-[40%] right-[10%]" style={{ animationDelay: '1s' }}></div>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-center h-full px-4 sm:px-8 py-8 text-white text-center">
                {/* Logo Section */}
                <div className={`mb-8 sm:mb-12 transition-all duration-700 ease-out ${showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex flex-col items-center gap-3 sm:gap-4">

                        <div className="text-center">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-2 rounded-lg shadow-md">
                                <span className="font-bold text-lg sm:text-xl">D</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-lg sm:text-xl text-gray-100 tracking-tight leading-none">DMart</h1>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Loading Animation */}
                <div className="relative mb-6 sm:mb-8">
                    {/* Circular Progress */}
                    <div className="relative w-24 h-24 sm:w-30 sm:h-30 mx-auto mb-6 sm:mb-8">
                        <svg className="w-full h-full -rotate-90 drop-shadow-lg" viewBox="0 0 120 120">
                            <circle
                                className="stroke-gray-300/30"
                                strokeWidth="6"
                                fill="transparent"
                                r="52"
                                cx="60"
                                cy="60"
                            />
                            <circle
                                className="stroke-green-400 transition-all duration-300 ease-out"
                                strokeWidth="6"
                                fill="transparent"
                                r="52"
                                cx="60"
                                cy="60"
                                strokeLinecap="round"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 52}`,
                                    strokeDashoffset: `${2 * Math.PI * 52 * (1 - progress / 100)}`,
                                }}
                            />
                        </svg>

                        {/* Rotating Elements */}
                        <div className="absolute inset-0 animate-spin-slow">
                            <div className="absolute w-2 h-2 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 top-2 left-1/2 -translate-x-1/2"></div>
                            <div className="absolute w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50 top-1/2 right-2 -translate-y-1/2" style={{ animationDelay: '0.7s' }}></div>
                            <div className="absolute w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50 bottom-2 left-1/2 -translate-x-1/2" style={{ animationDelay: '1.4s' }}></div>
                        </div>

                        {/* Progress Percentage */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>

                    {/* Loading Bars */}
                    <div className="flex justify-center items-end gap-1 h-8 sm:h-10 mb-6 sm:mb-8">
                        <div className="w-1.5 bg-gradient-to-t from-green-600 to-green-300 rounded-t animate-pulse-bar" style={{ height: '40%', animationDelay: '0s' }}></div>
                        <div className="w-1.5 bg-gradient-to-t from-green-600 to-green-300 rounded-t animate-pulse-bar" style={{ height: '60%', animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 bg-gradient-to-t from-green-600 to-green-300 rounded-t animate-pulse-bar" style={{ height: '80%', animationDelay: '0.4s' }}></div>
                        <div className="w-1.5 bg-gradient-to-t from-green-600 to-green-300 rounded-t animate-pulse-bar" style={{ height: '50%', animationDelay: '0.6s' }}></div>
                        <div className="w-1.5 bg-gradient-to-t from-green-600 to-green-300 rounded-t animate-pulse-bar" style={{ height: '30%', animationDelay: '0.8s' }}></div>
                    </div>
                </div>

                {/* Progress Information */}
                <div className="w-full max-w-xs sm:max-w-md">
                    <div className="mb-4 sm:mb-6">
                        <p className="text-sm sm:text-base font-medium opacity-90 animate-glow">
                            {currentMessage}
                        </p>
                    </div>

                    {/* Linear Progress Bar */}
                    <div className="mb-6 sm:mb-8">
                        <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-green-500 via-green-400 to-green-300 rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="flex justify-center gap-4 sm:gap-8 mt-4">
                        <div className="flex flex-col items-center gap-1 sm:gap-2 opacity-80">
                            <div className="text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '0s' }}>🛒</div>
                            <span className="text-xs sm:text-sm font-medium">Fresh Products</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 sm:gap-2 opacity-80">
                            <div className="text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>💰</div>
                            <span className="text-xs sm:text-sm font-medium">Best Prices</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 sm:gap-2 opacity-80">
                            <div className="text-xl sm:text-2xl animate-bounce" style={{ animationDelay: '1s' }}>🚚</div>
                            <span className="text-xs sm:text-sm font-medium">Fast Delivery</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/60 rounded-full animate-float-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default AppLoader;
