import React, { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { updatePassword, clearRequestCache } from "utils/api/account";
import { useDispatch } from "react-redux";
import { logout } from "utils/store";

const ChangePasswordForm = () => {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const abortController = new AbortController();

  // Check for accessToken on mount
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/login", { replace: true, state: { from: "change-password" } });
    }
  }, [navigate]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent) newErrors["current-password"] = "Current password is required";
    if (!trimmedNew) newErrors["new-password"] = "New password is required";
    else if (trimmedNew.length < 6) newErrors["new-password"] = "New password must be at least 6 characters";
    if (!trimmedConfirm) newErrors["confirm-password"] = "Confirm password is required";
    else if (trimmedNew !== trimmedConfirm) newErrors["confirm-password"] = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentPassword, newPassword, confirmPassword]);

  const handleChangePassword = useCallback(
    async (e) => {
      e.preventDefault();
      setApiError("");
      setSuccessMessage("");
      setErrors({});

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        const response = await updatePassword(
          {
            current_password: currentPassword.trim(),
            new_password: newPassword.trim(),
            confirm_new_password: confirmPassword.trim(),
          },
          { signal: abortController.signal }
        );

        setSuccessMessage(response.message || "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        // Redirect after showing success message
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      } catch (error) {
        if (error.status === 401) {
          dispatch(logout());
          navigate("/login", { replace: true, state: { from: "change-password" } });
          setApiError("Session expired. Please log in again.");
        } else if (error.fieldErrors) {
          const newErrors = {};
          Object.entries(error.fieldErrors).forEach(([key, value]) => {
            newErrors[key.replace("_", "-")] = Array.isArray(value) ? value.join(" ") : value;
          });
          setErrors(newErrors);
          if (error.message && error.message !== "An unexpected error occurred") {
            setApiError(error.message);
          }
        } else {
          setApiError(error.message || "Failed to update password. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, validateForm, navigate, dispatch]
  );

  useEffect(() => {
    return () => {
      abortController.abort();
      clearRequestCache();
    };
  }, []);

  const formInputs = [
    {
      label: "Current Password",
      name: "current-password",
      type: "password",
      icon: <Lock aria-hidden="true" />,
      value: currentPassword,
      onChange: (e) => setCurrentPassword(e.target.value),
      error: errors["current-password"],
    },
    {
      label: "New Password",
      name: "new-password",
      type: "password",
      icon: <Lock aria-hidden="true" />,
      value: newPassword,
      onChange: (e) => setNewPassword(e.target.value),
      error: errors["new-password"],
    },
    {
      label: "Confirm Password",
      name: "confirm-password",
      type: "password",
      icon: <Lock aria-hidden="true" />,
      value: confirmPassword,
      onChange: (e) => setConfirmPassword(e.target.value),
      error: errors["confirm-password"],
    },
  ];

  return (
    <div className={FormStyles.formWrapper}>
      <form
        className={FormStyles.container}
        onSubmit={handleChangePassword}
        aria-labelledby="change-password-title"
        noValidate
      >
        <h4 id="change-password-title" className="dark">
          Change Password
        </h4>

        {apiError && (
          <div className={FormStyles.errorMessage} role="alert">
            {apiError}
          </div>
        )}
        {successMessage && (
          <div className={FormStyles.successMessage} role="alert">
            {successMessage}
          </div>
        )}

        {formInputs.map((input) => (
          <div className={FormStyles.inputGroup} key={input.name}>
            <label className="dark l2" htmlFor={input.name}>
              {input.label}
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}>{input.icon}</span>
              <input
                className={`b2 ${input.error ? FormStyles.inputError : ""}`}
                type={input.type}
                name={input.name}
                id={input.name}
                value={input.value}
                onChange={input.onChange}
                disabled={isLoading}
                aria-invalid={!!input.error}
                aria-describedby={input.error ? `${input.name}-error` : undefined}
              />
            </div>
            {input.error && (
              <span
                id={`${input.name}-error`}
                className={FormStyles.errorText}
                role="alert"
              >
                {input.error}
              </span>
            )}
          </div>
        ))}

        <Link
          to="/shop"
          className="clr-black b4"
          aria-label="Return to Shop"
        >
          Back to Shop
        </Link>

        <button
          className={`primary-btn large-btn full-width text-large ${
            isLoading ? FormStyles.loading : ""
          }`}
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
};

ChangePasswordForm.propTypes = {};

export default memo(ChangePasswordForm);