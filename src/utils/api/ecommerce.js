import axios from "axios";
import { BASE_URL, TIMEOUT, CONTENT_TYPE } from "utils/global";

const apiClient = axios.create({
  baseURL: `${BASE_URL}ecommerce/`,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": CONTENT_TYPE,
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.error(`API error for ${originalRequest.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

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
        console.error("Token refresh failed:", refreshError);
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
        errorMessage = "Invalid authorization header. Please log in again.";
      } else if (typeof data === "object" && data !== null) {
        if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors)
            ? data.non_field_errors.join(" ")
            : data.non_field_errors;
        } else {
          Object.keys(data).forEach((key) => {
            fieldErrors[key] = Array.isArray(data[key])
              ? data[key].join(" ")
              : data[key].toString();
          });
          errorMessage = Object.keys(fieldErrors).length
            ? "Please check the form for errors."
            : "Invalid response from server.";
        }
      } else if (typeof data === "string") {
        errorMessage = data;
      } else {
        errorMessage = `Error ${status}: Unable to process request.`;
      }
    } else if (error.code === "ECONNABORTED") {
      errorMessage = "Request timed out. Please check your connection and try again.";
    } else if (error.message === "Network Error") {
      errorMessage = "Network error. Please check your internet connection.";
    } else {
      errorMessage = error.message || "An unexpected error occurred.";
    }

    return Promise.reject({ message: errorMessage, fieldErrors, status: error.response?.status });
  }
);

export const getShippingAddresses = async () => {
  try {
    let allAddresses = [];
    let url = "shipping-addresses/";
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};
      const validAddresses = (data.results || []).filter((addr) =>
        addr &&
        typeof addr === 'object' &&
        addr.id &&
        addr.street &&
        addr.city &&
        addr.postal_code &&
        addr.country &&
        addr.telephone_number
      );
      allAddresses = allAddresses.concat(validAddresses);
      url = data.next || null;
    }
    return allAddresses;
  } catch (error) {
    console.error("getShippingAddresses error:", error);
    throw error;
  }
};

export const getBillingAddresses = async () => {
  try {
    let allAddresses = [];
    let url = "billing-addresses/";
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};
      const validAddresses = (data.results || []).filter((addr) =>
        addr &&
        typeof addr === 'object' &&
        addr.id &&
        addr.street &&
        addr.city &&
        addr.postal_code &&
        addr.country &&
        addr.telephone_number
      );
      allAddresses = allAddresses.concat(validAddresses);
      url = data.next || null;
    }
    return allAddresses;
  } catch (error) {
    console.error("getBillingAddresses error:", error);
    throw error;
  }
};

export const createShippingAddress = async (addressData, { signal }) => {
  try {
    const response = await apiClient.post("shipping-addresses/", addressData, { signal });
    return response.data;
  } catch (error) {
    console.error("createShippingAddress error:", error);
    throw error;
  }
};

export const createBillingAddress = async (addressData, { signal }) => {
  try {
    const response = await apiClient.post("billing-addresses/", addressData, { signal });
    return response.data;
  } catch (error) {
    console.error("createBillingAddress error:", error);
    throw error;
  }
};

export const deleteShippingAddress = async (addressId, { signal }) => {
  try {
    const response = await apiClient.delete(`shipping-addresses/${addressId}/`, { signal });
    return response.data;
  } catch (error) {
    console.error("deleteShippingAddress error:", error);
    throw error;
  }
};

export const deleteBillingAddress = async (addressId, { signal }) => {
  try {
    const response = await apiClient.delete(`billing-addresses/${addressId}/`, { signal });
    return response.data;
  } catch (error) {
    console.error("deleteBillingAddress error:", error);
    throw error;
  }
};

export const searchItems = async (params, { signal }) => {
  try {
    let allItems = [];
    let url = "items/";
    let count = 0;
    let next = null;
    let previous = null;

    // Normalize query parameters
    const normalizedParams = {
      ...params,
      measurement_unit: params.measurement_unit ? params.measurement_unit.toUpperCase() : undefined,
      category: params.category ? params.category.toLowerCase() : undefined,
      approx_size: params.approx_size === true || params.approx_size === 'true',
      minimum_size: params.minimum_size === true || params.minimum_size === 'true',
    };

    // Fetch all pages
    while (url) {
      const response = await apiClient.get(url, { params: normalizedParams, signal });
      const data = response.data || {};
      allItems = allItems.concat(data.results || []);
      count = data.count || 0;
      next = data.next || null;
      previous = data.previous || null;
      url = data.next || null;
    }

    // Return the full response structure
    return {
      count,
      next,
      previous,
      results: allItems,
    };
  } catch (error) {
    console.error("searchItems error:", error);
    throw error;
  }
};

export const searchProducts = async (query, { signal }) => {
  try {
    let allProducts = [];
    let url = `products/?search=${encodeURIComponent(query)}`;
    while (url) {
      const response = await apiClient.get(url, { signal });
      const data = response.data || {};
      allProducts = allProducts.concat(data.results || []);
      url = data.next || null;
    }
    return allProducts;
  } catch (error) {
    console.error("searchProducts error:", error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await apiClient.get("categories/");
    return response.data || [];
  } catch (error) {
    console.error("getCategories error:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categorySlug, nextUrl = null) => {
  try {
    const url = nextUrl || `products/?category=${categorySlug}`;
    const response = await apiClient.get(url);
    return response.data || {};
  } catch (error) {
    console.error("getProductsByCategory error:", error);
    throw error;
  }
};

export const getProductVariants = async (productId) => {
  try {
    let allVariants = [];
    let url = `product-variants/?product=${productId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};
      allVariants = allVariants.concat(data.results || []);
      url = data.next || null;
    }
    return allVariants;
  } catch (error) {
    console.error("getProductVariants error:", error);
    throw error;
  }
};

