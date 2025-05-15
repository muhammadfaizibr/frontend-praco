import React, {useEffect} from "react";
import HeadingBar from "components/HeadingBar";
import CartTable from "components/CartTable";

const Cart = () => {
    useEffect(()=>{
      document.title = 'Cart - Praco';
    }, [])
  
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
