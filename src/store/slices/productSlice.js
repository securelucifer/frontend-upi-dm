import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productAPI from '../../services/productAPI';

// Async thunks for API calls
export const fetchProducts = createAsyncThunk(
    'products/fetchProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await productAPI.getProducts(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
        }
    }
);

export const fetchFeaturedProducts = createAsyncThunk(
    'products/fetchFeaturedProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await productAPI.getFeaturedProducts(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products');
        }
    }
);

export const fetchTopRatedProducts = createAsyncThunk(
    'products/fetchTopRatedProducts',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await productAPI.getTopRatedProducts(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch top rated products');
        }
    }
);

// NEW: Top Deals Async Thunk
export const fetchTopDeals = createAsyncThunk(
    'products/fetchTopDeals',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await productAPI.getTopDeals(params);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch top deals');
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchProductById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await productAPI.getProductById(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch product');
        }
    }
);

export const fetchSimilarProducts = createAsyncThunk(
    'products/fetchSimilarProducts',
    async (id, { rejectWithValue }) => {
        try {
            const response = await productAPI.getSimilarProducts(id);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch similar products');
        }
    }
);

const productSlice = createSlice({
    name: 'products',
    initialState: {
        // All products
        products: [],
        productsLoading: false,
        productsError: null,
        pagination: null,

        // Featured products
        featuredProducts: [],
        featuredLoading: false,
        featuredError: null,

        // Top rated products
        topRatedProducts: [],
        topRatedLoading: false,
        topRatedError: null,

        // Top deals products (NEW)
        topDeals: [],
        topDealsLoading: false,
        topDealsError: null,

        // Current product (for product details)
        currentProduct: null,
        currentProductLoading: false,
        currentProductError: null,

        // Similar products
        similarProducts: [],
        similarLoading: false,
        similarError: null,

        // Filters
        filters: {
            category: '',
            brand: '',
            search: '',
            minRating: '',
            featured: false,
            sortBy: '',
            sortOrder: 'asc'
        }
    },
    reducers: {
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                category: '',
                brand: '',
                search: '',
                minRating: '',
                featured: false,
                sortBy: '',
                sortOrder: 'asc'
            };
        },
        clearCurrentProduct: (state) => {
            state.currentProduct = null;
            state.currentProductError = null;
            state.similarProducts = [];
        },
        clearErrors: (state) => {
            state.productsError = null;
            state.featuredError = null;
            state.topRatedError = null;
            state.topDealsError = null;  // Clear top deals error
            state.currentProductError = null;
            state.similarError = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Products
            .addCase(fetchProducts.pending, (state) => {
                state.productsLoading = true;
                state.productsError = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.productsLoading = false;
                state.products = action.payload.data || [];
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.productsLoading = false;
                state.productsError = action.payload;
                state.products = [];
            })

            // Fetch Featured Products
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.featuredLoading = true;
                state.featuredError = null;
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.featuredLoading = false;
                state.featuredProducts = action.payload.data || [];
            })
            .addCase(fetchFeaturedProducts.rejected, (state, action) => {
                state.featuredLoading = false;
                state.featuredError = action.payload;
                state.featuredProducts = [];
            })

            // Fetch Top Rated Products
            .addCase(fetchTopRatedProducts.pending, (state) => {
                state.topRatedLoading = true;
                state.topRatedError = null;
            })
            .addCase(fetchTopRatedProducts.fulfilled, (state, action) => {
                state.topRatedLoading = false;
                state.topRatedProducts = action.payload.data || [];
            })
            .addCase(fetchTopRatedProducts.rejected, (state, action) => {
                state.topRatedLoading = false;
                state.topRatedError = action.payload;
                state.topRatedProducts = [];
            })

            // Fetch Top Deals Products (NEW)
            .addCase(fetchTopDeals.pending, (state) => {
                state.topDealsLoading = true;
                state.topDealsError = null;
            })
            .addCase(fetchTopDeals.fulfilled, (state, action) => {
                state.topDealsLoading = false;
                state.topDeals = action.payload.data || [];
            })
            .addCase(fetchTopDeals.rejected, (state, action) => {
                state.topDealsLoading = false;
                state.topDealsError = action.payload;
                state.topDeals = [];
            })

            // Fetch Product by ID
            .addCase(fetchProductById.pending, (state) => {
                state.currentProductLoading = true;
                state.currentProductError = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.currentProductLoading = false;
                state.currentProduct = action.payload.data || null;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.currentProductLoading = false;
                state.currentProductError = action.payload;
                state.currentProduct = null;
            })

            // Fetch Similar Products
            .addCase(fetchSimilarProducts.pending, (state) => {
                state.similarLoading = true;
                state.similarError = null;
            })
            .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
                state.similarLoading = false;
                state.similarProducts = action.payload.data || [];
            })
            .addCase(fetchSimilarProducts.rejected, (state, action) => {
                state.similarLoading = false;
                state.similarError = action.payload;
                state.similarProducts = [];
            });
    }
});

export const { setFilters, clearFilters, clearCurrentProduct, clearErrors } = productSlice.actions;
export default productSlice.reducer;