export const getProductBySlug = async (productSlug) => {
  try {
    const response = await apiClient.get(`products/?slug=${productSlug}`);
    const data = response.data || {};
    return data.results?.[0] || null;
  } catch (error) {
    console.error("getProductBySlug error:", error);
    throw error;
  }
};

export const getItemsByProductVariant = async (productVariantId) => {
  try {
    let allItems = [];
    let url = `items/?product_variant=${productVariantId}&status=active`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};
      allItems = allItems.concat(data.results || []);
      url = data.next || null;
    }
    return allItems;
  } catch (error) {
    console.error("getItemsByProductVariant error:", error);
    throw error;
  }
};

export const getTableFieldsByProductVariant = async (productVariantId) => {
  try {
    let allFields = [];
    let url = `table-fields/?product_variant=${productVariantId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};
      allFields = allFields.concat(data.results || []);
      url = data.next || null;
    }
    return allFields;
  } catch (error) {
    console.error("getTableFieldsByProductVariant error:", error);
    throw error;
  }
};

export const getPricingTierDataByItem = async (itemId) => {
  try {
    let allPricingData = [];
    let url = `pricing-tier-data/?item=${itemId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};
      allPricingData = allPricingData.concat(data.results || []);
      url = data.next || null;
    }
    return allPricingData;
  } catch (error) {
    console.error("getPricingTierDataByItem error:", error);
    throw error;
  }
};

export const calculatePrice = async (productVariantId, units, pricePer = 'pack') => {
  try {
    const response = await apiClient.get(`product-variants/${productVariantId}/calculate-price/`, {
      params: { units, price_per: pricePer }
    });
    return response.data || {};
  } catch (error) {
    console.error("calculatePrice error:", error);
    throw error;
  }
};

export const getUserExclusivePrice = async (itemId, { signal }) => {
  try {
    const response = await apiClient.get("user-exclusive-prices/", {
      params: { item: itemId },
      signal,
    });
    return response.data.results || [];
  } catch (error) {
    console.error("getUserExclusivePrice error:", error);
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
    return response.data || {};
  } catch (error) {
    console.error("getOrCreateCart error:", error);
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
    console.error("addCartItem error:", error);
    const errorMessage = error.message || error?.fieldErrors?.detail || "Failed to add items to cart";
    throw new Error(errorMessage);
  }
};

export const getCartItems = async (cartId) => {
  try {
    let allItems = [];
    let url = `cart-items/?cart=${cartId}`;
    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};
      allItems = allItems.concat(data.results || []);
      url = data.next || null;
    }
    return { results: allItems };
  } catch (error) {
    console.error("getCartItems error:", error);
    throw error;
  }
};

export const createOrder = async (orderData, { signal }) => {
  try {
    const response = await apiClient.post("orders/", orderData, { signal });
    return response.data;
  } catch (error) {
    console.error("createOrder error:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    let allOrders = [];
    let url = "orders/";

    while (url) {
      const response = await apiClient.get(url);
      const data = response.data || {};

      let ordersToProcess;
      if (Array.isArray(data)) {
        ordersToProcess = data;
        url = null;
      } else if (data.results && Array.isArray(data.results)) {
        ordersToProcess = data.results;
        url = data.next || null;
      } else {
        throw new Error("Invalid response format: expected array or object with results array");
      }

      const validOrders = ordersToProcess.filter(
        (order) =>
          order &&
          typeof order === "object" &&
          order.id &&
          order.created_at &&
          order.status &&
          order.payment_status &&
          order.total != null
      );

      allOrders = allOrders.concat(validOrders);
    }

    return allOrders;
  } catch (error) {
    console.error("getOrders error:", error);
    if (error.name === "AbortError") {
      throw error;
    }
    throw {
      message: error.message || "Failed to fetch orders",
      status: error.status || error.response?.status,
    };
  }
};

export const getOrderItems = async (orderId, { signal }) => {
  try {
    let allItems = [];
    let url = `order-items/?order=${orderId}`;
    while (url) {
      const response = await apiClient.get(url, { signal });
      const data = response.data || {};
      allItems = allItems.concat(data.results || []);
      url = data.next || null;
    }
    return allItems;
  } catch (error) {
    console.error("getOrderItems error:", error);
    throw error;
  }
};