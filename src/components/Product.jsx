import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import ProductCardStyles from "assets/css/ProductCardStyles.module.css";

const Product = ({ id, slug, category_slug, image, title, alt }) => {
  return (
    <div className={ProductCardStyles.productCard}>
      <div className={ProductCardStyles.imageWrapper}>
        <img
          src={image}
          alt={alt}
          // onError={(e) => (e.target.src = "https://via.placeholder.com/600x400?text=Image+Not+Found")}
        />
      </div>
      <div className={ProductCardStyles.contentWrapper}>
        <p className={`${ProductCardStyles.productTitle} s1`}>{title}</p>
        <div className={ProductCardStyles.content}>
          <Link to={`/details/${category_slug}/${slug}`}>
            <button className="primary-btn small-btn text-medium hover-primary">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

Product.propTypes = {
  id: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  variantCount: PropTypes.number.isRequired,
  alt: PropTypes.string.isRequired,
};

export default Product;