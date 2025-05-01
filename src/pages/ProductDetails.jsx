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
  const [activeVariantId, setActiveVariantId] = useState(null);
  const [suppressObserver, setSuppressObserver] = useState(false);

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

  useEffect(() => {
    if (variantsWithData.length === 0) return;

    let timeoutId;
    const observer = new IntersectionObserver(
      (entries) => {
        if (suppressObserver) return; // Skip updates if suppressed

        // Collect all intersecting entries
        const intersectingEntries = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            variantId: parseInt(entry.target.id.replace("variant-", ""), 10),
            top: entry.boundingClientRect.top,
          }));

        // Debugging: Log intersecting entries
        console.log("Intersecting variants:", intersectingEntries);

        if (intersectingEntries.length > 0) {
          // Select the topmost entry (smallest top value)
          const topmostEntry = intersectingEntries.reduce((min, entry) =>
            entry.top < min.top ? entry : min
          );

          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setActiveVariantId(topmostEntry.variantId);
            console.log(`Active variant updated to: ${topmostEntry.variantId}`);
          }, 150);
        } else if (!activeVariantId && variantsWithData.length > 0) {
          // Fallback to first variant if none intersecting
          setActiveVariantId(variantsWithData[0].id);
          console.log(`Fallback active variant: ${variantsWithData[0].id}`);
        }

        // Debugging: Log all entries
        console.log("All entries:", entries.map((e) => ({
          id: e.target.id,
          isIntersecting: e.isIntersecting,
          top: e.boundingClientRect.top,
        })));
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of section is visible
      }
    );

    variantsWithData.forEach((variant) => {
      const element = document.getElementById(`variant-${variant.id}`);
      if (element) {
        observer.observe(element);
        // Check element height
        const height = element.getBoundingClientRect().height;
        if (height === 0) {
          console.warn(`Element #variant-${variant.id} has zero height`);
        }
      } else {
        console.warn(`Element #variant-${variant.id} not found`);
      }
    });

    // Reobserve on resize
    const handleResize = () => {
      variantsWithData.forEach((variant) => {
        const element = document.getElementById(`variant-${variant.id}`);
        if (element) {
          observer.unobserve(element);
          observer.observe(element);
        }
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      variantsWithData.forEach((variant) => {
        const element = document.getElementById(`variant-${variant.id}`);
        if (element) {
          observer.unobserve(element);
        }
      });
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      console.log("IntersectionObserver cleaned up");
    };
  }, [variantsWithData, suppressObserver, activeVariantId]);

  const handleImageError = useCallback((imageId) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  }, []);

  const scrollToVariant = useCallback((variantId) => {
    const element = document.getElementById(`variant-${variantId}`);
    if (element) {
      // Adjust for sticky navbar (60px)
      const offset = 60;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
      // Set active variant and suppress observer briefly
      setActiveVariantId(variantId);
      setSuppressObserver(true);
      setTimeout(() => {
        setSuppressObserver(false);
        console.log("Observer suppression lifted");
      }, 1000);
      console.log(`Scrolled to variant: ${variantId}`);
    } else {
      console.warn(`Element #variant-${variantId} not found for scrolling`);
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
                    className={`b3 ${TableStyles.variantNavLink} ${variant.id === activeVariantId ? TableStyles.activeVariant : ""}`}
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