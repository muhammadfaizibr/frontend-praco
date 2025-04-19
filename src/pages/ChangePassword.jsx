import React from "react";
import ChangePasswordForm from "components/ChangePasswordForm";
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"

const ChangePassword = () => {
  return (
    <div className="centered-layout-wrapper full-width-flex-col layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout full-width-flex-col layout-spacing">
      <div className={FormsPageStyles.contentWrapper}>
      <ChangePasswordForm />
      </div>
      </div>
    </div>
  );
};

export default ChangePassword;
