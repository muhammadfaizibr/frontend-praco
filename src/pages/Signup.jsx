import React from "react";
import SignupForm from "components/SignupForm";
import SignupSideContainer from 'components/SignupSideContainer'
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"

const Signup = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing">
        <div className={FormsPageStyles.contentWrapper}>
            <SignupForm />
            <SignupSideContainer />
        </div>
      </div>
    </div>
  );
};

export default Signup;
