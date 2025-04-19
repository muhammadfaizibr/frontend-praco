import React, { useState, useEffect } from "react";
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

const Navbar = () => {
  const [searchMobile, setSearchMobile] = useState(false);
  const [toggleUnitConversionPopup, setToggleUnitConversionPopup] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1200) {
        setSearchMobile(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setShowAccountPopup(false);
    navigate("/");
  };

  return (
    <nav>
      <div className={NavBarStyles.navbarContentWrapper}>
        <div className={NavBarStyles.childWrapper}>
          <div className={NavBarStyles.logo}>
            <NavLink to="/">
              <img src={Logo} alt="Praco Logo" />
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
              name="unit-converter"
              onClick={() => {
                setToggleUnitConversionPopup(!toggleUnitConversionPopup);
                setSearchMobile(false);
                setShowAccountPopup(false);
              }}
            >
              <Calculator
                className={`icon-md ${
                  toggleUnitConversionPopup ? "clr-white" : "icon-blue-accent-dark"
                }`}
              />
            </button>
            <button
              className={`${NavBarStyles.actionButtonStyle} accent-palette`}
              type="button"
              name="cart"
            >
              <ShoppingBag className="icon-md icon-blue-accent-dark" />
            </button>
            {isLoggedIn ? (
              <div className={NavBarStyles.accountWrapper}>
                <button
                  className={`${NavBarStyles.actionButtonStyle} accent-palette`}
                  type="button"
                  name="user-account"
                  onClick={() => {
                    setShowAccountPopup(!showAccountPopup);
                    setSearchMobile(false);
                    setToggleUnitConversionPopup(false);
                  }}
                >
                  <CircleUserRound className="icon-md icon-blue-accent-dark" />
                </button>
                {showAccountPopup && (
                  <div className={NavBarStyles.accountPopup}>
                    <button
                      className={`${NavBarStyles.logoutButton} b2`}
                      type="button"
                      onClick={handleLogout}
                    >
                      <LogOut className="icon-md clr-text" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" style={{display: 'flex'}}>
                <button
                  className={`${NavBarStyles.actionButtonStyle} primary-btn b2`}
                  type="button"
                  name="login"
                >
                  Login
                </button>
              </NavLink>
            )}
            <button
              className={`${NavBarStyles.actionButtonStyle} ${NavBarStyles.searchMobileToggleBtn} accent-palette`}
              type="button"
              name="search-mobile"
              onClick={() => {
                setSearchMobile(!searchMobile);
                setToggleUnitConversionPopup(false);
                setShowAccountPopup(false);
              }}
            >
              {searchMobile ? (
                <X className="icon-md icon-blue-accent-dark" />
              ) : (
                <Search className="icon-md icon-blue-accent-dark" />
              )}
            </button>
            <a href="tel:01162607078">
              <button
                className={`${NavBarStyles.callBtn} primary-btn b2`}
                type="button"
                name="call"
              >
                0116 260 7078
              </button>
            </a>
            <div className={NavBarStyles.unitConversionContainer}>
              {toggleUnitConversionPopup ? <UnitConversionPopup /> : ""}
            </div>
          </div>
        </div>
        {searchMobile && (
          <div className={NavBarStyles.mobileSearchBarWrapper}>
            <SearchBarHeader />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;