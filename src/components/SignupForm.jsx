import React, { useState } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link } from "react-router-dom";
import { Building2, Lock, Mail, User } from "lucide-react";

const LoginForm = () => {
  const [emailValue, setEmailValue] = useState("");
  const [firstNameValue, setFirstNameValue] = useState("");
  const [lastNameValue, setLastNameValue] = useState("");
  const [companyNameValue, setCompanyNameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [haveCompanyName, setHaveCompanyName] = useState("");
  const [interestedInMarketingCommunications, setInterestedInMarketingCommunications] = useState("");

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
      label: "First Name",
      name: "first-name",
      type: "text",
      icon: <User />,
      value: firstNameValue,
      onchange: (e) => {
        setFirstNameValue(e.target.value);
      },

      
    },

    {
      label: "Last Name",
      name: "last-name",
      type: "text",
      icon: <User />,
      value: lastNameValue,
      onchange: (e) => {
        setLastNameValue(e.target.value);
      },

      
    },

    {
      label: "Company Name",
      name: "company-name",
      type: "text",
      icon: <Building2 />,
      value: companyNameValue,
      onchange: (e) => {
        setCompanyNameValue(e.target.value);
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
      <h4 className="dark">Signup</h4>

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
      <div className={FormStyles.checkBoxInput}>
        <input type="checkbox" name="marketig-communications" id="marketig-communications"/>
        <label className="c3" htmlFor="marketig-communications">I would like to receive marketing communications.</label>
      </div>

      <Link to="/forget-password" className="clr-black b4">Already have an account?</Link>
      <button className="primary-btn large-btn full-width-btn text-large" onClick={handleLogin}>
        Login
      </button>
    </form>
  );
};

export default LoginForm;
