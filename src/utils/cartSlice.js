import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    updateCartItemUnits: (state, action) => {
      const { itemId, units } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.id === itemId);
      if (itemIndex !== -1) {
        state.items[itemIndex].units = units;
        // Recalculate totals
        state.items[itemIndex].subtotal = units * (state.items[itemIndex].subtotal / (state.items[itemIndex].units || 1));
        state.items[itemIndex].packSubtotal = units * (state.items[itemIndex].packSubtotal / (state.items[itemIndex].units || 1));
        if (units === 0) {
          state.items.splice(itemIndex, 1); // Remove item if units are 0
        }
      }
    },
    setCartItems: (state, action) => {
      console.log("Setting cart items in Redux:", action.payload); // Debug log
      state.items = action.payload || [];
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { updateCartItemUnits, setCartItems, clearCart } = cartSlice.actions;
export default cartSlice.reducer;