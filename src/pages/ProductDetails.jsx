import React from "react";
import HeadingBar from "components/HeadingBar";
import ProductsTable from "components/ProductsTable";
import Products from "components/Products";

const ProductDetails = () => {
  return (
    <div className="column-content">
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout full-width-flex-col gap-m">
        <HeadingBar
          displayType={"row"}
          headline={"My Cart"}
          headlineSize={"h3"}
          headlineSizeType={"tag"}
          theme={"light"}
        />

        <ProductsTable />
      </div>
    </div>
    </div>

  );
};

export default ProductDetails;
