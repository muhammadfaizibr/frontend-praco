import { Routes, Route } from 'react-router-dom';
import Home from 'pages/Home';
import Login from 'pages/Login';
import Signup from 'pages/Signup'
import ForgetPassword from 'pages/ForgetPassword';
import ChangePassword from 'pages/ChangePassword';
import VerifyEmail from 'pages/VerifyEmail';
import VerifyOtp from 'pages/VerifyOTP';
import Contact from 'pages/Contact'
import Shop from 'pages/Shop'
import Checkout from 'pages/Checkout'
import TrackOrder from 'pages/TrackOrder';
import OrderHistory from 'pages/OrderHistory';
import Search from 'pages/Search';
import Cart from 'pages/Cart';
import SearchAdvance from 'pages/SearchAdvance';
import ProductDetails from 'pages/ProductDetails';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/search" element={<Search />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/search-advance" element={<SearchAdvance />} />
      <Route path="/product-details" element={<ProductDetails />} />
    </Routes>
  );
}


{/* <Route path="/verify-email" element={<VerifyEmail />} />
<Route path="/verify-otp" element={<VerifyOtp />} /> */}