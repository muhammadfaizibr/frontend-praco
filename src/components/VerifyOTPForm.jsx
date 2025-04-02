import React, { useState } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link } from "react-router-dom";
import { Pin } from "lucide-react";

const VerifyOTPForm = () => {
  const [otpValue, setOtpValue] = useState("");
  const formInputs = [
    {
      label: "OTP",
      name: "otp",
      type: "text",
      icon: <Pin />,
      value: otpValue,
      onchange: (e) => {
        setOtpValue(e.target.value);
      },

      
    },
  ];

  const handleVerifyOTP = () => {

  }

  return (
    <form className={FormStyles.container}>
      <h4 className="dark">Verify One-Time Password</h4>

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
                maxLength={6}
              />
            </div>
          </div>
        );
      })}

      <Link to="/login" className="clr-black b4">Back to Login</Link>
      <button className="primary-btn large-btn full-width-btn text-large" onClick={handleVerifyOTP}>
        Verify
      </button>
    </form>
  );
};

export default VerifyOTPForm;
