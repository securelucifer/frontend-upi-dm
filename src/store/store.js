import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import apkReducer from './slices/apkSlice';
import bannerReducer from './slices/bannerSlice';

export const store = configureStore({
    reducer: {
        products: productReducer,
        cart: cartReducer,
        orders: orderReducer,
        apk: apkReducer,
        banners: bannerReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

export default store;
