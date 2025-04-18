import React from "react";
import VerifyEmailForm from "components/VerifyEmailForm";
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"

const VerifyEmail = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
      <div className={FormsPageStyles.contentWrapper}>

            <VerifyEmailForm />
      </div>
    </div>
    </div>

  );
};

export default VerifyEmail;


