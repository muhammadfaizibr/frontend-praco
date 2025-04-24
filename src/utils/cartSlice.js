import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    addToCart(state, action) {
      const newItems = action.payload;
      newItems.forEach((newItem) => {
        const existingItem = state.items.find((item) => item.id === newItem.id);
        if (existingItem) {
          existingItem.units += newItem.units;
          existingItem.subtotal += newItem.subtotal;
        } else {
          state.items.push({ ...newItem });
        }
      });
    },
    updateCartItemUnits(state, action) {
      const { itemId, units } = action.payload;
      const item = state.items.find((item) => item.id === itemId);
      if (item && units >= 0) {
        const pricePerUnit = item.subtotal / item.units;
        item.units = units;
        item.subtotal = pricePerUnit * units;
        if (item.units === 0) {
          state.items = state.items.filter((i) => i.id !== itemId);
        }
      }
    },
  },
});

export const { addToCart, updateCartItemUnits } = cartSlice.actions;
export default cartSlice.reducer;