import React from "react";
import ForgetPasswordForm from "components/ForgetPasswordForm";
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"



const ForgetPassword = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing">
      <div className={FormsPageStyles.contentWrapper}>

            <ForgetPasswordForm />
      </div>
    </div>
    </div>
  );
};

export default ForgetPassword;
