import React, { useState, useEffect } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { login, clearRequestCache } from "utils/api/account";

const LoginForm = () => {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

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
      label: "Password",
      name: "password",
      type: "password",
      icon: <Lock />,
      value: passwordValue,
      onchange: (e) => setPasswordValue(e.target.value),
    },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!emailValue) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailValue)) newErrors.email = "Invalid email format";
    if (!passwordValue) newErrors.password = "Password is required";
    else if (passwordValue.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login(
        { email: emailValue, password: passwordValue },
        { signal: abortController.signal }
      );

      localStorage.setItem("authToken", response.token);

      setEmailValue("");
      setPasswordValue("");
      setErrors({});

      navigate("/dashboard");
    } catch (error) {
      setApiError(error.message || "Login failed. Please check your credentials.");
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
      <form className={FormStyles.container} onSubmit={handleLogin}>
        <h4 className="dark">Login</h4>

        {apiError && (
          <div className={FormStyles.errorMessage}>
            {apiError}
          </div>
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

        <Link to="/forget-password" className="clr-black b4">
          Forget Password?
        </Link>

        <button
          className={`primary-btn large-btn full-width text-large ${isLoading ? FormStyles.loading : ""}`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;