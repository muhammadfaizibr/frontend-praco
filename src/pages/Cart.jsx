import React from "react";
import HeadingBar from "components/HeadingBar";
import CartTable from "components/CartTable";
import Products from "components/Products";

const Cart = () => {
  const products = Array(4).fill({
    image:
      "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
    title: "Ph'nglui mglw'nafh",
    description: "Ph'nglui mglw'nafh Cthulhu R'lyeh wgah'nagl fhtagn",
    alt: "kalita",
    price: "$20.00",
  });

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

          <CartTable />
        </div>
      </div>
    </div>
  );
};

export default Cart;
