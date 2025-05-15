import React, {useEffect} from "react";
import LoginForm from "components/LoginForm";
import LoginSideContainer from 'components/LoginSideContainer'
import FormsPageStyles from "assets/css/FormsPageStyles.module.css"

const Login = () => {
    useEffect(()=>{
      document.title = 'Login - Praco';
    }, [])
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
