import React from 'react'
import ProductCardStyles from 'assets/css/ProductStyles.module.css';

const Product = ({ image, title, price, alt }) => {  return (
<div className={ProductCardStyles.productCard}>
      <div className={ProductCardStyles.imageWrapper}>
        <img src={image} alt={alt} />
      </div>
        <div className={ProductCardStyles.contentWrapper}>
        <p className="s1">{title}</p>
      <div className={ProductCardStyles.content}>
        <p className="s1 clr-primary">{price}</p>
        <button className="primary-btn small-btn text-medium hover-primary">
          View Details
        </button>
      </div>
      </div>
    </div>
  )
}

export default Product