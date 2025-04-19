import React, { useState } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

const ChangePasswordForm = () => {
  const [currentPasswordValue, setCurrentPasswordValue] = useState("");
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");

  const formInputs = [
    {
      label: "Current Password",
      name: "current-password",
      type: "current-password",
      icon: <Lock />,
      value: currentPasswordValue,
      onchange: (e) => {
        setCurrentPasswordValue(e.target.value);
      },
    },

    {
      label: "New Password",
      name: "new-password",
      type: "new-password",
      icon: <Lock />,
      value: newPasswordValue,
      onchange: (e) => {
        setNewPasswordValue(e.target.value);
      },
    },

    {
      label: "Confirm Password",
      name: "confirm-password",
      type: "confirm-password",
      icon: <Lock />,
      value: confirmPasswordValue,
      onchange: (e) => {
        setConfirmPasswordValue(e.target.value);
      },
    },
  ];

  const handleChangePassword = () => {};

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

      <Link to="/shop" className="clr-black b4">
        Back to Shop
      </Link>
      <button
        className="primary-btn large-btn full-width text-large"
        onClick={handleChangePassword}
      >
        Update Password
      </button>
    </form>
  );
};

export default ChangePasswordForm;
