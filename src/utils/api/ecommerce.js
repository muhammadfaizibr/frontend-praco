import axios from "axios";
import { BASE_URL, TIMEOUT, CONTENT_TYPE } from "utils/global";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": CONTENT_TYPE,
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
      url = data.next; // Continue to next page if available
    }
    return allVariants;
  } catch (error) {
    throw error;
  }
};

export const getProductBySlug = async (productSlug) => {
  try {
    const response = await apiClient.get(`products/?slug=${productSlug}`);
    return response.data.results[0]; // Assuming the API returns a list with one matching product
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
      url = data.next; // Continue to next page if available
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
      url = data.next; // Continue to next page if available
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
      url = data.next; // Continue to next page if available
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