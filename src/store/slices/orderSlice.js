import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
    createOrder as apiCreateOrder,
    getAllOrders as apiGetAllOrders,
    getOrderById as apiGetOrderById,
    getUserOrders as apiGetUserOrders,
    updateOrderStatus as apiUpdateOrderStatus
} from '../../services/productAPI';

// Async thunk for creating order
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const result = await apiCreateOrder(orderData);
            return result.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error || 
                error.response?.data?.message || 
                error.message || 
                'Failed to create order'
            );
        }
    }
);

// Async thunk for getting user orders
export const getUserOrders = createAsyncThunk(
    'order/getUserOrders',
    async ({ userId, page = 1, limit = 10, status }, { rejectWithValue }) => {
        try {
            const result = await apiGetUserOrders(userId, { page, limit, status });
            return result;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error || 
                error.message || 
                'Failed to fetch orders'
            );
        }
    }
);

// Async thunk for getting all orders (admin)
export const getAllOrders = createAsyncThunk(
    'order/getAllOrders',
    async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
        try {
            const result = await apiGetAllOrders({ page, limit, status });
            return result;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error || 
                error.message || 
                'Failed to fetch orders'
            );
        }
    }
);

// Async thunk for getting single order
export const getOrderById = createAsyncThunk(
    'order/getOrderById',
    async (orderId, { rejectWithValue }) => {
        try {
            const result = await apiGetOrderById(orderId);
            return result.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error || 
                error.message || 
                'Failed to fetch order'
            );
        }
    }
);

// Async thunk for updating order status
export const updateOrderStatus = createAsyncThunk(
    'order/updateOrderStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const result = await apiUpdateOrderStatus(orderId, status);
            return result.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.error || 
                error.message || 
                'Failed to update order status'
            );
        }
    }
);

const initialState = {
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    success: false,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOrders: 0,
        hasNextPage: false,
        hasPrevPage: false
    }
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        clearOrderError: (state) => {
            state.error = null;
        },
        clearOrderSuccess: (state) => {
            state.success = false;
        },
        resetCurrentOrder: (state) => {
            state.currentOrder = null;
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentOrder = action.payload;
                state.orders.unshift(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })
            
            // Get User Orders
            .addCase(getUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Get All Orders
            .addCase(getAllOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload.data;
                state.pagination = action.payload.pagination;
            })
            .addCase(getAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Get Order By ID
            .addCase(getOrderById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentOrder = action.payload;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Update Order Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                // Update order in orders array
                const orderIndex = state.orders.findIndex(
                    order => order._id === action.payload.orderId
                );
                if (orderIndex !== -1) {
                    state.orders[orderIndex].status = action.payload.status;
                }
                // Update current order if it matches
                if (state.currentOrder && state.currentOrder._id === action.payload.orderId) {
                    state.currentOrder.status = action.payload.status;
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearOrderError, clearOrderSuccess, resetCurrentOrder, setCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
