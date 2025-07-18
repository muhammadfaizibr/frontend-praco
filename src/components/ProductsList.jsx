import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Products from "components/Products";
import FormStyles from "assets/css/FormStyles.module.css";
import { getProducts, getProductVariants } from "utils/api/ecommerce";
import CustomLoading from "components/CustomLoading";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError("");
      setProducts([]);

      try {
        const productResponse = await getProducts();
        if (!productResponse.errors && isMounted) {
          const productsWithVariants = await Promise.all(
            (productResponse.results || []).map(async (product) => {
              let variantCount = 0;
              try {
                const variantResponse = await getProductVariants(product.id);
                variantCount = Array.isArray(variantResponse) ? variantResponse.length : 0;
              } catch (err) {
                console.error(`Failed to fetch variants for product ${product.id}:`, err);
              }
              return {
                id: product.id,
                title: product.name,
                slug: product.slug,
                category: product.category,
                image: product.images[0]?.image || "",
                variantCount,
                alt: product.name.toLowerCase(),
              };
            })
          );
          setProducts(productsWithVariants);
        } else if (isMounted) {
          setError(productResponse.message || "Failed to load products.");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load data.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-layout">
      {isLoading && <CustomLoading />}
      {error && <div className={FormStyles.errorMessage}>{error}</div>}
      {!isLoading && !error && products.length === 0 && (
        <p className="b3 text-center">No products found.</p>
      )}
      {!isLoading && !error && products.length > 0 && (
        <Products title="Find Your Perfect" highlightedText={"Packing Solutions"} products={products} />
      )}
    </div>
  );
};

ProductList.propTypes = {};

export default ProductList;