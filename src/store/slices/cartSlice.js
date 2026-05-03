import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const saveCartToLocalStorage = (cartItems) => {
  try {
    localStorage.setItem('dmart_cart', JSON.stringify(cartItems));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const loadCartFromLocalStorage = () => {
  try {
    const cartData = localStorage.getItem('dmart_cart');
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
};

const calculateCartTotals = (items) => {
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalAmount = items.reduce((sum, item) => sum + ((item.dmartPrice || 0) * (item.quantity || 0)), 0);
  const totalMRP = items.reduce((sum, item) => sum + ((item.mrp || 0) * (item.quantity || 0)), 0);
  const totalSavings = totalMRP - totalAmount;

  return {
    totalItems,
    totalAmount: Math.max(0, totalAmount),
    totalMRP: Math.max(0, totalMRP),
    totalSavings: Math.max(0, totalSavings)
  };
};

const initialState = {
  items: loadCartFromLocalStorage(),
  ...calculateCartTotals(loadCartFromLocalStorage()),
  isOpen: false,
  message: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      try {
        const product = action.payload;
        if (!product || !product.id) {
          console.error('Invalid product data:', product);
          return;
        }

        const existingItem = state.items.find(item => item.id === product.id);

        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 0) + 1;
        } else {
          const cartItem = {
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
          };
          state.items.push(cartItem);
        }

        // Recalculate totals
        const totals = calculateCartTotals(state.items);
        Object.assign(state, totals);

        // Save to localStorage
        saveCartToLocalStorage(state.items);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    },

    removeFromCart: (state, action) => {
      try {
        const productId = action.payload;
        if (!productId) {
          console.error('Invalid product ID for removal:', productId);
          return;
        }

        const itemIndex = state.items.findIndex(item => item.id === productId);

        if (itemIndex !== -1) {
          // Remove the item from the array
          state.items.splice(itemIndex, 1);

          // Recalculate totals
          const totals = calculateCartTotals(state.items);
          Object.assign(state, totals);

          // Save to localStorage
          saveCartToLocalStorage(state.items);

          state.message = 'Item removed from cart';
        } else {
          console.warn('Item not found for removal:', productId);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    },

    updateQuantity: (state, action) => {
      try {
        const { productId, quantity } = action.payload;

        if (!productId || quantity < 0) {
          console.error('Invalid update quantity parameters:', { productId, quantity });
          return;
        }

        if (quantity === 0) {
          // Remove item if quantity is 0
          cartSlice.caseReducers.removeFromCart(state, { payload: productId });
          return;
        }

        const item = state.items.find(item => item.id === productId);

        if (item) {
          item.quantity = quantity;

          // Recalculate totals
          const totals = calculateCartTotals(state.items);
          Object.assign(state, totals);

          // Save to localStorage
          saveCartToLocalStorage(state.items);
        } else {
          console.warn('Item not found for quantity update:', productId);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    },

    clearCart: (state) => {
      try {
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
        state.totalMRP = 0;
        state.totalSavings = 0;
        state.message = 'Cart cleared';

        localStorage.removeItem('dmart_cart');
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    },

    toggleCartSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },

    closeCartSidebar: (state) => {
      state.isOpen = false;
    },

    clearMessage: (state) => {
      state.message = null;
    }
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCartSidebar,
  closeCartSidebar,
  clearMessage
} = cartSlice.actions;

export default cartSlice.reducer;
