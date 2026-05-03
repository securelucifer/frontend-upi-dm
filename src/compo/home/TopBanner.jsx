import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchActiveBanners,
    setCurrentSlide,
    clearErrors,
} from "../../store/slices/bannerSlice";
import "./Banner.css";

const TopBanner = () => {
    const dispatch = useDispatch();

    // Get state from Redux store
    const {
        activeBanners,
        // activeBannersLoading,
        activeBannersError,
        currentSlide,
        autoPlay = true // Default to true if not set
    } = useSelector((state) => state.banners);



    // Fetch active banners on component mount
    useEffect(() => {
        dispatch(fetchActiveBanners());
        return () => {
            dispatch(clearErrors());
        };
    }, [dispatch]);

    // Transform banners for display - Create slides for each image
    const slides = [];

    if (activeBanners.length > 0) {
        // Process each banner
        activeBanners.forEach((banner) => {
            if (banner.images && banner.images.length > 0) {
                // Add each image as a separate slide
                banner.images.forEach((image, imageIndex) => {
                    slides.push({
                        id: `${banner._id}-${image._id || imageIndex}`,
                        bannerId: banner._id,
                        imageUrl: image.imageUrl,
                        isPrimary: image.isPrimary,
                        publicId: image.publicId
                    });
                });
            }
        });
    }
    const handleSlideChange = (swiper) => {
        dispatch(setCurrentSlide(swiper.realIndex));
    };

    // Loading state
    // if (activeBannersLoading) {
    //     return (
    //         <div className="relative w-full h-[250px] xs:h-[280px] sm:h-[320px] md:h-[380px] lg:h-[450px] xl:h-[500px] bg-gradient-to-r from-gray-100 to-gray-200">
    //             <div className="absolute inset-0 flex items-center justify-center">
    //                 <div className="flex flex-col items-center space-y-4">
    //                     <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    //                     <p className="text-gray-600 font-medium text-sm sm:text-base">Loading banners...</p>
    //                 </div>
    //             </div>
    //             <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
    //         </div>
    //     );
    // }

    // Don't render if no slides
    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-[140px] xs:h-[175px] sm:h-[230px] md:h-[280px] lg:h-[370px] xl:h-[465px] 2xl:h-[560px] overflow-hidden bg-gray-900">
            <Swiper
                modules={[Autoplay, EffectFade]}
                slidesPerView={1}
                loop={slides.length > 1}
                effect="flip"
                fadeEffect={{
                    crossFade: true
                }}
                autoplay={{
                    delay: 1000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                speed={300}
                onSlideChange={handleSlideChange}
                className="w-full h-full banner-swiper"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={slide.id}>
                        <div className="relative w-full h-full">
                            {/* Main Banner Image */}
                            <img
                                src={slide.imageUrl}
                                alt={slide.bannerTitle || `Banner ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading={index === 0 ? "eager" : "lazy"}
                                onError={(e) => {
                                    // Fallback image on error
                                    e.target.src = "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=700&fit=crop&crop=center";
                                }}
                            />
                            {/* Subtle overlay */}
                            <div className="absolute inset-0 bg-black/10"></div>


                            {/* Banner Title/Description Overlay (if available) */}
                            {(slide.bannerTitle || slide.bannerDescription) && (
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                                    <div className="p-4 sm:p-6">
                                        {slide.bannerTitle && (
                                            <h3 className="text-white text-lg sm:text-xl font-bold mb-1">
                                                {slide.bannerTitle}
                                            </h3>
                                        )}
                                        {slide.bannerDescription && (
                                            <p className="text-white/90 text-sm sm:text-base">
                                                {slide.bannerDescription}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>



            {/* Progress Bar */}
            {/* <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
                <div
                    className="h-full bg-blue-500 transition-all duration-[3000ms] ease-linear"
                    style={{
                        width: `${((currentSlide + 1) / slides.length) * 100}%`
                    }}
                />
            </div> */}

            {/* Error State Indicator */}
            {activeBannersError && (
                <div className="absolute top-4 left-4 bg-red-500/80 backdrop-blur-sm text-white px-3 py-1 rounded text-xs z-30">
                    API Error - Using fallback
                </div>
            )}


        </div>
    );
};

export default TopBanner;
