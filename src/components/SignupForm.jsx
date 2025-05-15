import React, { useState, useEffect, useCallback, memo } from "react";
import PropTypes from "prop-types";
import styles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, User } from "lucide-react";
import { signup, authenticateEmail, clearRequestCache } from "utils/api/account";
import { useDispatch } from "react-redux";
import { login } from "utils/store";

const InputField = ({ label, name, type, icon, value, onChange, error, disabled, button, extra }) => (
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
    {extra}
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
  extra: PropTypes.node,
};

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [receiveMarketing, setReceiveMarketing] = useState(false);
  const [noCompanyName, setNoCompanyName] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const generateOtp = useCallback(() => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.email = "Invalid email format";
    if (!isEmailVerified) newErrors.email = "Email verification required";
    if (!firstName.trim()) newErrors["first-name"] = "First name is required";
    if (!lastName.trim()) newErrors["last-name"] = "Last name is required";
    if (!noCompanyName && !companyName.trim()) newErrors["company-name"] = "Company name is required";
    if (!password) newErrors.password = "Password is required";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, firstName, lastName, companyName, password, isEmailVerified, noCompanyName]);

  const validateEmail = useCallback(() => {
    const newErrors = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email]);

  const validateOtp = useCallback(() => {
    const newErrors = {};
    if (!otp) newErrors.otp = "OTP is required";
    else if (!/^\d{4}$/.test(otp)) newErrors.otp = "OTP must be a 4-digit number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [otp]);

  const handleVerifyEmail = useCallback(async () => {
    setApiError("");
    if (!validateEmail()) return;

    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setIsVerifying(true);
    const abortController = new AbortController();
    try {
      const response = await authenticateEmail(
        { email: email.trim(), code: newOtp, authentication_type: "signup" },
        { signal: abortController.signal }
      );
      if (response.exists) {
        setApiError("An account already exists with this email.");
      } else if (response.success && response.authentication_type === "signup") {
        setShowOtpInput(true);
      } else {
        setApiError(response.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setApiError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }, [email, validateEmail, generateOtp]);

  const handleVerifyOtp = useCallback(async () => {
    setApiError("");
    if (!validateOtp()) return;

    if (otp !== generatedOtp) {
      setApiError("Invalid OTP. Please try again.");
      return;
    }

    setIsVerifying(true);
    const abortController = new AbortController();
    try {
      const response = await authenticateEmail(
        { email: email.trim(), code: otp, authentication_type: "signup" },
        { signal: abortController.signal }
      );
      if (response.exists) {
        setApiError("An account already exists with this email.");
      } else if (response.success && response.authentication_type === "signup") {
        setIsEmailVerified(true);
        setShowOtpInput(false);
        setOtp("");
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
  }, [email, otp, generatedOtp, validateOtp]);

  const handleSignup = useCallback(
    async (e) => {
      e.preventDefault();
      setApiError("");
      setErrors({});

      if (!validateForm()) return;

      setIsLoading(true);
      const abortController = new AbortController();
      try {
        const payload = {
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password: password.trim(),
          receive_marketing: receiveMarketing,
        };
        if (!noCompanyName) {
          payload.company_name = companyName.trim();
        }

        const response = await signup(payload, { signal: abortController.signal });

        if (!response?.token?.access || !response?.token?.refresh) {
          throw new Error("Invalid token response from server");
        }

        localStorage.setItem("accessToken", response.token.access);
        localStorage.setItem("refreshToken", response.token.refresh);
        dispatch(login());
        setEmail("");
        setFirstName("");
        setLastName("");
        setCompanyName("");
        setPassword("");
        setReceiveMarketing(false);
        setNoCompanyName(false);
        setIsEmailVerified(false);
        setShowOtpInput(false);
        setOtp("");
        setGeneratedOtp(null);
        navigate("/", { replace: true });
      } catch (error) {
        setApiError(error.message || "Signup failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      email,
      firstName,
      lastName,
      companyName,
      password,
      receiveMarketing,
      noCompanyName,
      isEmailVerified,
      validateForm,
      navigate,
      dispatch,
    ]
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
      value: email,
      onChange: (e) => {
        setEmail(e.target.value);
        setIsEmailVerified(false);
        setShowOtpInput(false);
        setOtp("");
        setGeneratedOtp(null);
      },
      error: errors.email,
      disabled: isLoading || isVerifying || isEmailVerified,
      button: !isEmailVerified && !showOtpInput && (
        <button
          type="button"
          className={`secondary-btn btn-medium ${isVerifying ? styles.loading : ""}`}
          onClick={handleVerifyEmail}
          disabled={isVerifying || isLoading}
          aria-label="Verify Email Address"
        >
          {isVerifying ? "Processing..." : "Verify Email"}
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
            value: otp,
            onChange: (e) => setOtp(e.target.value),
            error: errors.otp,
            disabled: isLoading || isVerifying,
            button: (
              <button
                type="button"
                className={`btn--secondary btn--medium ${isVerifying ? styles.loading : ""}`}
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
    {
      label: "First Name",
      name: "first-name",
      type: "text",
      icon: <User aria-hidden="true" />,
      value: firstName,
      onChange: (e) => setFirstName(e.target.value),
      error: errors["first-name"],
      disabled: isLoading,
    },
    {
      label: "Last Name",
      name: "last-name",
      type: "text",
      icon: <User aria-hidden="true" />,
      value: lastName,
      onChange: (e) => setLastName(e.target.value),
      error: errors["last-name"],
      disabled: isLoading,
    },
    ...(noCompanyName
      ? []
      : [
          {
            label: "Company Name",
            name: "company-name",
            type: "text",
            icon: <Building2 aria-hidden="true" />,
            value: companyName,
            onChange: (e) => setCompanyName(e.target.value),
            error: errors["company-name"],
            disabled: isLoading,
            extra: (
              <div className={styles.checkBoxInput}>
                <input
                  type="checkbox"
                  name="no-company-name"
                  id="no-company-name"
                  checked={noCompanyName}
                  onChange={(e) => setNoCompanyName(e.target.checked)}
                  disabled={isLoading}
                  className="input--checkbox"
                  aria-label="No company name"
                />
                <label className="c3" htmlFor="no-company-name">
                  I don’t have a company name
                </label>
              </div>
            ),
          },
        ]),
    {
      label: "Password",
      name: "password",
      type: "password",
      icon: <Lock aria-hidden="true" />,
      value: password,
      onChange: (e) => setPassword(e.target.value),
      error: errors.password,
      disabled: isLoading,
    },
  ];

  return (
    <div className={styles.formWrapper}>
      <form
        className={styles.container}
        onSubmit={handleSignup}
        aria-labelledby="signup-title"
        noValidate
      >
        <h4 id="signup-title" className="h4--dark">
          Signup
        </h4>

        {apiError && (
          <div className={styles.errorMessage} role="alert">
            {apiError}
          </div>
        )}

        {formInputs.map((input) => (
          <InputField key={input.name} {...input} />
        ))}

        {!formInputs.some((input) => input.name === "company-name") && (
          <div className={styles.inputGroup}>
            <div className={styles.checkBoxInput}>
              <input
                type="checkbox"
                name="no-company-name"
                id="no-company-name"
                checked={noCompanyName}
                onChange={(e) => setNoCompanyName(e.target.checked)}
                disabled={isLoading}
                className="input--checkbox"
                aria-label="No company name"
              />
              <label className="c3" htmlFor="no-company-name">
                I don’t have a company name
              </label>
            </div>
          </div>
        )}

        <div className={styles.checkBoxInput}>
          <input
            type="checkbox"
            name="receive-marketing"
            id="receive-marketing"
            checked={receiveMarketing}
            onChange={(e) => setReceiveMarketing(e.target.checked)}
            disabled={isLoading}
            className="input--checkbox"
            aria-label="Opt-in to receive marketing communications"
          />
          <label className="c3" htmlFor="receive-marketing">
            Opt-in to receive marketing communications
          </label>
        </div>

        <Link
          to="/login"
          className="clr-black b4"
          aria-label="Login to existing account"
        >
          Already have an account?
        </Link>

        <button
          className={`primary-btn btn-giant full-width text-giant ${isLoading ? styles.loading : ""}`}
          type="submit"
          disabled={isLoading || !isEmailVerified}
          aria-busy={isLoading}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

SignupForm.propTypes = {};

export default memo(SignupForm);