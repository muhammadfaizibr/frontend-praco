import { configureStore, createSlice } from "@reduxjs/toolkit";
import cartReducer from 'utils/cartSlice'

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: !!localStorage.getItem("accessToken"),
  },
  reducers: {
    login(state) {
      state.isLoggedIn = true;
    },
    logout(state) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartReducer,

  },
});