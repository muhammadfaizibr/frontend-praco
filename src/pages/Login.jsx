import React from "react";
import LoginForm from "components/LoginForm";
import LoginSideContainer from 'components/LoginSideContainer'
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"

const Login = () => {
  return (
    <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
      <div className="centered-layout page-layout layout-spacing full-width-flex-col">
        <div className={FormsPageStyles.contentWrapper}>
            <LoginForm />
            <LoginSideContainer />
        </div>
      </div>
    </div>
  );
};

export default Login;
