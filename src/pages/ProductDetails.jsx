import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import ProductsTable from "components/ProductsTable";
import TableStyles from "assets/css/TableStyles.module.css";
import {
  getProductBySlug,
  getProductVariants,
  getItemsByProductVariant,
  getTableFieldsByProductVariant,
  getPricingTierDataByItem,
} from "utils/api/ecommerce";

// Error Boundary Component
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  if (hasError) return <div className={TableStyles.error}>Error: Something went wrong.</div>;
  return <div onError={() => setHasError(true)}>{children}</div>;
};

const ProductDetails = () => {
  const { category, product } = useParams();
  const [productData, setProductData] = useState(null);
  const [variantsWithData, setVariantsWithData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const productResponse = await getProductBySlug(product);
        if (!productResponse) throw new Error("Product not found");
        setProductData(productResponse);
        setSelectedImage(productResponse.images?.[0]?.image || "/fallback-product-image.jpg");

        const variants = await getProductVariants(productResponse.id);
        const variantsData = await Promise.all(
          variants.map(async (variant) => {
            const items = await getItemsByProductVariant(variant.id);
            const tableFields = await getTableFieldsByProductVariant(variant.id);
            const itemsWithPricing = await Promise.all(
              items.map(async (item) => {
                const pricingTierData = await getPricingTierDataByItem(item.id);
                return { ...item, pricing_tier_data: pricingTierData };
              })
            );
            return { ...variant, items: itemsWithPricing, tableFields };
          })
        );
        setVariantsWithData(variantsData);
      } catch (err) {
        setError(err.message || "Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [category, product]);

  const handleImageError = useCallback((imageId) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  }, []);

  const scrollToVariant = useCallback((variantId) => {
    const element = document.getElementById(`variant-${variantId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleThumbnailClick = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  if (loading) return <div className={TableStyles.loading}>Loading...</div>;
  if (error) return <div className={TableStyles.error}>Error: {error}</div>;

  const sanitizedDescription = DOMPurify.sanitize(productData.description || "");

  return (
    <ErrorBoundary>
      <div className="column-content">
        <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
          <div className="centered-layout page-layout full-width-flex-col gap-m">
            <div className={TableStyles.productDetailsContainer}>
              <div className={TableStyles.productImagesContainer}>
                <img
                  src={imageErrors[selectedImage] ? "/fallback-product-image.jpg" : selectedImage}
                  alt={`${productData.name} large preview`}
                  className={TableStyles.largePreviewImage}
                  onError={() => handleImageError(selectedImage)}
                  loading="lazy"
                />
                <div className={TableStyles.thumbnailContainer}>
                  {productData.images?.length > 0 ? (
                    productData.images.map((img) => (
                      <img
                        key={img.id}
                        src={imageErrors[img.id] ? "/fallback-product-image.jpg" : img.image}
                        alt={`${productData.name} thumbnail ${img.id}`}
                        className={`${TableStyles.thumbnailImage} ${selectedImage === img.image ? TableStyles.selectedThumbnail : ""}`}
                        onClick={() => handleThumbnailClick(img.image)}
                        onError={() => handleImageError(img.id)}
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <img
                      src="/fallback-product-image.jpg"
                      alt="No product image"
                      className={TableStyles.thumbnailImage}
                    />
                  )}
                </div>
              </div>
              <div className={TableStyles.productDetails}>
                <h3>{productData.name}</h3>
                <div
                  className={TableStyles.productDescription}
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription || "No description available." }}
                />
              </div>
            </div>

            {/* Sticky Variant Navigation Bar */}
            {variantsWithData.length > 0 && (
              <div className={TableStyles.variantNavBar}>
                {variantsWithData.map((variant) => (
                  <button
                    key={variant.id}
                    className={`b3 ${TableStyles.variantNavLink} ${variant.id === variantsWithData[0].id ? TableStyles.activeVariant : ""}`}
                    onClick={() => scrollToVariant(variant.id)}
                    aria-label={`Navigate to ${variant.name}`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            )}

            {/* Variants Table */}
            <ProductsTable variantsWithData={variantsWithData} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(ProductDetails);
