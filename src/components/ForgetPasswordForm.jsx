import React, { useState, useEffect } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { authenticateEmail, resetPassword, clearRequestCache } from "utils/api/account";

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

  const abortController = new AbortController();

  const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  };

  const formInputs = [
    {
      label: "Email Address",
      name: "email",
      type: "email",
      icon: <Mail />,
      value: emailValue,
      onchange: (e) => {
        setEmailValue(e.target.value);
        setShowOtpInput(false);
        setOtpValue("");
        setGeneratedOtp(null);
        setIsEmailVerified(false);
        setNewPasswordValue("");
        setConfirmNewPasswordValue("");
        setSuccessMessage("");
      },
    },
    ...(showOtpInput
      ? [
          {
            label: "Enter OTP",
            name: "otp",
            type: "text",
            icon: <Lock />,
            value: otpValue,
            onchange: (e) => setOtpValue(e.target.value),
          },
        ]
      : []),
    ...(isEmailVerified
      ? [
          {
            label: "New Password",
            name: "new-password",
            type: "password",
            icon: <Lock />,
            value: newPasswordValue,
            onchange: (e) => setNewPasswordValue(e.target.value),
          },
          {
            label: "Confirm Password",
            name: "confirm-new-password",
            type: "password",
            icon: <Lock />,
            value: confirmNewPasswordValue,
            onchange: (e) => setConfirmNewPasswordValue(e.target.value),
          },
        ]
      : []),
  ];

  const validateEmail = () => {
    const newErrors = {};
    if (!emailValue) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailValue))
      newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};
    if (!otpValue) newErrors.otp = "OTP is required";
    else if (!/^\d{4}$/.test(otpValue))
      newErrors.otp = "OTP must be a 4-digit number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswords = () => {
    const newErrors = {};
    if (!newPasswordValue) newErrors["new-password"] = "New password is required";
    else if (newPasswordValue.length < 6)
      newErrors["new-password"] = "Password must be at least 6 characters";
    if (!confirmNewPasswordValue)
      newErrors["confirm-new-password"] = "Confirm password is required";
    else if (confirmNewPasswordValue !== newPasswordValue)
      newErrors["confirm-new-password"] = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async () => {
    setApiError("");
    setSuccessMessage("");
    if (!validateEmail()) return;

    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setIsVerifying(true);
    try {
      const response = await authenticateEmail(
        { email: emailValue, code: newOtp },
        { signal: abortController.signal }
      );
      if (!response.exists) {
        setApiError("No account found with this email address.");
      } else if (response.success) {
        setShowOtpInput(true);
      } else {
        setApiError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setApiError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    setApiError("");
    setSuccessMessage("");
    if (!validateOtp()) return;

    // Client-side OTP check
    if (otpValue !== generatedOtp) {
      setApiError("Invalid OTP. Please try again.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authenticateEmail(
        { email: emailValue, code: otpValue },
        { signal: abortController.signal }
      );
      if (!response.exists) {
        setApiError("No account found with this email address.");
      } else if (response.success) {
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
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    setErrors({});

    if (!validatePasswords()) return;

    setIsLoading(true);
    try {
      const payload = {
        email: emailValue,
        new_password: newPasswordValue,
        confirm_new_password: confirmNewPasswordValue,
      };
      console.log("Reset Password Payload:", payload); // Debugging
      const response = await resetPassword(payload, {
        signal: abortController.signal,
      });

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
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Redirect after 2 seconds
      } else {
        setApiError(response.message || "Password reset failed. Please try again.");
      }
    } catch (error) {
      console.error("Reset Password Error:", error); // Debugging
      if (error.fieldErrors) {
        setErrors((prev) => ({
          ...prev,
          ...error.fieldErrors,
          "new-password": error.fieldErrors.new_password || prev["new-password"],
          "confirm-new-password": error.fieldErrors.confirm_new_password || prev["confirm-new-password"],
        }));
      }
      setApiError(error.message || "Password reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      abortController.abort();
      clearRequestCache();
    };
  }, []);

  return (
    <div className={FormStyles.formWrapper}>
      <form className={FormStyles.container} onSubmit={handleResetPassword}>
        <h4 className="dark">Update Password</h4>

        {apiError && (
          <div className={FormStyles.errorMessage}>{apiError}</div>
        )}
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
                className={`b2 ${
                  errors[inputElement.name] ? FormStyles.inputError : ""
                }`}
                type={inputElement.name === "otp" ? "text" : inputElement.type}
                name={inputElement.name}
                id={inputElement.name}
                value={inputElement.value}
                onChange={inputElement.onchange}
                disabled={isLoading || isVerifying}
              />
              {inputElement.name === "email" && !showOtpInput && !isEmailVerified && (
                <button
                  type="button"
                  className={`secondary-btn medium-btn ${
                    isVerifying ? FormStyles.loading : ""
                  }`}
                  onClick={handleSendOtp}
                  disabled={isVerifying || isLoading}
                >
                  {isVerifying ? "Processing..." : "Send OTP"}
                </button>
              )}
              {inputElement.name === "otp" && (
                <button
                  type="button"
                  className={`secondary-btn medium-btn ${
                    isVerifying ? FormStyles.loading : ""
                  }`}
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || isLoading}
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
              )}
            </div>
            {errors[inputElement.name] && (
              <span className={FormStyles.errorText}>
                {errors[inputElement.name]}
              </span>
            )}
          </div>
        ))}

        <Link to="/login" className="clr-black b4">
          Back to Login
        </Link>

        <button
          className={`primary-btn large-btn full-width text-large ${
            isLoading ? FormStyles.loading : ""
          }`}
          type="submit"
          disabled={isLoading || !isEmailVerified}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

export default ForgetPasswordForm;