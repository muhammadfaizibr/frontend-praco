import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "assets/css/FormStyles.module.css";
import { Link } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { authenticateEmail, resetPassword, clearRequestCache } from "utils/api/account";
import { useNavigate } from "react-router-dom";

const InputField = ({ label, name, type, icon, value, onChange, error, disabled, button }) => (
  <div className={styles.inputGroup}>
    <label className="dark l2" htmlFor={name}>
      {label}
    </label>
    <div className={styles.inputWrapper}>
      <span className={styles.inputIcon}>{icon}</span>
      <input
        className={`b2 ${error ? styles.inputError : ""}`}
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {button}
    </div>
    {error && (
      <span id={`${name}-error`} className={styles.errorText} role="alert">
        {error}
      </span>
    )}
  </div>
);

InputField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  button: PropTypes.node,
};

const ForgetPasswordForm = () => {
  const [emailValue, setEmailValue] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");
  const [confirmNewPasswordValue, setConfirmNewPasswordValue] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  const generateOtp = useCallback(() => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }, []);

  const validateEmail = useCallback(() => {
    const newErrors = {};
    if (!emailValue) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailValue)) newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [emailValue]);

  const validateOtp = useCallback(() => {
    const newErrors = {};
    if (!otpValue) newErrors.otp = "OTP is required";
    else if (!/^\d{4}$/.test(otpValue)) newErrors.otp = "OTP must be a 4-digit number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [otpValue]);

  const validatePasswords = useCallback(() => {
    const newErrors = {};
    if (!newPasswordValue) newErrors["new-password"] = "New password is required";
    else if (newPasswordValue.length < 8) newErrors["new-password"] = "Password must be at least 8 characters";
    if (!confirmNewPasswordValue) newErrors["confirm-new-password"] = "Confirm password is required";
    else if (confirmNewPasswordValue !== newPasswordValue) newErrors["confirm-new-password"] = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [newPasswordValue, confirmNewPasswordValue]);

  const handleSendOtp = useCallback(async () => {
    setApiError("");
    setSuccessMessage("");
    if (!validateEmail()) return;

    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setIsVerifying(true);
    const abortController = new AbortController();
    try {
      const response = await authenticateEmail(
        { email: emailValue, code: newOtp, authentication_type: "forgot_password" },
        { signal: abortController.signal }
      );
      if (!response.exists) {
        setApiError("No account found with this email address.");
      } else if (response.success && response.authentication_type === "forgot_password") {
        setShowOtpInput(true);
      } else {
        setApiError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setApiError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [emailValue, validateEmail, generateOtp]);

  const handleVerifyOtp = useCallback(async () => {
    setApiError("");
    setSuccessMessage("");
    if (!validateOtp()) return;

    if (otpValue !== generatedOtp) {
      setApiError("Invalid OTP. Please try again.");
      return;
    }

    setIsVerifying(true);
    const abortController = new AbortController();
    try {
      const response = await authenticateEmail(
        { email: emailValue, code: otpValue, authentication_type: "forgot_password" },
        { signal: abortController.signal }
      );
      if (!response.exists) {
        setApiError("No account found with this email address.");
      } else if (response.success && response.authentication_type === "forgot_password") {
        setIsEmailVerified(true);
        setShowOtpInput(false);
        setOtpValue("");
        setGeneratedOtp(null);
        setErrors((prev) => ({ ...prev, email: "", otp: "" }));
      } else {
        setApiError(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setApiError(error.message || "OTP verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [emailValue, otpValue, generatedOtp, validateOtp]);

  const handleResetPassword = useCallback(
    async (e) => {
      e.preventDefault();
      setApiError("");
      setSuccessMessage("");
      setErrors({});

      if (!validatePasswords()) return;

      setIsLoading(true);
      const abortController = new AbortController();
      try {
        const response = await resetPassword(
          {
            email: emailValue,
            new_password: newPasswordValue,
            confirm_new_password: confirmNewPasswordValue,
          },
          { signal: abortController.signal }
        );

        if (!response.errors) {
          setSuccessMessage("Password reset successfully!");
          setEmailValue("");
          setNewPasswordValue("");
          setConfirmNewPasswordValue("");
          setIsEmailVerified(false);
          setShowOtpInput(false);
          setOtpValue("");
          setGeneratedOtp(null);
          setErrors({});
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setApiError(response.message || "Password reset failed. Please try again.");
        }
      } catch (error) {
        setApiError(error.message || "Password reset failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [emailValue, newPasswordValue, confirmNewPasswordValue, validatePasswords, navigate]
  );

  useEffect(() => {
    const abortController = new AbortController();
    return () => {
      abortController.abort();
      clearRequestCache();
    };
  }, []);

  const formInputs = [
    {
      label: "Email Address",
      name: "email",
      type: "email",
      icon: <Mail aria-hidden="true" />,
      value: emailValue,
      onChange: (e) => {
        setEmailValue(e.target.value);
        setShowOtpInput(false);
        setOtpValue("");
        setGeneratedOtp(null);
        setIsEmailVerified(false);
        setNewPasswordValue("");
        setConfirmNewPasswordValue("");
        setSuccessMessage("");
      },
      error: errors.email,
      disabled: isLoading || isVerifying || isEmailVerified,
      button: !showOtpInput && !isEmailVerified && (
        <button
          type="button"
          className={`secondary-btn btn-medium ${isVerifying ? styles.loading : ""}`}
          onClick={handleSendOtp}
          disabled={isVerifying || isLoading}
          aria-label="Send OTP"
        >
          {isVerifying ? "Processing..." : "Send OTP"}
        </button>
      ),
    },
    ...(showOtpInput
      ? [
          {
            label: "Enter OTP",
            name: "otp",
            type: "text",
            icon: <Lock aria-hidden="true" />,
            value: otpValue,
            onChange: (e) => setOtpValue(e.target.value),
            error: errors.otp,
            disabled: isLoading || isVerifying,
            button: (
              <button
                type="button"
                className={`secondary-btn btn-medium ${isVerifying ? styles.loading : ""}`}
                onClick={handleVerifyOtp}
                disabled={isVerifying || isLoading}
                aria-label="Verify OTP"
              >
                {isVerifying ? "Verifying..." : "Verify OTP"}
              </button>
            ),
          },
        ]
      : []),
    ...(isEmailVerified
      ? [
          {
            label: "New Password",
            name: "new-password",
            type: "password",
            icon: <Lock aria-hidden="true" />,
            value: newPasswordValue,
            onChange: (e) => setNewPasswordValue(e.target.value),
            error: errors["new-password"],
            disabled: isLoading,
          },
          {
            label: "Confirm Password",
            name: "confirm-new-password",
            type: "password",
            icon: <Lock aria-hidden="true" />,
            value: confirmNewPasswordValue,
            onChange: (e) => setConfirmNewPasswordValue(e.target.value),
            error: errors["confirm-new-password"],
            disabled: isLoading,
          },
        ]
      : []),
  ];

  return (
    <div className={styles.formWrapper}>
      <form
        className={styles.container}
        onSubmit={handleResetPassword}
        aria-labelledby="forget-password-title"
        noValidate
      >
        <h4 id="forget-password-title" className="h4--dark">
          Forget Password
        </h4>

        {apiError && (
          <div className={styles.errorMessage} role="alert">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className={styles.successMessage} role="alert">
            {successMessage}
          </div>
        )}

        {formInputs.map((input) => (
          <InputField key={input.name} {...input} />
        ))}

        <Link to="/login" className="clr-black b4" aria-label="Back to Login">
          Back to Login
        </Link>

        <button
          className={`primary-btn btn-giant full-width text-giant ${isLoading ? styles.loading : ""}`}
          type="submit"
          disabled={isLoading || !isEmailVerified}
          aria-busy={isLoading}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ForgetPasswordForm;