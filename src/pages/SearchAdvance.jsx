import React from "react";
import Products from "components/Products";
import BreadCrumb from "components/BreadCrumb";

const Shop = () => {
    const products = Array(6).fill({
        image: "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
        title: "Ph'nglui mglw'nafh",
        description: "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn",
        alt: "kalita",
        price: "$20.00"
      });

  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
        <Products title={`Search Results for`} highlightedText={`"Pallet Wraps"`} products={products}/>
      </div>
    </div>
  );
};

export default Shop;
