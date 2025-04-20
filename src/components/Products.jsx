import React from "react";
import PropTypes from "prop-types";
import HeadingBar from "components/HeadingBar";
import productsStyles from "assets/css/ProductsStyles.module.css";
import Product from "components/Product";

const Products = ({ title, products, highlightedText }) => {
  return (
    <section className={productsStyles.container}>
      <HeadingBar
        displayType={"row"}
        headline={title}
        headlineSize={"h3"}
        headlineSizeType={"tag"}
        highlightedText={highlightedText}
      />
      <div className={productsStyles.gridContainer}>
        <div className={productsStyles.productGrid}>
          {products.map((product) => 
              <Product
                key={product.id}
                id={product.id}
                slug={product.slug}
                category_slug={product.category.slug}
                image={product.image}
                title={product.title}
                variantCount={product.variantCount}
                alt={product.alt}
              />
            )
          }
        </div>
      </div>
    </section>
  );
};

Products.propTypes = {
  title: PropTypes.string.isRequired,
  products: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      variantCount: PropTypes.number.isRequired,
      alt: PropTypes.string.isRequired,
    })
  ).isRequired,
  highlightedText: PropTypes.string,
};

Products.defaultProps = {
  products: Array(6).fill({
    id: 0,
    image: "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
    title: "Ph'nglui mglw'nafh",
    variantCount: 0,
    alt: "kalita",
  }),
  highlightedText: "",
};

export default Products;