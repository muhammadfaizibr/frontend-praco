import React, {useEffect} from "react";
import ForgetPasswordForm from "components/ForgetPasswordForm";
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"



const ForgetPassword = () => {
    useEffect(()=>{
      document.title = 'Forgot Password - Praco';
    }, [])
  return (
    <div className="centered-layout-wrapper full-width-flex-col layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout full-width-flex-col layout-spacing">
      <div className={FormsPageStyles.contentWrapper}>

            <ForgetPasswordForm />
      </div>
    </div>
    </div>
  );
};

export default ForgetPassword;
