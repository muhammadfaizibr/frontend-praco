import React, {useEffect} from "react";
import SignupForm from "components/SignupForm";
import SignupSideContainer from 'components/SignupSideContainer'
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"

const Signup = () => {
        useEffect(()=>{
          document.title = 'Create an Account - Praco';
        }, [])
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
        <div className={FormsPageStyles.contentWrapper}>
            <SignupForm />
            <SignupSideContainer />
        </div>
      </div>
    </div>
  );
};

export default Signup;
