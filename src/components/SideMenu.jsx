import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import styles from "assets/css/SideMenuStyles.module.css";
import {
  FaTape,
  FaUtensils,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaToiletPaper } from "react-icons/fa";
import { LiaPalletSolid } from "react-icons/lia";
import { PiShoppingBagOpenFill } from "react-icons/pi";

const menuItems = [
  { label: "Wraps", href: "/category/wraps", icon: LiaPalletSolid },
  { label: "Pallet Wraps", href: "/details/wraps/pallet-wraps" },
  { label: "Pallet Covers", href: "/details/wraps/pallet-covers" },

  { label: "Bags", href: "/category/bags", icon: PiShoppingBagOpenFill },
  { label: "Mailing Bags", href: "/details/bags/mailing-bags" },
  { label: "Clear Bags", href: "/details/bags/clear-bags" },
  { label: "Arofol Bubble Mailers", href: "/details/bags/bubble-mailers" },
  { label: "Book Mailers", href: "/details/bags/book-mailers" },

  { label: "Tapes", href: "/category/tapes", icon: FaTape },
  { label: "Clear, Colour & Fragile Tapes", href: "/details/tapes/tapes" },
  { label: "Tape Dispenser", href: "/details/tapes/tape-dispenser" },

  { label: "Food Packaging", href: "/category/food-packaging", icon: FaUtensils },
  { label: "Cup Holders", href: "/details/food-packaging/cup-holders" },
  { label: "Paper Plates", href: "/details/food-packaging/paper-plates" },
  { label: "Baggasse Paper Plates", href: "/details/food-packaging/baggasse-paper-plates" },
  { label: "Foil Trays", href: "/details/food-packaging/foil-trays" },
  { label: "Vegetable Rolls", href: "/details/food-packaging/vegetable-rolls" },
  { label: "Grip Seal Bags", href: "/details/food-packaging/grip-seal-bags" },
  { label: "Carrier Bags", href: "/details/food-packaging/carrier-bags" },
  { label: "Bin Bags", href: "/details/food-packaging/bin-bags" },
  { label: "Butcher Bags", href: "/details/food-packaging/butcher-bags" },
  { label: "Till Rolls", href: "/details/food-packaging/till-rolls" },
  { label: "Centrefeed Rolls", href: "/details/food-packaging/centrefeed-rolls" },


  { label: "Labels & Rolls", href: "/rolls", icon: FaToiletPaper },
  { label: "Thermal Labels", href: "/details/rolls/thermal-labels" },
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
                  <><span className={`${styles.icon} icon-xs`} /></>
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