import React, {useEffect} from "react";
import Products from "components/Products";
// import BreadCrumb from "components/BreadCrumb";

const Shop = () => {
  const products = []
        useEffect(()=>{
          document.title = 'Search Results - Praco';
        }, [])

  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
        <Products title={`Search Results for`} highlightedText={`"Pallet Wraps"`} products={products}/>
      </div>
    </div>
  );
};

export default Shop;
