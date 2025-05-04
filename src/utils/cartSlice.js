import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    summary: {
      totalItems: 0,
      subtotal: 0,
      total: 0,
      weight: 0,
      vatPercentage: 20,
      discountPercentage: 0,
    },
  },
  reducers: {
    setCartItems(state, action) {
      state.items = action.payload;
    },
    updateCartItemUnits(state, action) {
      const { itemId, ...updates } = action.payload;
      const item = state.items.find((item) => item.id === itemId);
      if (item) {
        Object.assign(item, updates);
      }
    },
    setCartSummary(state, action) {
      state.summary = { ...state.summary, ...action.payload };
    },
  },
});

export const { setCartItems, updateCartItemUnits, setCartSummary } = cartSlice.actions;
export default cartSlice.reducer;