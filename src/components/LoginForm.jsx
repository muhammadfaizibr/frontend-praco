import React, { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import styles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { login as loginApi, clearRequestCache } from "utils/api/account";
import { useDispatch } from "react-redux";
import { login } from "utils/store";

const InputField = ({ label, name, type, icon, value, onChange, error, disabled }) => (
  <div className={styles.inputGroup}>
    <label className="dark l2" htmlFor={name}>
      {label}
    </label>
    <div className={styles.inputWrapper}>
      <span className={styles.inputIcon} aria-hidden="true">
        {icon}
      </span>
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
        required
      />
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
};

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validateForm = useCallback(() => {
    const newErrors = {};
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.email = "Invalid email format";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setApiError("");
      setErrors({});

      if (!validateForm()) return;

      setIsLoading(true);
      const abortController = new AbortController();
      try {
        const response = await loginApi(
          { email: formData.email.trim(), password: formData.password.trim() },
          { signal: abortController.signal }
        );

        if (!response?.token?.access || !response?.token?.refresh) {
          throw new Error("Invalid token response from server");
        }

        localStorage.setItem("accessToken", response.token.access);
        localStorage.setItem("refreshToken", response.token.refresh);
        dispatch(login());
        setFormData({ email: "", password: "" });
        navigate("/", { replace: true });
      } catch (error) {
        if (error.name !== "AbortError") {
          setApiError(error.message || "Login failed. Please check your credentials.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, navigate, dispatch]
  );

  useEffect(() => {
    const abortController = new AbortController();
    return () => {
      abortController.abort();
      clearRequestCache();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formInputs = [
    {
      label: "Email Address",
      name: "email",
      type: "email",
      icon: <Mail size={20} />,
      value: formData.email,
      onChange: handleInputChange,
      error: errors.email,
      disabled: isLoading,
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      icon: <Lock size={20} />,
      value: formData.password,
      onChange: handleInputChange,
      error: errors.password,
      disabled: isLoading,
    },
  ];

  return (
    <div className={styles.formWrapper}>
      <form
        className={styles.container}
        onSubmit={handleLogin}
        aria-labelledby="login-title"
        noValidate
      >
        <h4 id="login-title" className="h4--dark">
          Login
        </h4>

        {apiError && (
          <div className={styles.errorMessage} role="alert">
            {apiError}
          </div>
        )}

        {formInputs.map((input) => (
          <InputField key={input.name} {...input} />
        ))}

        <Link
          to="/forgot-password"
          className="clr-black b4"
          aria-label="Recover your password"
        >
          Forgot Password?
        </Link>

        <button
          className={`primary-btn btn-giant full-width text-giant ${isLoading ? styles.loading : ""}`}
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {};

export default memo(LoginForm);
