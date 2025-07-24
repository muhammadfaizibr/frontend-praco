import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { subscribeNewsletter } from "utils/api/administration";

const NewsLetterInput = () => {
  const [emailValue, setEmailValue] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const abortController = new AbortController();

  const validateForm = () => {
    const newErrors = {};
    if (!emailValue) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailValue)) newErrors.email = "Invalid email format";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await subscribeNewsletter(
        { email: emailValue },
        { signal: abortController.signal }
      );

      setEmailValue("");
      setErrors({});
      setSuccessMessage("Thanks for subscribing, we'll keep you updated with upcoming deals!");
    } catch (error) {
      if (error.fieldErrors?.email) {
        setErrors({ email: error.fieldErrors.email });
      } else {
        setApiError(error.message || "Subscription failed. Please try again.");
      }
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
    <div style={{ width: "100%" }}>
      {apiError && (
        <p className="b3 clr-danger-light" style={{ marginBottom: "0.5rem" }}>
          {apiError}
        </p>
      )}
      {successMessage && (
        <p className="b3 clr-success-light" style={{ marginBottom: "0.5rem" }}>
          {successMessage}
        </p>
      )}
      {!successMessage && (
        <form onSubmit={handleSubscribe} className="search-bar border-none" style={{ width: "100%" }}>
          <input
            className={`b3 ${errors.email ? "input-error" : ""}`}
            type="email"
            name="news-letter"
            id="news-letter"
            placeholder="Email Address"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            disabled={isLoading}
          />
          <button
            className={`clr-white ${isLoading ? "loading" : ""}`}
            type="submit"
            disabled={isLoading}
          >
            <Mail className="icon-md" />
          </button>
        </form>
      )}
      {errors.email && (
        <p className="b3 clr-danger-light" style={{ marginTop: "0.5rem" }}>
          {errors.email}
        </p>
      )}
    </div>
  );
};

export default NewsLetterInput;