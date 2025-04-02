import React, { useState } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

const LoginForm = () => {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const formInputs = [
    {
      label: "Email Address",
      name: "email",
      type: "email",
      icon: <Mail />,
      value: emailValue,
      onchange: (e) => {
        setEmailValue(e.target.value);
      },

      
    },

    {
        label: "Password",
        name: "password",
        type: "password",
        icon: <Lock />,
        value: passwordValue,
        onchange: (e) => {
          setPasswordValue(e.target.value);
        },
  
        
      },
  ];

  const handleLogin = () => {

  }

  return (
    <form className={FormStyles.container}>
      <h4 className="dark">Login</h4>

      {formInputs.map((inputElement, index) => {
        return (
          <div className={FormStyles.inputGroup}>
            <label className="dark l2" htmlFor={inputElement.name}>
              {inputElement.label}
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}>{inputElement.icon}</span>
              <input
                className="b2"
                type={inputElement.type}
                name={inputElement.name}
                id={inputElement.name}
                value={inputElement.value}
                onChange={inputElement.onchange}
              />
            </div>
          </div>
        );
      })}

      <Link to="/forget-password" className="clr-black b4">Forget Password?</Link>
      <button className="primary-btn large-btn full-width-btn text-large" onClick={handleLogin}>
        Login
      </button>
    </form>
  );
};

export default LoginForm;
