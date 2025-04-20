import axios from "axios";
import { CancelToken } from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api/administration/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = "An unexpected error occurred";
    let fieldErrors = {};

    if (error.response) {
      const { data, status } = error.response;
      if (status === 401 && data.code === "bad_authorization_header") {
        errorMessage = "Invalid authorization header. Please try again.";
      } else if (data?.errors) {
        // Handle error format: { errors: { non_field_errors: [...], field_name: [...] } }
        if (data.errors.non_field_errors) {
          errorMessage = data.errors.non_field_errors.join(" ");
        }
        // Map field-specific errors
        Object.keys(data.errors).forEach((key) => {
          if (key !== "non_field_errors") {
            fieldErrors[key] = data.errors[key].join(" ");
          }
        });
      } else {
        errorMessage = data?.message || data?.detail || `Error ${status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timed out. Please try again.";
    } else if (error.message === "Network Error") {
      errorMessage = "Network error. Please check your connection.";
    }

    return Promise.reject({ message: errorMessage, fieldErrors, status: error.response?.status });
  }
);

export const submitContactQuery = async (payload, { signal } = {}) => {
  const cacheKey = `contact:${payload.email}`;
  try {
    const source = CancelToken.source();

    if (signal) {
      signal.addEventListener("abort", () => {
        source.cancel("Request cancelled by user");
      });
    }

    const promise = apiClient
      .post("contact/", payload, { cancelToken: source.token })
      .then((response) => response.data);

    return await promise;
  } catch (error) {
    throw error;
  }
};