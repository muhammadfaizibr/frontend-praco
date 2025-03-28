import React from "react";
import FooterStyles from "assets/css/FooterStyles.module.css";
import Logo from "assets/images/logo.svg";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import NewsLetterSearchBar from "components/NewsLetterSearchBar";

const Footer = () => {
  const menu = [
    { label: "About", link: "about" },
    { label: "Contact", link: "contact" },
    { label: "Terms & Condition", link: "terms-condition" },
    { label: "Privacy Policy", link: "Privacy Policy" },
    { label: "Refund Policy", link: "Refund Policy" },
  ];

  const categories = [
    { label: "About", link: "about" },
    { label: "Contact", link: "contact" },
    { label: "Terms & Condition", link: "terms-condition" },
    { label: "Privacy Policy", link: "Privacy Policy" },
    { label: "Refund Policy", link: "Refund Policy" },
  ];
  return (
    <footer className="centered-layout-wrapper">
      <div className={`centered-layout ${FooterStyles.contentWrapper} filled-layout-padding`}>
        <div className={FooterStyles.childWrapper}>
          <div className={FooterStyles.logo}>
            <img src={Logo} alt="Praco Logo" />
          </div>

          <div className="list-content space-1vw">
            <p className="b2 clr-white">Email: info@praco.co.uk</p>
            <p className="b2 clr-white">Call: 0116 260 7078</p>
          </div>
          <div className="row-content space-1vw">
            <a href="praco-social" className={`square-btn ${FooterStyles.socialIcon}`}>
              <Facebook />
            </a>
            <a href="praco-social" className={`square-btn ${FooterStyles.socialIcon}`}>
              <Instagram />
            </a>
            <a href="praco-social" className={`square-btn ${FooterStyles.socialIcon}`}>
              <Twitter />
            </a>
            <a href="praco-social" className={`square-btn ${FooterStyles.socialIcon}`}>
              <Youtube />
            </a>
          </div>
        </div>

        <div className={FooterStyles.childWrapper}>
          <h5 className="light">Links</h5>
          <div className="list-content space-1vw">
            {menu.map((menuElement, index) => {
              return (
                <Link
                  key={`footerMenu_${index}`}
                  to={menuElement.link}
                  className="b2 link-dark"
                >
                  {menuElement.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className={FooterStyles.childWrapper}>
          <h5 className="light">Categories</h5>
          <div className="list-content space-1vw">
            {categories.map((categoriesElement, index) => {
              return (
                <Link
                  key={`footerCategories_${index}`}
                  to={categoriesElement.link}
                  className="b2 link-dark"
                >
                  {categoriesElement.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className={FooterStyles.childWrapper}>
          <h5 className="light">Subscribe Our Newsletter</h5>
          <NewsLetterSearchBar />
        </div> 
      </div>
    </footer>
  );
};

export default Footer;
