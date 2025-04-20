import React, { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import NavBarStyles from "assets/css/NavBarStyles.module.css";
import {
  Calculator,
  ShoppingBag,
  CircleUserRound,
  Search,
  X,
  LogOut,
} from "lucide-react";
import Logo from "assets/images/logo.svg";
import { NavLink, useNavigate } from "react-router-dom";
import SearchBarHeader from "components/SearchBarHeader";
import UnitConversionPopup from "components/UnitConversionPopup";
import MenuCategories from "./MenuCategories";

const Navbar = () => {
  const [searchMobile, setSearchMobile] = useState(false);
  const [toggleUnitConversionPopup, setToggleUnitConversionPopup] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("accessToken"));
  const navigate = useNavigate();

  // Update isLoggedIn when localStorage changes (e.g., after login/signup)
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };
    // Initial check
    checkAuth();
    // Listen for storage changes (e.g., in another tab)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleResize = useCallback(() => {
    if (window.innerWidth > 1200) {
      setSearchMobile(false);
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  const handleLogout = useCallback(() => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      setShowAccountPopup(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [navigate]);

  const toggleSearchMobile = useCallback(() => {
    setSearchMobile((prev) => !prev);
    setToggleUnitConversionPopup(false);
    setShowAccountPopup(false);
  }, []);

  const toggleUnitConversion = useCallback(() => {
    setToggleUnitConversionPopup((prev) => !prev);
    setSearchMobile(false);
    setShowAccountPopup(false);
  }, []);

  const toggleAccountPopup = useCallback(() => {
    setShowAccountPopup((prev) => !prev);
    setSearchMobile(false);
    setToggleUnitConversionPopup(false);
  }, []);

  return (
    <nav aria-label="Main navigation">
      <div className={NavBarStyles.navbarContentWrapper}>
        <div className={NavBarStyles.childWrapper}>
          <div className={NavBarStyles.logo}>
            <NavLink to="/" aria-label="Praco Home">
              <img src={Logo} alt="Praco Logo" width="120" height="40" />
            </NavLink>
          </div>
          <div
            className={`${NavBarStyles.searchBarWrapper} ${
              searchMobile ? NavBarStyles.searchBarMobile : ""
            }`}
          >
            <SearchBarHeader />
          </div>
          <div className={NavBarStyles.actionButtons}>
            <button
              className={`${NavBarStyles.actionButtonStyle} ${
                toggleUnitConversionPopup ? "primary-btn" : "accent-palette"
              }`}
              type="button"
              aria-label="Toggle Unit Converter"
              onClick={toggleUnitConversion}
            >
              <Calculator
                className={`icon-md ${
                  toggleUnitConversionPopup ? "clr-white" : "icon-blue-accent-dark"
                }`}
                aria-hidden="true"
              />
            </button>
            <button
              className={`${NavBarStyles.actionButtonStyle} accent-palette`}
              type="button"
              aria-label="View Cart"
            >
              <ShoppingBag className="icon-md icon-blue-accent-dark" aria-hidden="true" />
            </button>
            {isLoggedIn ? (
              <div className={NavBarStyles.accountWrapper}>
                <button
                  className={`${NavBarStyles.actionButtonStyle} accent-palette`}
                  type="button"
                  aria-label="Account Menu"
                  aria-expanded={showAccountPopup}
                  onClick={toggleAccountPopup}
                >
                  <CircleUserRound className="icon-md icon-blue-accent-dark" aria-hidden="true" />
                </button>
                {showAccountPopup && (
                  <div className={NavBarStyles.accountPopup} role="menu">
                    <NavLink
                      to="/change-password"
                      className="b2 clr-black"
                      role="menuitem"
                      aria-label="Change Password"
                    >
                      Change Password
                    </NavLink>
                    <button
                      className={`${NavBarStyles.logoutButton} b2`}
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      aria-label="Logout"
                    >
                      <LogOut className="icon-md clr-text" aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" aria-label="Login">
                <button
                  className={`${NavBarStyles.actionButtonStyle} primary-btn b2`}
                  type="button"
                >
                  Login
                </button>
              </NavLink>
            )}
            <button
              className={`${NavBarStyles.actionButtonStyle} ${NavBarStyles.searchMobileToggleBtn} accent-palette`}
              type="button"
              aria-label={searchMobile ? "Close Search" : "Open Search"}
              onClick={toggleSearchMobile}
            >
              {searchMobile ? (
                <X className="icon-md icon-blue-accent-dark" aria-hidden="true" />
              ) : (
                <Search className="icon-md icon-blue-accent-dark" aria-hidden="true" />
              )}
            </button>
            <a href="tel:01162607078" aria-label="Call 0116 260 7078">
              <button
                className={`${NavBarStyles.callBtn} primary-btn b2`}
                type="button"
              >
                0116 260 7078
              </button>
            </a>
            {toggleUnitConversionPopup && (
              <div className={NavBarStyles.unitConversionContainer}>
                <UnitConversionPopup />
              </div>
            )}
          </div>
        </div>
        {searchMobile && (
          <div className={NavBarStyles.mobileSearchBarWrapper}>
            <SearchBarHeader />
          </div>
        )}
        <MenuCategories />
      </div>
    </nav>
  );
};

Navbar.propTypes = {};

export default memo(Navbar);