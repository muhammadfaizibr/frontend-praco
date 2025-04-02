import React from "react";
import VerifyOTPForm from "components/VerifyOTPForm";
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"




const VerifyOtp = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing">
      <div className={FormsPageStyles.contentWrapper}>

            <VerifyOTPForm />
      </div>
      </div>

    </div>
  );
};

export default VerifyOtp;
