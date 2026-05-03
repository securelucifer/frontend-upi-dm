import { motion } from "framer-motion";
import { ShoppingCart, LocalShipping, Security } from "@mui/icons-material";

const AdBanner = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-3 sm:mx-4 lg:mx-6"
    >
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-2xl overflow-hidden relative">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Why Choose DMart?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-2xl mx-auto">
              Experience the best shopping with unbeatable prices and quality products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: ShoppingCart,
                title: "Best Prices",
                description: "Always the lowest prices guaranteed"
              },
              {
                icon: LocalShipping,
                title: "Fast Delivery",
                description: "Free delivery on orders above ₹499"
              },
              {
                icon: Security,
                title: "100% Secure",
                description: "Safe & secure payment methods"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-4 sm:p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
              >
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-blue-100 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdBanner;
