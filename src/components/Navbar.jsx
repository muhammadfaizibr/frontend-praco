import React, { useState, useEffect, useCallback, memo } from "react";
import NavBarStyles from "assets/css/NavBarStyles.module.css";
import {
  Calculator,
  ShoppingBag,
  CircleUserRound,
  Search,
  X,
} from "lucide-react";
import Logo from "assets/images/logo.svg";
import { Link, NavLink, useNavigate } from "react-router-dom";
import SearchBarHeader from "components/SearchBarHeader";
import UnitConversionPopup from "components/UnitConversionPopup";
import MenuCategories from "./MenuCategories";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "utils/store";

const Navbar = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchMobile, setSearchMobile] = useState(false);
  const [toggleUnitConversionPopup, setToggleUnitConversionPopup] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  // Reset showAccountPopup when isLoggedIn changes
  useEffect(() => {
    setShowAccountPopup(false);
  }, [isLoggedIn]);

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

  const handleLogout = () => {
    dispatch(logout());
    navigate("/", { replace: true });
  };

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
            <div><Link
              className={`${NavBarStyles.actionButtonStyle} accent-palette`}
              to={"/cart"}
              aria-label="View Cart"
            >
              <ShoppingBag className="icon-md icon-blue-accent-dark" aria-hidden="true" />
            </Link></div>
            
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
                      to="/track-order"
                      className="b2 clr-black"
                      role="menuitem"
                      aria-label="Change Password"
                    ><button className={NavBarStyles.actionButtonStyle}>
                      Track Orders
                    </button></NavLink>
                    <NavLink
                      to="/change-password"
                      className="b2 clr-black"
                      role="menuitem"
                      aria-label="Change Password"
                    ><button className={NavBarStyles.actionButtonStyle}>
                      Change Password
                    </button></NavLink>
                    <button
                      className={`${NavBarStyles.logoutButton} b2`}
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
              <div>
                <NavLink to="/login" aria-label="Login">
                <button
                  className={`${NavBarStyles.actionButtonStyle} primary-btn b2`}
                  type="button"
                >
                  Login
                </button>
              </NavLink>
              </div>
            )}

            <div>
              <a href="tel:01162607078" aria-label="Call 0116 365 3008">
                <button
                  className={`${NavBarStyles.callBtn} primary-btn b2`}
                  type="button"
                >
                  0116 365 3008
                </button>
              </a>
            </div>
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