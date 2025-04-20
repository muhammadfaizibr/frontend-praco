import React, { useState, useEffect } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Mail, NotebookText, PenLine, User } from "lucide-react";
import { submitContactQuery } from "utils/api/administration";

const ContactForm = () => {
  const [emailValue, setEmailValue] = useState("");
  const [fullNameValue, setFullNameValue] = useState("");
  const [subjectValue, setSubjectValue] = useState("");
  const [messageValue, setMessageValue] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortController = new AbortController();

  const formInputs = [
    {
      label: "Email Address",
      name: "email",
      type: "email",
      icon: <Mail />,
      value: emailValue,
      onchange: (e) => setEmailValue(e.target.value),
    },
    {
      label: "Full Name",
      name: "full-name",
      type: "text",
      icon: <User />,
      value: fullNameValue,
      onchange: (e) => setFullNameValue(e.target.value),
    },
    {
      label: "Subject",
      name: "subject",
      type: "text",
      icon: <NotebookText />,
      value: subjectValue,
      onchange: (e) => setSubjectValue(e.target.value),
    },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!emailValue) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailValue))
      newErrors.email = "Invalid email format";
    if (!fullNameValue) newErrors["full-name"] = "Full name is required";
    if (!subjectValue) newErrors.subject = "Subject is required";
    if (!messageValue) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        email: emailValue,
        full_name: fullNameValue,
        subject: subjectValue,
        message: messageValue,
      };
      console.log("Contact Query Payload:", payload); // Debugging
      const response = await submitContactQuery(payload, {
        signal: abortController.signal,
      });

      if (!response.error) {
        setSuccessMessage("Query submitted successfully!");
        setEmailValue("");
        setFullNameValue("");
        setSubjectValue("");
        setMessageValue("");
        setErrors({});
      } else {
        setApiError(response.message || "Failed to submit query. Please try again.");
      }
    } catch (error) {
      console.error("Contact Query Error:", error); // Debugging
      if (error.fieldErrors) {
        setErrors((prev) => ({
          ...prev,
          ...error.fieldErrors,
          email: error.fieldErrors.email || prev.email,
          "full-name": error.fieldErrors.full_name || prev["full-name"],
          subject: error.fieldErrors.subject || prev.subject,
          message: error.fieldErrors.message || prev.message,
        }));
      }
      setApiError(error.message || "Failed to submit query. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <div className={FormStyles.formWrapper}>
      <form className={FormStyles.container} onSubmit={handleSubmit}>
        <h4 className="dark">
          Send your <span className="clr-orange">Query</span>
        </h4>

        {apiError && <div className={FormStyles.errorMessage}>{apiError}</div>}
        {successMessage && (
          <div className={FormStyles.successMessage}>{successMessage}</div>
        )}

        {formInputs.map((inputElement) => (
          <div className={FormStyles.inputGroup} key={inputElement.name}>
            <label className="dark l2" htmlFor={inputElement.name}>
              {inputElement.label}
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}>{inputElement.icon}</span>
              <input
                className={`b2 ${errors[inputElement.name] ? FormStyles.inputError : ""}`}
                type={inputElement.type}
                name={inputElement.name}
                id={inputElement.name}
                value={inputElement.value}
                onChange={inputElement.onchange}
                disabled={isLoading}
              />
            </div>
            {errors[inputElement.name] && (
              <span className={FormStyles.errorText}>{errors[inputElement.name]}</span>
            )}
          </div>
        ))}

        <div className={FormStyles.inputGroup}>
          <label className="dark l2" htmlFor="message">
            Message
          </label>
          <div className={FormStyles.inputWrapper}>
            <span
              className={FormStyles.inputIcon}
              style={{ height: "auto", paddingTop: "var(--padding-xs)" }}
            >
              <PenLine />
            </span>
            <textarea 
              style={{width: '100%', paddingLeft: '40px'}}
              className={`b2 ${errors.message ? FormStyles.inputError : ""}`}
              name="message"
              id="message"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              rows={6}
              disabled={isLoading}
            />
          </div>
          {errors.message && (
            <span className={FormStyles.errorText}>{errors.message}</span>
          )}
        </div>

        <button
          className={`primary-btn large-btn full-width text-large ${
            isLoading ? FormStyles.loading : ""
          }`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;