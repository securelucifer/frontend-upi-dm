const QuickLoader = ({ message = "Loading..." }) => {
    return (
        <div className="flex justify-center items-center min-h-[200px] p-8">
            <div className="text-center">
                {/* Spinner Container */}
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                    <div className="absolute inset-0 border-3 border-transparent border-t-green-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-1 border-3 border-transparent border-t-green-400 rounded-full animate-spin" style={{ animationDelay: '-0.4s' }}></div>
                    <div className="absolute inset-2 border-3 border-transparent border-t-green-300 rounded-full animate-spin" style={{ animationDelay: '-0.8s' }}></div>
                </div>
                
                {/* Loading Message */}
                <p className="text-sm sm:text-base text-gray-600 font-medium animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default QuickLoader;
