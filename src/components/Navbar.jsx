import React, { useState, useEffect, useCallback, memo, useRef } from "react";
import NavBarStyles from "assets/css/NavBarStyles.module.css";
import {
  Calculator,
  ShoppingBag,
  CircleUserRound,
  Search,
  X,
} from "lucide-react";
import Logo from "assets/images/logo.svg";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import SearchBarHeader from "components/SearchBarHeader";
import UnitConversionPopup from "components/UnitConversionPopup";
import MenuCategories from "components/MenuCategories";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "utils/store";

const Navbar = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Added to detect route changes
  const [searchMobile, setSearchMobile] = useState(false);
  const [toggleUnitConversionPopup, setToggleUnitConversionPopup] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  // Refs for popup elements to detect outside clicks
  const accountPopupRef = useRef(null);
  const unitConversionRef = useRef(null);
  const searchBarRef = useRef(null);

  // Reset all popups when route changes
  useEffect(() => {
    setSearchMobile(false);
    setToggleUnitConversionPopup(false);
    setShowAccountPopup(false);
  }, [location.pathname]);

  // Reset showAccountPopup when isLoggedIn changes
  useEffect(() => {
    setShowAccountPopup(false);
  }, [isLoggedIn]);

  // Handle window resize to close search mobile
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

  // Handle outside clicks
  const handleOutsideClick = useCallback(
    (event) => {
      // Check for account popup
      if (
        showAccountPopup &&
        accountPopupRef.current &&
        !accountPopupRef.current.contains(event.target) &&
        !event.target.closest(`.${NavBarStyles.actionButtonStyle}`) // Exclude account button
      ) {
        setShowAccountPopup(false);
      }

      // Check for unit conversion popup
      if (
        toggleUnitConversionPopup &&
        unitConversionRef.current &&
        !unitConversionRef.current.contains(event.target) &&
        !event.target.closest(`.${NavBarStyles.actionButtonStyle}`) // Exclude unit conversion button
      ) {
        setToggleUnitConversionPopup(false);
      }

      // Check for mobile search
      if (
        searchMobile &&
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target) &&
        !event.target.closest(`.${NavBarStyles.searchMobileToggleBtn}`) // Exclude search toggle button
      ) {
        setSearchMobile(false);
      }
    },
    [showAccountPopup, toggleUnitConversionPopup, searchMobile]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleOutsideClick]);

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

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/", { replace: true });
  }, [dispatch, navigate]);

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
            ref={searchBarRef}
          >
            <SearchBarHeader />
          </div>
          <div className={NavBarStyles.actionButtons}>
            <button
              className={`${NavBarStyles.actionButtonStyle} ${NavBarStyles.searchMobileToggleBtn} accent-palette ${
                searchMobile ? NavBarStyles.active : ""
              }`}
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
            <Link
              className={`${NavBarStyles.actionButtonStyle} accent-palette`}
              to="/cart"
              aria-label="View Cart"
            >
              <ShoppingBag className="icon-md icon-blue-accent-dark" aria-hidden="true" />
            </Link>

            {isLoggedIn ? (
              <div className={NavBarStyles.accountWrapper}>
                <button
                  className={`${NavBarStyles.actionButtonStyle} accent-palette`}
                  type="button"
                  aria-label="Account Menu"
                  aria-expanded={showAccountPopup}
                  aria-controls="account-popup"
                  onClick={toggleAccountPopup}
                >
                  <CircleUserRound className="icon-md icon-blue-accent-dark" aria-hidden="true" />
                </button>
                {showAccountPopup && (
                  <div
                    className={NavBarStyles.accountPopup}
                    id="account-popup"
                    role="menu"
                    aria-orientation="vertical"
                    ref={accountPopupRef}
                  >
                    <NavLink
                      to="/track-order"
                      className={`${NavBarStyles.actionButtonStyle} b2 clr-black`}
                      role="menuitem"
                      aria-label="Track Orders"
                    >
                      Track Orders
                    </NavLink>
                    <NavLink
                      to="/change-password"
                      className={`${NavBarStyles.actionButtonStyle} b2 clr-black`}
                      role="menuitem"
                      aria-label="Change Password"
                    >
                      Change Password
                    </NavLink>
                    <button
                      className={`${NavBarStyles.actionButtonStyle} ${NavBarStyles.logoutButton} b2`}
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      aria-label="Logout"
                    >
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

            <a href="tel:01162607078" aria-label="Call 0116 365 3008">
              <button
                className={`${NavBarStyles.callBtn} primary-btn b2`}
                type="button"
              >
                0116 365 3008
              </button>
            </a>
            {toggleUnitConversionPopup && (
              <div
                className={NavBarStyles.unitConversionContainer}
                ref={unitConversionRef}
              >
                <UnitConversionPopup />
              </div>
            )}
          </div>
        </div>
        {searchMobile && (
          <div
            className={NavBarStyles.mobileSearchBarWrapper}
            ref={searchBarRef}
          >
            <SearchBarHeader />
          </div>
        )}
        <MenuCategories />
      </div>
    </nav>
  );
};

export default memo(Navbar);