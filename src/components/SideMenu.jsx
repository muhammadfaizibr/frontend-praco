import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "assets/css/SideMenuStyles.module.css";
import {
  FaFilm,
  FaTape,
  FaUtensils,
  FaShoppingBag,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaToiletPaper } from "react-icons/fa";

const menuItems = [
  { label: "Wraps", href: "/category/wraps", icon: FaFilm },
  { label: "Shrink Wraps", href: "/details/wraps/shrink-wraps" },
  { label: "Pallet Covers", href: "/details/wraps/pallet-covers" },
  { label: "Vegetable Rolls", href: "/details/wraps/vegetable-rolls" },
  { label: "Bags", href: "/category/bags", icon: FaShoppingBag },
  { label: "Mailing Bags", href: "/details/bags/mailing-bags" },
  { label: "Clear Bags", href: "/details/bags/clear-bags" },
  { label: "Aerofol Bubble Mailers", href: "/details/bags/bubble-mailers" },
  { label: "Carrier Bags", href: "/details/bags/carrier-bags" },
  { label: "Grip Seal Bags", href: "/details/bags/grip-seal-bags" },
  { label: "Aerofol Bubble Mailers", href: "/details/bags/bubble-mailers" },
  { label: "Bin Bags", href: "/details/bags/bin-bags" },
  { label: "Butcher Bags", href: "/details/bags/butcher-bags" },
  { label: "Book Mailers", href: "/details/bags/book-mailers" },
  { label: "Tapes", href: "/tapes", icon: FaTape },
  { label: "Clear, Colour & Fragile Tapes", href: "/details/tapes/tapes" },
  { label: "Tape Dispenser", href: "/details/tapes/tape-dispenser" },
  { label: "Food Packaging", href: "/details/food-packaging", icon: FaUtensils },
  { label: "Cup Holders", href: "/details/food-packaging/cup-holders" },
  { label: "Paper Plates", href: "/details/food-packaging/paper-plates" },
  { label: "Foil Trays", href: "/details/food-packaging/foil-trays" },
  { label: "Labels & Rolls", href: "/rolls", icon: FaToiletPaper },
  { label: "Till Rolls", href: "/details/rolls/till-rolls" },
  { label: "Thermal Labels", href: "/details/rolls/thermal-labels" },
  { label: "Centrefeed Rolls", href: "/details/rolls/centrefeed-rolls" },
];

const SideMenu = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1440) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  useEffect(() => {
    // Close the menu on route change for mobile viewports (below 1440px)
    if (window.innerWidth <= 1440) {
      setIsOpen(false);
    }
  }, [location, setIsOpen]);

  return (
    <div className={`${styles.sideMenu} ${isOpen ? styles.open : ""}`}>
      <nav className={styles.menuContent}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.label} className={`${styles.menuItem} ${item.icon ? styles.hasIcon : ""}`}>
              <Link to={item.href} className={`${styles.menuLink} b3`}>
                {item?.icon ? (
                  <item.icon className={`${styles.icon} icon-xs`} />
                ) : (
                  <span className={`${styles.icon} icon-xs`} />
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SideMenu;
export { menuItems };