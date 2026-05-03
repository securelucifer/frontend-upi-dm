import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as bannerAPI from '../../services/bannerAPI';

// Async thunks for API calls
export const fetchBanners = createAsyncThunk(
    'banners/fetchBanners',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bannerAPI.getBanners(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch banners');
        }
    }
);

export const fetchActiveBanners = createAsyncThunk(
    'banners/fetchActiveBanners',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bannerAPI.getActiveBanners(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch active banners');
        }
    }
);

export const fetchBannerById = createAsyncThunk(
    'banners/fetchBannerById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await bannerAPI.getBannerById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch banner');
        }
    }
);

export const fetchBannersByOrder = createAsyncThunk(
    'banners/fetchBannersByOrder',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bannerAPI.getBannersByOrder(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch ordered banners');
        }
    }
);

export const fetchFeaturedBanners = createAsyncThunk(
    'banners/fetchFeaturedBanners',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await bannerAPI.getFeaturedBanners(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured banners');
        }
    }
);

const bannerSlice = createSlice({
    name: 'banners',
    initialState: {
        // All banners
        banners: [],
        bannersLoading: false,
        bannersError: null,

        // Active banners (for TopBanner component)
        activeBanners: [],
        activeBannersLoading: false,
        activeBannersError: null,

        // Featured banners
        featuredBanners: [],
        featuredBannersLoading: false,
        featuredBannersError: null,

        // Ordered banners
        orderedBanners: [],
        orderedBannersLoading: false,
        orderedBannersError: null,

        // Current banner (for details)
        currentBanner: null,
        currentBannerLoading: false,
        currentBannerError: null,

        // Filters
        filters: {
            activeOnly: true,
            featured: false,
            sortBy: 'order',
            sortOrder: 'asc'
        },

        // UI State
        currentSlide: 0,
        autoPlay: true
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                activeOnly: true,
                featured: false,
                sortBy: 'order',
                sortOrder: 'asc'
            };
        },
        clearCurrentBanner: (state) => {
            state.currentBanner = null;
            state.currentBannerError = null;
        },
        clearErrors: (state) => {
            state.bannersError = null;
            state.activeBannersError = null;
            state.featuredBannersError = null;
            state.orderedBannersError = null;
            state.currentBannerError = null;
        },
        setCurrentSlide: (state, action) => {
            state.currentSlide = action.payload;
        },
        setAutoPlay: (state, action) => {
            state.autoPlay = action.payload;
        },
        nextSlide: (state) => {
            if (state.activeBanners.length > 0) {
                state.currentSlide = (state.currentSlide + 1) % state.activeBanners.length;
            }
        },
        prevSlide: (state) => {
            if (state.activeBanners.length > 0) {
                state.currentSlide = state.currentSlide === 0
                    ? state.activeBanners.length - 1
                    : state.currentSlide - 1;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Banners
            .addCase(fetchBanners.pending, (state) => {
                state.bannersLoading = true;
                state.bannersError = null;
            })
            .addCase(fetchBanners.fulfilled, (state, action) => {
                state.bannersLoading = false;
                state.banners = action.payload.data || [];
            })
            .addCase(fetchBanners.rejected, (state, action) => {
                state.bannersLoading = false;
                state.bannersError = action.payload;
                state.banners = [];
            })

            // Fetch Active Banners
            .addCase(fetchActiveBanners.pending, (state) => {
                state.activeBannersLoading = true;
                state.activeBannersError = null;
            })
            .addCase(fetchActiveBanners.fulfilled, (state, action) => {
                state.activeBannersLoading = false;
                state.activeBanners = action.payload.data || [];
                // Reset current slide if banners changed
                if (state.currentSlide >= (action.payload.data || []).length) {
                    state.currentSlide = 0;
                }
            })
            .addCase(fetchActiveBanners.rejected, (state, action) => {
                state.activeBannersLoading = false;
                state.activeBannersError = action.payload;
                state.activeBanners = [];
            })

            // Fetch Featured Banners
            .addCase(fetchFeaturedBanners.pending, (state) => {
                state.featuredBannersLoading = true;
                state.featuredBannersError = null;
            })
            .addCase(fetchFeaturedBanners.fulfilled, (state, action) => {
                state.featuredBannersLoading = false;
                state.featuredBanners = action.payload.data || [];
            })
            .addCase(fetchFeaturedBanners.rejected, (state, action) => {
                state.featuredBannersLoading = false;
                state.featuredBannersError = action.payload;
                state.featuredBanners = [];
            })

            // Fetch Ordered Banners
            .addCase(fetchBannersByOrder.pending, (state) => {
                state.orderedBannersLoading = true;
                state.orderedBannersError = null;
            })
            .addCase(fetchBannersByOrder.fulfilled, (state, action) => {
                state.orderedBannersLoading = false;
                state.orderedBanners = action.payload.data || [];
            })
            .addCase(fetchBannersByOrder.rejected, (state, action) => {
                state.orderedBannersLoading = false;
                state.orderedBannersError = action.payload;
                state.orderedBanners = [];
            })

            // Fetch Banner by ID
            .addCase(fetchBannerById.pending, (state) => {
                state.currentBannerLoading = true;
                state.currentBannerError = null;
            })
            .addCase(fetchBannerById.fulfilled, (state, action) => {
                state.currentBannerLoading = false;
                state.currentBanner = action.payload.data || null;
            })
            .addCase(fetchBannerById.rejected, (state, action) => {
                state.currentBannerLoading = false;
                state.currentBannerError = action.payload;
                state.currentBanner = null;
            });
    }
});

export const {
    setFilters,
    clearFilters,
    clearCurrentBanner,
    clearErrors,
    setCurrentSlide,
    setAutoPlay,
    nextSlide,
    prevSlide
} = bannerSlice.actions;

export default bannerSlice.reducer;
