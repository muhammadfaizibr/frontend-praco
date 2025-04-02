import React, { useState } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link } from "react-router-dom";
import { Lock, Mail, NotebookText, PenLine, User } from "lucide-react";

const LoginForm = () => {
  const [emailValue, setEmailValue] = useState("");
  const [fullNameValue, setFullNameValue] = useState("");
  const [subjectValue, setSubjectValue] = useState("");
  const [messageValue, setMesssageValue] = useState("");
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
      label: "Full Name",
      name: "full-name",
      type: "text",
      icon: <User />,
      value: fullNameValue,
      onchange: (e) => {
        setFullNameValue(e.target.value);
      },
    },

    {
      label: "Subject",
      name: "subject",
      type: "text",
      icon: <NotebookText />,
      value: subjectValue,
      onchange: (e) => {
        setSubjectValue(e.target.value);
      },
    },
  ];

  const handleLogin = () => {};

  return (
    <form className={FormStyles.container}>
      <h4 className="dark">
        Send your <span className="clr-orange">Query</span>
      </h4>

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

      <div className={FormStyles.inputGroup}>
        <label className="dark l2" htmlFor={"message"}>
          Message{" "}
        </label>
        <div className={FormStyles.inputWrapper} >
          <span className={FormStyles.inputIcon} style={{height: 'auto', paddingTop: 'clamp(1.2rem, 1.2vw, 1.2rem)'}}>
            <PenLine />
          </span>
          <textarea
            className="b2"
            name="message"
            id="message"
            value={messageValue}
            onChange={(e) => setMesssageValue(e.target.value)}
            rows={6}
          />
        </div>
      </div>

      <button
        className="primary-btn large-btn full-width-btn text-large"
        onClick={handleLogin}
      >
        Send
      </button>
    </form>
  );
};

export default LoginForm;
