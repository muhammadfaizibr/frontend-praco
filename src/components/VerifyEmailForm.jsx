import React, { useState } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const VerifyEmailForm = () => {
  const [emailValue, setEmailValue] = useState("");
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
  ];

  const handleVerifyEmail = () => {

  }

  return (
    <form className={FormStyles.container}>
      <h4 className="dark">Forget Password</h4>

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

      <Link to="/login" className="clr-black b4">Back to Login</Link>
      <button className="primary-btn large-btn full-width text-large" onClick={handleVerifyEmail}>
        Send One-Time Password
      </button>
    </form>
  );
};

export default VerifyEmailForm;
