import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "pages/Home";
import Login from "pages/Login";
import Signup from "pages/Signup";
import ForgetPassword from "pages/ForgetPassword";
import ChangePassword from "pages/ChangePassword";
import Contact from "pages/Contact";
import Categories from "pages/Categories";
import Checkout from "pages/Checkout";
import TrackOrders from "pages/TrackOrders";
// import OrderHistory from "pages/OrderHistory";
// import Search from "pages/Search";
import Cart from "pages/Cart";
import SearchAdvance from "pages/SearchAdvance";
import ProductDetails from "pages/ProductDetails";
import RefundPolicy from "pages/RefundPolicy";
import PrivacyPolicy from "pages/PrivacyPolicy";
import TermsAndConditions from "pages/TermsAndConditions";
import Search from "pages/Search";

// Protected Route: Requires user to be logged in
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("accessToken");
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(location.pathname)}`}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
};

// Guest Route: Requires user to be not logged in
const GuestRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/category/:slug" element={<Categories />} />
      {/* <Route path="/order-history" element={<OrderHistory />} /> */}
      {/* <Route path="/search" element={<Search />} /> */}
      <Route path="/search" element={<Search />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/details/:category/:product" element={<ProductDetails />} />
      <Route path="/search-advance" element={<SearchAdvance />} />
      <Route path="/product-details" element={<ProductDetails />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-services" element={<TermsAndConditions />} />

      {/* Guest Routes (not logged in) */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgetPassword />
          </GuestRoute>
        }
      />

      {/* Protected Routes (require login) */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/track-order"
        element={
          <ProtectedRoute>
            <TrackOrders />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}