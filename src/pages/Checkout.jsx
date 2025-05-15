import React, {useEffect} from "react";
import CheckoutForm from "components/CheckoutForm";
import CheckoutSideContainer from 'components/CheckoutSideContainer'
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"

const Checkout = () => {
    useEffect(()=>{
      document.title = 'Checkout - Praco';
    }, [])
  return (
    <div className="centered-layout-wrapper full-width-flex-col layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout full-width-flex-col layout-spacing">
        <div className={FormsPageStyles.contentWrapper}>
            <CheckoutForm />
            <CheckoutSideContainer />
        </div>
      </div>
    </div>
  );
};

export default Checkout;
