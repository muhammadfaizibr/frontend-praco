import React, { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { login as loginApi, clearRequestCache } from "utils/api/account";
import { useDispatch } from "react-redux";
import { login } from "utils/store";

const LoginForm = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();
  const abortController = new AbortController();

  const validateForm = useCallback(() => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.email = "Invalid email format";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      setApiError("");
      setErrors({});

      if (!validateForm()) return;

      setIsLoading(true);
      try {
        const response = await loginApi(
          { email: email.trim(), password: password.trim() },
          { signal: abortController.signal }
        );

        if (!response?.token?.access || !response?.token?.refresh) {
          throw new Error("Invalid token response from server");
        }

        localStorage.setItem("accessToken", response.token.access);
        localStorage.setItem("refreshToken", response.token.refresh);
        dispatch(login());

        setEmail("");
        setPassword("");
        navigate("/", { replace: true });
      } catch (error) {
        setApiError(error.message || "Login failed. Please check your credentials.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, validateForm, navigate, dispatch]
  );

  useEffect(() => {
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
      value: email,
      onChange: (e) => setEmail(e.target.value),
      error: errors.email,
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      icon: <Lock aria-hidden="true" />,
      value: password,
      onChange: (e) => setPassword(e.target.value),
      error: errors.password,
    },
  ];

  return (
    <div className={FormStyles.formWrapper}>
      <form
        className={FormStyles.container}
        onSubmit={handleLogin}
        aria-labelledby="login-title"
        noValidate
      >
        <h4 id="login-title" className="dark">
          Login
        </h4>

        {apiError && (
          <div className={FormStyles.errorMessage} role="alert">
            {apiError}
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
          to="/forget-password"
          className="clr-black b4"
          aria-label="Recover Password"
        >
          Forgot Password?
        </Link>

        <button
          className={`primary-btn large-btn full-width text-large ${
            isLoading ? FormStyles.loading : ""
          }`}
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