import axios from "axios";
import { BASE_URL, TIMEOUT, CONTENT_TYPE } from "utils/global";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": CONTENT_TYPE,
  },
});

// Add request interceptor to include accessToken
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
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
          `${BASE_URL}/api/account/token/refresh/`,
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
      if (status === 401 && data.code === "bad_authorization_header") {
        errorMessage = "Invalid authorization header. Please try again.";
      } else if (data?.errors) {
        if (data.errors.non_field_errors) {
          errorMessage = data.errors.non_field_errors.join(" ");
        }
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

export const searchItems = async (params, signal) => {
  try {
    const response = await apiClient.get("items/", { params, signal });
    return response.data || [];
  } catch (error) {
    throw error;
  }
};

export const searchProducts = async (query, signal) => {
  try {
    const response = await apiClient.get(`products/?search=${encodeURIComponent(query)}`, { signal });
    return response.data.results || [];
  } catch (error) {
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await apiClient.get("categories/");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductsByCategory = async (categorySlug, nextUrl = null) => {
  try {
    const url = nextUrl || `products/?category=${categorySlug}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProductVariants = async (productId) => {
  try {
    let allVariants = [];
    let url = `product-variants/?product=${productId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data;
      allVariants = allVariants.concat(data.results || []);
      url = data.next;
    }
    return allVariants;
  } catch (error) {
    throw error;
  }
};

export const getProductBySlug = async (productSlug) => {
  try {
    const response = await apiClient.get(`products/?slug=${productSlug}`);
    return response.data.results[0];
  } catch (error) {
    throw error;
  }
};

export const getItemsByProductVariant = async (productVariantId) => {
  try {
    let allItems = [];
    let url = `items/?product_variant=${productVariantId}&status=active`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data;
      allItems = allItems.concat(data.results || []);
      url = data.next;
    }
    return allItems;
  } catch (error) {
    throw error;
  }
};

export const getTableFieldsByProductVariant = async (productVariantId) => {
  try {
    let allFields = [];
    let url = `table-fields/?product_variant=${productVariantId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data;
      allFields = allFields.concat(data.results || []);
      url = data.next;
    }
    return allFields;
  } catch (error) {
    throw error;
  }
};

export const getPricingTierDataByItem = async (itemId) => {
  try {
    let allPricingData = [];
    let url = `pricing-tier-data/?item=${itemId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data;
      allPricingData = allPricingData.concat(data.results || []);
      url = data.next;
    }
    return allPricingData;
  } catch (error) {
    throw error;
  }
};

export const calculatePrice = async (productVariantId, units, pricePer = 'pack') => {
  try {
    const response = await apiClient.get(`product-variants/${productVariantId}/calculate-price/`, {
      params: { units, price_per: pricePer }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserExclusivePrice = async (itemId, signal) => {
  try {
    const response = await apiClient.get("user-exclusive-prices/", {
      params: { item: itemId },
      signal,
    });
    return response.data.results || [];
  } catch (error) {
    throw error;
  }
};

export const getOrCreateCart = async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const response = await apiClient.get("carts/");
    return response.data;
  } catch (error) {
    const errorMessage = error.message || error?.fieldErrors?.detail || "Failed to retrieve or create cart";
    throw new Error(errorMessage);
  }
};

export const addCartItem = async (cartItems) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found. Please log in.");
    }

    const payload = Array.isArray(cartItems) ? cartItems : [cartItems];
    const response = await apiClient.post("cart-items/", payload);
    return Array.isArray(cartItems) ? response.data : response.data[0];
  } catch (error) {
    const errorMessage = error.message || error?.fieldErrors?.detail || "Failed to add items to cart";
    throw new Error(errorMessage);
  }
};

export const getCartItems = async (cartId) => {
  try {
    const response = await apiClient.get(`cart-items/?cart=${cartId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post("orders/", orderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addOrderItem = async (orderId, itemData) => {
  try {
    const response = await apiClient.post("order-items/", {
      order: orderId,
      item: itemData.item,
      pricing_tier: itemData.pricing_tier,
      pack_quantity: itemData.pack_quantity,
      unit_type: itemData.unit_type,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOrders = async () => {
  try {
    let allOrders = [];
    let url = "orders/";
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data;
      allOrders = allOrders.concat(data.results || []);
      url = data.next;
    }
    return allOrders;
  } catch (error) {
    throw error;
  }
};

export const getOrderItems = async (orderId) => {
  try {
    let allItems = [];
    let url = `order-items/?order=${orderId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data;
      allItems = allItems.concat(data.results || []);
      url = data.next;
    }
    return allItems;
  } catch (error) {
    throw error;
  }
};