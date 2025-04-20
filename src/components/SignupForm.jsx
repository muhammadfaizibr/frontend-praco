import React, { useState, useEffect, useCallback, memo, useContext } from "react";
import PropTypes from "prop-types";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, User } from "lucide-react";
import { signup, authenticateEmail, clearRequestCache } from "utils/api/account";
import { AuthContext } from "utils/AuthContext";

const SignupForm = () => {
  const { setIsLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [interestedInMarketing, setInterestedInMarketing] = useState(false);
  const [noCompanyName, setNoCompanyName] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const abortController = new AbortController();

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
    else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
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
    try {
      const response = await authenticateEmail(
        { email: email.trim(), code: newOtp },
        { signal: abortController.signal }
      );
      if (response.exists) {
        setApiError("An account already exists with this email.");
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
  }, [email, validateEmail, generateOtp]);

  const handleVerifyOtp = useCallback(async () => {
    setApiError("");
    if (!validateOtp()) return;

    if (otp !== generatedOtp) {
      setApiError("Invalid OTP. Please try again.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await authenticateEmail(
        { email: email.trim(), code: otp },
        { signal: abortController.signal }
      );
      if (response.exists) {
        setApiError("An account already exists with this email.");
      } else if (response.success) {
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
      try {
        const payload = {
          email: email.trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          password: password.trim(),
          interested_in_marketing_communications: interestedInMarketing,
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
        setIsLoggedIn(true);

        setEmail("");
        setFirstName("");
        setLastName("");
        setCompanyName("");
        setPassword("");
        setInterestedInMarketing(false);
        setNoCompanyName(false);
        setIsEmailVerified(false);
        setShowOtpInput(false);
        setOtp("");
        setGeneratedOtp(null);

        navigate("/", { replace: true });
      } catch (error) {
        if (error.fieldErrors) {
          const newErrors = {};
          Object.entries(error.fieldErrors).forEach(([key, value]) => {
            newErrors[key.replace("_", "-")] = Array.isArray(value) ? value.join(" ") : value;
          });
          setErrors(newErrors);
        } else {
          setApiError(error.message || "Signup failed. Please try again.");
        }
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
      interestedInMarketing,
      noCompanyName,
      isEmailVerified,
      validateForm,
      navigate,
      setIsLoggedIn,
    ]
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
      onChange: (e) => {
        setEmail(e.target.value);
        setIsEmailVerified(false);
        setShowOtpInput(false);
        setOtp("");
        setGeneratedOtp(null);
      },
      error: errors.email,
      disabled: isLoading || isVerifying || isEmailVerified,
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
    <div className={FormStyles.formWrapper}>
      <form
        className={FormStyles.container}
        onSubmit={handleSignup}
        aria-labelledby="signup-title"
        noValidate
      >
        <h4 id="signup-title" className="dark">
          Signup
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
                disabled={input.disabled}
                aria-invalid={!!input.error}
                aria-describedby={input.error ? `${input.name}-error` : undefined}
              />
              {input.name === "email" && !isEmailVerified && !showOtpInput && (
                <button
                  type="button"
                  className={`secondary-btn medium-btn ${
                    isVerifying ? FormStyles.loading : ""
                  }`}
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || isLoading}
                  aria-label="Verify Email Address"
                >
                  {isVerifying ? "Processing..." : "Verify Email"}
                </button>
              )}
              {input.name === "otp" && (
                <button
                  type="button"
                  className={`secondary-btn medium-btn ${
                    isVerifying ? FormStyles.loading : ""
                  }`}
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || isLoading}
                  aria-label="Verify OTP"
                >
                  {isVerifying ? "Verifying..." : "Verify OTP"}
                </button>
              )}
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
            {input.name === "company-name" && (
              <div className={FormStyles.checkBoxInput}>
                <input
                  type="checkbox"
                  name="no-company-name"
                  id="no-company-name"
                  checked={noCompanyName}
                  onChange={(e) => setNoCompanyName(e.target.checked)}
                  disabled={isLoading}
                  aria-label="No company name"
                />
                <label className="c3" htmlFor="no-company-name">
                  I don’t have a company name
                </label>
              </div>
            )}
          </div>
        ))}

        {formInputs.every((input) => input.name !== "company-name") && (
          <div className={FormStyles.inputGroup}>
            <div className={FormStyles.checkBoxInput}>
              <input
                type="checkbox"
                name="no-company-name"
                id="no-company-name"
                checked={noCompanyName}
                onChange={(e) => setNoCompanyName(e.target.checked)}
                disabled={isLoading}
                aria-label="No company name"
              />
              <label className="c3" htmlFor="no-company-name">
                I don’t have a company name
              </label>
            </div>
          </div>
        )}

        <div className={FormStyles.checkBoxInput}>
          <input
            type="checkbox"
            name="marketing-communications"
            id="marketing-communications"
            checked={interestedInMarketing}
            onChange={(e) => setInterestedInMarketing(e.target.checked)}
            disabled={isLoading}
            aria-label="Opt-in to marketing communications"
          />
          <label className="c3" htmlFor="marketing-communications">
            I would like to receive marketing communications
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
          className={`primary-btn large-btn full-width text-large ${
            isLoading ? FormStyles.loading : ""
          }`}
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