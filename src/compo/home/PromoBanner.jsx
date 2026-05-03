import { motion } from "framer-motion";
import {  FlashOn, Timer } from "@mui/icons-material";

const PromoBanner = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-3 sm:mx-4 lg:mx-6"
        >
            <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative p-6 sm:p-8 lg:p-12">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
                        <div className="text-center lg:text-left mb-6 lg:mb-0">
                            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                                <FlashOn className="w-6 h-6 text-yellow-300" />
                                <span className="text-yellow-300 font-bold text-sm sm:text-base">FLASH SALE</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
                                Up to 70% OFF
                            </h2>
                            <p className="text-white/90 text-sm sm:text-base mb-4">
                                On selected groceries & household items
                            </p>

                            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                                <Timer className="w-4 h-4 text-yellow-300" />
                                <span className="text-yellow-300 text-sm font-medium">Limited Time Offer</span>
                            </div>

                            
                        </div>

                        <div className="flex-shrink-0">
                            <motion.div
                                animate={{
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="bg-yellow-300 text-orange-600 rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center font-bold text-xl sm:text-2xl shadow-2xl"
                            >
                                80%<br />OFF
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PromoBanner;
