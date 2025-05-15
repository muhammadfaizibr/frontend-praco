import axios from "axios";
import { BASE_URL } from "utils/global";
import { CancelToken } from 'axios';

const apiClient = axios.create({
  baseURL: `${BASE_URL}account/`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const isAuthRequired =
      !config.url.includes("login/") &&
      !config.url.includes("signup/") &&
      !config.url.includes("email-authentication/") &&
      !config.url.includes("reset-password/") &&
      !config.url.includes("token/verify/") &&
      !config.url.includes("token/refresh/");
    if (token && isAuthRequired) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.code === "token_not_valid"
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }
        const response = await axios.post(
          "http://127.0.0.1:8000/api/account/token/refresh/",
          { refresh: refreshToken },
          { timeout: 5000 }
        );
        const { access } = response.data;
        if (!access) {
          throw new Error("Invalid refresh token response");
        }
        localStorage.setItem("accessToken", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject({
          message: "Session expired. Please log in again.",
          fieldErrors: {},
          status: 401,
        });
      }
    }

    let errorMessage = "An unexpected error occurred";
    let fieldErrors = {};

    if (error.response) {
      const { data, status } = error.response;
      if (status === 400 && data.errors) {
        if (data.errors.non_field_errors) {
          errorMessage = data.errors.non_field_errors.join(" ");
        }
        fieldErrors = Object.fromEntries(
          Object.entries(data.errors)
            .filter(([key]) => key !== "non_field_errors")
            .map(([key, value]) => [key, Array.isArray(value) ? value.join(" ") : value])
        );
      } else if (status === 401 && data.code === "bad_authorization_header") {
        errorMessage = "Invalid authorization header. Please log in again.";
      } else {
        errorMessage = data?.message || data?.detail || `Error ${status}`;
      }
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timed out. Please try again.";
    } else if (error.message === "Network Error") {
      errorMessage = "Network error. Please check your connection.";
    }

    return Promise.reject({
      message: errorMessage,
      fieldErrors,
      status: error.response?.status,
    });
  }
);

const requestCache = new Map();

const withCache = async (cacheKey, fn, signal) => {
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  try {
    const source = CancelToken.source();
    if (signal) {
      signal.addEventListener("abort", () => {
        source.cancel("Request cancelled");
      });
    }

    const promise = fn(source.token).then((response) => {
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

export const login = ({ email, password }, { signal } = {}) => {
  const trimmedEmail = email.trim();
  const cacheKey = `login:${trimmedEmail}`;
  return withCache(
    cacheKey,
    (cancelToken) =>
      apiClient.post("login/", { email: trimmedEmail, password }, { cancelToken }),
    signal
  );
};

export const signup = (
  {
    email,
    first_name,
    last_name,
    company_name,
    password,
    interested_in_marketing_communications,
  },
  { signal } = {}
) => {
  const trimmedEmail = email.trim();
  const cacheKey = `signup:${trimmedEmail}`;
  const payload = {
    email: trimmedEmail,
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    password: password.trim(),
    interested_in_marketing_communications,
  };
  if (company_name) {
    payload.company_name = company_name.trim();
  }
  return withCache(
    cacheKey,
    (cancelToken) => apiClient.post("signup/", payload, { cancelToken }),
    signal
  );
};

export const authenticateEmail = ({ email, code }, { signal } = {}) => {
  const trimmedEmail = email.trim();
  const cacheKey = `email-auth:${trimmedEmail}:${code}`;
  return withCache(
    cacheKey,
    (cancelToken) =>
      apiClient.post("email-authentication/", { email: trimmedEmail, code }, { cancelToken }),
    signal
  );
};

export const resetPassword = (
  { email, new_password, confirm_new_password },
  { signal } = {}
) => {
  const trimmedEmail = email.trim();
  const cacheKey = `reset-password:${trimmedEmail}`;
  return withCache(
    cacheKey,
    (cancelToken) =>
      apiClient.post(
        "reset-password/",
        { email: trimmedEmail, new_password, confirm_new_password },
        { cancelToken }
      ),
    signal
  );
};

export const updatePassword = (
  { current_password, new_password, confirm_new_password },
  { signal } = {}
) => {
  const cacheKey = `update-password:${current_password}:${new_password}`;
  return withCache(
    cacheKey,
    (cancelToken) =>
      apiClient.post(
        "update-password/",
        { current_password, new_password, confirm_new_password },
        { cancelToken }
      ),
    signal
  );
};

export const verifyToken = ({ token }, { signal } = {}) => {
  const cacheKey = `verify-token:${token.slice(0, 10)}`;
  return withCache(
    cacheKey,
    (cancelToken) =>
      apiClient.post("token/verify/", { token }, { cancelToken }),
    signal
  );
};

export const refreshToken = ({ refresh }, { signal } = {}) => {
  const cacheKey = `refresh-token:${refresh.slice(0, 10)}`;
  return withCache(
    cacheKey,
    (cancelToken) =>
      axios.post(
        "http://127.0.0.1:8000/api/account/token/refresh/",
        { refresh },
        { cancelToken, timeout: 5000 }
      ),
    signal
  );
};

export const clearRequestCache = () => {
  requestCache.clear();
};