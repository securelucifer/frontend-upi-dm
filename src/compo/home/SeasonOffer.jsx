import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { AccessTime, LocalOffer } from "@mui/icons-material";

const SeasonalOffer = () => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="mx-3 sm:mx-4 lg:mx-6"
        >
            <div className="bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <div className="relative p-6 sm:p-8 lg:p-12">
                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 translate-y-16"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                                <LocalOffer className="w-5 h-5 text-yellow-300" />
                                <span className="text-yellow-300 font-bold text-sm">SEASONAL SPECIAL</span>
                            </div>

                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                                Festival Offer Sale
                            </h2>
                            <p className="text-green-100 text-sm sm:text-base mb-6 max-w-md mx-auto lg:mx-0">
                                Beat the heat with cool prices! Fresh groceries, household essentials,
                                and more at unbeatable prices.
                            </p>


                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <motion.div
                                animate={{
                                    y: [0, -10, 0],
                                    rotate: [0, 2, -2, 0]
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="relative"
                            >
                                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                                    <div className="text-center">
                                        <div className="text-yellow-300 text-xl sm:text-2xl font-bold mb-2">
                                            UP TO
                                        </div>
                                        <div className="text-white text-4xl sm:text-5xl font-extrabold mb-2">
                                            90%
                                        </div>
                                        <div className="text-green-100 text-lg font-semibold">
                                            OFF
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SeasonalOffer;
