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
import CustomLoading from "components/CustomLoading";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={TableStyles.error}>
          Error: Something went wrong. {this.state.error?.message || ""}
        </div>
      );
    }
    return this.props.children;
  }
}

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
    document.title = product
      ? product
          .replace(/-/g, " ")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ") + " - Praco"
      : "Praco - UK's Leading Packaging Supplies";

    const fetchProductData = async () => {
      try {
        setLoading(true);
        const productResponse = await getProductBySlug(product);
        if (!productResponse) throw new Error("Product not found");
        setProductData(productResponse);
        setSelectedImage(productResponse.images?.[0]?.image || "");

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
        if (suppressObserver) return;

        const intersectingEntries = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => ({
            variantId: parseInt(entry.target.id.replace("variant-", ""), 10),
            top: entry.boundingClientRect.top,
          }));


        if (intersectingEntries.length > 0) {
          const topmostEntry = intersectingEntries.reduce((min, entry) =>
            entry.top < min.top ? entry : min
          );
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            setActiveVariantId(topmostEntry.variantId);
          }, 150);
        } else if (!activeVariantId && variantsWithData.length > 0) {
          setActiveVariantId(variantsWithData[0].id);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    const observeTimeout = setTimeout(() => {
      variantsWithData.forEach((variant) => {
        if (!variant?.id) {
          console.warn("Invalid variant, missing id:", variant);
          return;
        }
        const element = document.getElementById(`variant-${variant.id}`);
        if (element) {
          observer.observe(element);
          const height = element.getBoundingClientRect().height;
          if (height === 0) {
            console.warn(`Element #variant-${variant.id} has zero height`);
          }
        } else {
          console.warn(`Element #variant-${variant.id} not found`);
        }
      });
    }, 100);

    const handleResize = () => {
      variantsWithData.forEach((variant) => {
        if (!variant?.id) return;
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
      clearTimeout(observeTimeout);
      variantsWithData.forEach((variant) => {
        if (!variant?.id) return;
        const element = document.getElementById(`variant-${variant.id}`);
        if (element) {
          observer.unobserve(element);
        }
      });
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [variantsWithData, suppressObserver, activeVariantId]);

  const handleImageError = useCallback((imageId) => {
    setImageErrors((prev) => ({ ...prev, [imageId]: true }));
  }, []);

  const scrollToVariant = useCallback((variantId) => {
    const element = document.getElementById(`variant-${variantId}`);
    if (element) {
      const offset = 60;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
      setActiveVariantId(variantId);
      setSuppressObserver(true);
      setTimeout(() => {
        setSuppressObserver(false);
      }, 1000);
    } else {
      console.warn(`Element #variant-${variantId} not found for scrolling`);
    }
  }, []);

  const handleThumbnailClick = useCallback((image) => {
    setSelectedImage(image);
  }, []);

  if (loading) return <CustomLoading />;
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
                  src={imageErrors[selectedImage] ? "" : selectedImage}
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
                        src={imageErrors[img.id] ? "" : img.image}
                        alt={`${productData.name} thumbnail ${img.id}`}
                        className={`${TableStyles.thumbnailImage} ${selectedImage === img.image ? TableStyles.selectedThumbnail : ""}`}
                        onClick={() => handleThumbnailClick(img.image)}
                        onError={() => handleImageError(img.id)}
                        loading="lazy"
                      />
                    ))
                  ) : (
                    <img
                      src=""
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

            {variantsWithData.length > 0 && (
              <div className={TableStyles.variantNavBar}>
                {variantsWithData.map((variant) => (
                  <button
                    key={variant.id}
                    className={`b1 ${TableStyles.variantNavLink} ${variant.id === activeVariantId ? TableStyles.activeVariant : ""}`}
                    onClick={() => scrollToVariant(variant.id)}
                    aria-label={`Navigate to ${variant.name}`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            )}

            <ProductsTable variantsWithData={variantsWithData} />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default memo(ProductDetails);