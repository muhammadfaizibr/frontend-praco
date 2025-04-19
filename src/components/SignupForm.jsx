import React, { useState, useEffect } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Building2, Lock, Mail, User } from "lucide-react";
import { signup, authenticateEmail, clearRequestCache } from "utils/api/account";

const SignupForm = () => {
  const [emailValue, setEmailValue] = useState("");
  const [firstNameValue, setFirstNameValue] = useState("");
  const [lastNameValue, setLastNameValue] = useState("");
  const [companyNameValue, setCompanyNameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [interestedInMarketingCommunications, setInterestedInMarketingCommunications] = useState(false);
  const [dontHaveCompanyName, setDontHaveCompanyName] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
        setIsEmailVerified(false);
        setShowOtpInput(false);
        setOtpValue("");
        setGeneratedOtp(null);
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
    {
      label: "First Name",
      name: "first-name",
      type: "text",
      icon: <User />,
      value: firstNameValue,
      onchange: (e) => setFirstNameValue(e.target.value),
    },
    {
      label: "Last Name",
      name: "last-name",
      type: "text",
      icon: <User />,
      value: lastNameValue,
      onchange: (e) => setLastNameValue(e.target.value),
    },
    ...(dontHaveCompanyName
      ? []
      : [
          {
            label: "Company Name",
            name: "company-name",
            type: "text",
            icon: <Building2 />,
            value: companyNameValue,
            onchange: (e) => setCompanyNameValue(e.target.value),
          },
        ]),
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
    else if (!/\S+@\S+\.\S+/.test(emailValue))
      newErrors.email = "Invalid email format";
    if (!isEmailVerified) newErrors.email = "Email verification required";
    if (!firstNameValue) newErrors["first-name"] = "First name is required";
    if (!lastNameValue) newErrors["last-name"] = "Last name is required";
    if (!dontHaveCompanyName && !companyNameValue)
      newErrors["company-name"] = "Company name is required";
    if (!passwordValue) newErrors.password = "Password is required";
    else if (passwordValue.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleVerifyEmail = async () => {
    setApiError("");
    if (!validateEmail()) return;

    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setIsVerifying(true);
    try {
      const response = await authenticateEmail(
        { email: emailValue, code: newOtp },
        { signal: abortController.signal }
      );
      if (response.exists) {
        setApiError("Account already exists with this email address.");
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
      if (response.exists) {
        setApiError("Account already exists with this email address.");
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setApiError("");
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        email: emailValue,
        first_name: firstNameValue,
        last_name: lastNameValue,
        password: passwordValue,
        interested_in_marketing_communications: interestedInMarketingCommunications,
      };
      if (!dontHaveCompanyName) {
        payload.company_name = companyNameValue;
      }

      const response = await signup(payload, {
        signal: abortController.signal,
      });

      localStorage.setItem("authToken", response.token);

      setEmailValue("");
      setFirstNameValue("");
      setLastNameValue("");
      setCompanyNameValue("");
      setPasswordValue("");
      setInterestedInMarketingCommunications(false);
      setDontHaveCompanyName(false);
      setIsEmailVerified(false);
      setShowOtpInput(false);
      setOtpValue("");
      setGeneratedOtp(null);
      setErrors({});

      navigate("/dashboard");
    } catch (error) {
      if (error.fieldErrors) {
        setErrors((prev) => ({
          ...prev,
          ...error.fieldErrors,
          email: error.fieldErrors.email || prev.email,
          "first-name": error.fieldErrors.first_name || prev["first-name"],
          "last-name": error.fieldErrors.last_name || prev["last-name"],
          "company-name": error.fieldErrors.company_name || prev["company-name"],
          password: error.fieldErrors.password || prev.password,
        }));
      }
      setApiError(error.message || "Signup failed. Please try again.");
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
      <form className={FormStyles.container} onSubmit={handleSignup}>
        <h4 className="dark">Signup</h4>

        {apiError && (
          <div className={FormStyles.errorMessage}>{apiError}</div>
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
                disabled={
                  isLoading ||
                  isVerifying ||
                  (inputElement.name === "email" && isEmailVerified)
                }
              />
              {inputElement.name === "email" &&
                !isEmailVerified &&
                !showOtpInput && (
                  <button
                    type="button"
                    className={`secondary-btn medium-btn ${
                      isVerifying ? FormStyles.loading : ""
                    }`}
                    onClick={handleVerifyEmail}
                    disabled={isVerifying || isLoading}
                  >
                    {isVerifying ? "Processing..." : "Verify Mail"}
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
            {inputElement.name === "company-name" && (
              <div className={FormStyles.checkBoxInput}>
                <input
                  type="checkbox"
                  name="dont-have-company-name"
                  id="dont-have-company-name"
                  checked={dontHaveCompanyName}
                  onChange={(e) => setDontHaveCompanyName(e.target.checked)}
                  disabled={isLoading}
                />
                <label className="c3" htmlFor="dont-have-company-name">
                  I don't have a company name
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
                name="dont-have-company-name"
                id="dont-have-company-name"
                checked={dontHaveCompanyName}
                onChange={(e) => setDontHaveCompanyName(e.target.checked)}
                disabled={isLoading}
              />
              <label className="c3" htmlFor="dont-have-company-name">
                I don't have a company name
              </label>
            </div>
          </div>
        )}

        <div className={FormStyles.checkBoxInput}>
          <input
            type="checkbox"
            name="marketing-communications"
            id="marketing-communications"
            checked={interestedInMarketingCommunications}
            onChange={(e) =>
              setInterestedInMarketingCommunications(e.target.checked)
            }
            disabled={isLoading}
          />
          <label className="c3" htmlFor="marketing-communications">
            I would like to receive marketing communications.
          </label>
        </div>

        <Link to="/login" className="clr-black b4">
          Already have an account?
        </Link>

        <button
          className={`primary-btn large-btn full-width text-large ${
            isLoading ? FormStyles.loading : ""
          }`}
          type="submit"
          disabled={isLoading || !isEmailVerified}
        >
          {isLoading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default SignupForm;