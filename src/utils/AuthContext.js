import React, { createContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { verifyToken, refreshToken } from "utils/api/account";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  verifyAndRefreshToken: () => Promise.resolve(false),
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem("accessToken") && !!localStorage.getItem("refreshToken");
  });
  const navigate = useNavigate();

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [navigate]);

  const verifyAndRefreshToken = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      logout();
      return false;
    }

    try {
      await verifyToken({ token: accessToken });
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      if (error.status === 401 && error.message.includes("token_not_valid")) {
        try {
          const response = await refreshToken({ refresh: refreshToken });
          if (response.access) {
            localStorage.setItem("accessToken", response.access);
            setIsLoggedIn(true);
            return true;
          }
          throw new Error("Invalid refresh token response");
        } catch (refreshError) {
          logout();
          return false;
        }
      }
      logout();
      return false;
    }
  }, [logout]);

  useEffect(() => {
    verifyAndRefreshToken();
  }, [verifyAndRefreshToken]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, verifyAndRefreshToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};