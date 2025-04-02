import { Routes, Route } from 'react-router-dom';
import Home from 'pages/Home';
import Login from 'pages/Login';
import Signup from 'pages/Signup'
import ForgetPassword from 'pages/ForgetPassword';
import ChangePassword from 'pages/ChangePassword';
import VerifyEmail from 'pages/VerifyEmail';
import VerifyOtp from 'pages/VerifyOTP';
import Contact from 'pages/Contact'
// import { About } from 'pages/About';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/contact" element={<Contact />} />
      {/* <Route path="/about" element={<About />} /> */}
    </Routes>
  );
}