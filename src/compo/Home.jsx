import { Suspense, lazy } from 'react';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

// Lazy load home components
const TopBanner = lazy(() => import("./home/TopBanner"));
const ThisWeeksSavers = lazy(() => import("./home/ThisWeeksSavers"));
const TopDeals = lazy(() => import("./home/TopDeals"));
const PromoBanner = lazy(() => import("./home/PromoBanner"));
const AdBanner = lazy(() => import("./home/AdBanner"));
const SeasonalOffer = lazy(() => import("./home/SeasonOffer"));

// Component skeleton loader
const ComponentSkeleton = () => (
    <div className="animate-pulse bg-gray-200 rounded-lg h-48 mb-8"></div>
);

const Home = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Load additional data after component mounts
        // This prevents blocking the initial render
        const loadAdditionalData = async () => {
            try {
                // Load non-critical data here
                // await dispatch(fetchFeaturedProducts());
                // await dispatch(fetchTopDeals());
            } catch (error) {
                console.error('Failed to load additional data:', error);
            }
        };

        // Delay non-critical data loading
        const timer = setTimeout(loadAdditionalData, 1000);
        return () => clearTimeout(timer);
    }, [dispatch]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-0 py-0 space-y-12">
                <Suspense fallback={<ComponentSkeleton />}>
                    <TopBanner />
                </Suspense>

                <Suspense fallback={<ComponentSkeleton />}>
                    <ThisWeeksSavers />
                </Suspense>

                <Suspense fallback={<ComponentSkeleton />}>
                    <TopDeals />
                </Suspense>

                <Suspense fallback={<ComponentSkeleton />}>
                    <PromoBanner />
                </Suspense>

                <Suspense fallback={<ComponentSkeleton />}>
                    <AdBanner />
                </Suspense>

                <Suspense fallback={<ComponentSkeleton />}>
                    <SeasonalOffer />
                </Suspense>
            </div>
        </div>
    );
};

export default Home;
