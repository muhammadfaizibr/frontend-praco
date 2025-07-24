import React, { useEffect, useState } from "react";
import FooterStyles from "assets/css/FooterStyles.module.css";
import DarkLogo from "assets/images/logo-dark.svg";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import NewsLetterInput from "components/NewsLetterInput";
import { menuItems } from "components/SideMenu"; 

const Footer = () => {
  const [categories, setCategories] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);

  const menu = [
    { label: "Contact", link: "contact" },
    { label: "Terms & Condition", link: "terms-of-services" },
    { label: "Privacy Policy", link: "privacy-policy" },
    { label: "Refund Policy", link: "refund-policy" },
  ];

  useEffect(() => {
    // Filter menuItems to get only top-level categories (those with an icon)
    setCategories(menuItems);
    // setLoading(false);
  }, []);

  return (
    <footer className="centered-layout-wrapper">
      <div className={`centered-layout ${FooterStyles.contentWrapper} filled-layout-padding`}>
        <div className={FooterStyles.childWrapper}>
          <div className={FooterStyles.logo}>
            <img src={DarkLogo} alt="Praco Logo" />
          </div>

          <div className="column-content space-1vw">
            <p className="b2 clr-white">Email: info@praco.co.uk</p>
            <p className="b2 clr-white">Call: 0116 365 3008</p>
          </div>
          <div className="row-content space-1vw">
            <Link className={`square-btn ${FooterStyles.socialIcon}`}>
              <Facebook />
            </Link>
            <Link className={`square-btn ${FooterStyles.socialIcon}`}>
              <Instagram />
            </Link>
            <Link className={`square-btn ${FooterStyles.socialIcon}`}>
              <Twitter />
            </Link>
            <Link className={`square-btn ${FooterStyles.socialIcon}`}>
              <Youtube />
            </Link>
          </div>
        </div>

        <div className={FooterStyles.childWrapper}>
          <h5 className="light">Links</h5>
          <div className="column-content space-1vw">
            {menu.map((menuElement, index) => (
              <Link
                key={`footerMenu_${index}`}
                to={menuElement.link}
                className="b2 link-dark"
              >
                {menuElement.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={FooterStyles.childWrapper}>
          <h5 className="light">Categories</h5>
          <div className="column-content space-1vw">
        
            {categories.map((category, index) => (
              <Link
                key={`footerCategories_${index}`}
                to={category.href}
                className="b2 link-dark"
              >
                {category.label}
              </Link>
            ))}
          </div>
        </div>

        <div className={FooterStyles.childWrapper}>
          <h5 className="light">Subscribe Our Newsletter</h5>
          <NewsLetterInput />
        </div>
      </div>
    </footer>
  );
};

export default Footer;