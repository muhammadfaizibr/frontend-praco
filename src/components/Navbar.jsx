import React, { useState, useEffect } from "react";
import NavBarStyles from "assets/css/NavBarStyles.module.css";
import {
  Calculator,
  ShoppingBag,
  CircleUserRound,
  Search,
  X,
} from "lucide-react";
import Logo from "assets/images/logo.svg";
import { NavLink } from "react-router-dom";
import SearchBarHeader from "components/SearchBarHeader";
import UnitConversionPopup from "components/UnitConversionPopup";

const Navbar = () => {
  const [searchMobile, setSearchMobile] = useState(false);
  const [toggleUnitConversionPopup, setToggleUnitConversionPopup] =
    useState(false);

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
              className={`${NavBarStyles.actionButtonStyle} ${toggleUnitConversionPopup ? "primary-btn" : "accent-palette"}`}
              type="button"
              name="unit-converter"
              onClick={() => {setToggleUnitConversionPopup(!toggleUnitConversionPopup); setSearchMobile(false)}}
            >
              <Calculator className={`icon-md ${toggleUnitConversionPopup ? "clr-white" : "icon-blue-accent-dark"}`} />
            </button>
            <button
              className={`${NavBarStyles.actionButtonStyle} accent-palette`}
              type="button"
              name="cart"
            >
              <ShoppingBag className={"icon-md icon-blue-accent-dark"} />
            </button>
            <button
              className={`${NavBarStyles.actionButtonStyle} accent-palette`}
              type="button"
              name="user-account"
            >
              <CircleUserRound className={"icon-md icon-blue-accent-dark"} />
            </button>
            <button
              className={`${NavBarStyles.actionButtonStyle} ${NavBarStyles.searchMobileToggleBtn} accent-palette`}
              type="button"
              name="user-account"
              onClick={() => {setSearchMobile(!searchMobile); setToggleUnitConversionPopup(false)}}
            >
              {searchMobile ? (
                <X className={"icon-md icon-blue-accent-dark"} />
              ) : (
                <Search className={"icon-md icon-blue-accent-dark"} />
              )}
            </button>
            <a href="tel:01162607078"><button
              className={`${NavBarStyles.callBtn} primary-btn b2`}
              type="button"
              name="login"
            >
              0116 260 7078
            </button></a>

            <div className={NavBarStyles.unitConversionContainer}>
              {toggleUnitConversionPopup ? <UnitConversionPopup /> : ""}
            </div>
          </div>
        </div>
        {searchMobile ? (
          <div className={NavBarStyles.mobileSearchBarWrapper}>
            <SearchBarHeader />
          </div>
        ) : (
          ""
        )}
      </div>
    </nav>
  );
};

export default Navbar;
