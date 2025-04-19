import axios from "axios";
import { CancelToken } from "axios";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api/account/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const isAuthRequired = !config.url.includes("login/") && !config.url.includes("signup/") && !config.url.includes("email-authentication/") && !config.url.includes("reset-password/");
    if (token && isAuthRequired) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
        // Map field-specific errors (e.g., email, new_password, confirm_new_password)
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

const requestCache = new Map();

export const login = async ({ email, password }, { signal } = {}) => {
  const cacheKey = `login:${email}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  try {
    const source = CancelToken.source();
    
    if (signal) {
      signal.addEventListener("abort", () => {
        source.cancel("Request cancelled by user");
      });
    }

    const promise = apiClient.post(
      "login/",
      { email, password },
      { cancelToken: source.token }
    ).then((response) => {
      requestCache.delete(cacheKey);
      return response.data;
    });

    requestCache.set(cacheKey, promise);
    return await promise;
  } catch (error) {
    requestCache.delete(cacheKey);
    throw error;
  }
};

export const signup = async (
  { email, first_name, last_name, company_name, password, interested_in_marketing_communications },
  { signal } = {}
) => {
  const cacheKey = `signup:${email}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  try {
    const source = CancelToken.source();
    
    if (signal) {
      signal.addEventListener("abort", () => {
        source.cancel("Request cancelled by user");
      });
    }

    const payload = {
      email,
      first_name,
      last_name,
      password,
      interested_in_marketing_communications,
    };
    if (company_name) {
      payload.company_name = company_name;
    }

    const promise = apiClient.post(
      "signup/",
      payload,
      { cancelToken: source.token }
    ).then((response) => {
      requestCache.delete(cacheKey);
      return response.data;
    });

    requestCache.set(cacheKey, promise);
    return await promise;
  } catch (error) {
    requestCache.delete(cacheKey);
    throw error;
  }
};

export const authenticateEmail = async ({ email, code }, { signal } = {}) => {
  const cacheKey = `email-auth:${email}:${code}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  try {
    const source = CancelToken.source();
    
    if (signal) {
      signal.addEventListener("abort", () => {
        source.cancel("Request cancelled by user");
      });
    }

    const promise = apiClient.post(
      "email-authentication/",
      { email, code },
      { cancelToken: source.token }
    ).then((response) => {
      requestCache.delete(cacheKey);
      return response.data;
    });

    requestCache.set(cacheKey, promise);
    return await promise;
  } catch (error) {
    requestCache.delete(cacheKey);
    throw error;
  }
};

export const resetPassword = async ({ email, new_password, confirm_new_password }, { signal } = {}) => {
  const cacheKey = `reset-password:${email}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  try {
    const source = CancelToken.source();
    
    if (signal) {
      signal.addEventListener("abort", () => {
        source.cancel("Request cancelled by user");
      });
    }

    const promise = apiClient.post(
      "reset-password/",
      { email, new_password, confirm_new_password },
      { cancelToken: source.token }
    ).then((response) => {
      requestCache.delete(cacheKey);
      return response.data;
    });

    requestCache.set(cacheKey, promise);
    return await promise;
  } catch (error) {
    requestCache.delete(cacheKey);
    throw error;
  }
};

export const clearRequestCache = () => {
  requestCache.clear();
};