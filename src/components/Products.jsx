import React from 'react'
import HeadingBar from 'components/HeadingBar'
import productsStyles from 'assets/css/ProductsStyles.module.css'
import Product from 'components/Product'
import PropTypes from 'prop-types'

const Products = ({title, products, highlightedText}) => {
    
  return (
    <section className={productsStyles.container}>
<HeadingBar
        displayType={"row"}
        headline={title}
        headlineSize={"h3"}
        headlineSizeType={"tag"}
        highlightedText={highlightedText}
      />        <div className={productsStyles.gridContainer}>
      <div className={productsStyles.productGrid}>
        {products.map((product, index) => (
          <Product
            key={index}
            image={product.image}
            title={product.title}
            price={product.price}
            alt={product.alt}
          />
        ))}
      </div>
    </div>
    </section>
  )
}

Products.propTypes = {
  title: PropTypes.string.isRequired,
  products: PropTypes.array.isRequired,   
  
};

Products.defaultProps = {
  products: Array(6).fill({
    image: "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
    title: "Ph'nglui mglw'nafh",
    description: "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn",
    alt: "kalita",
    price: "$20.00"
  })
}

export default Products