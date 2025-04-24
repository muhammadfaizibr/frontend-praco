import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import Products from "components/Products";
import BreadCrumb from "components/BreadCrumb";
import FormStyles from "assets/css/FormStyles.module.css";
import { getProductsByCategory, getCategories, getProductVariants } from "utils/api/ecommerce";

const Categories = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("Category");
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
        const categoryResponse = await getCategories();
        if (!categoryResponse.errors && isMounted) {
          const category = categoryResponse.results.find((cat) => cat.slug === slug);
          if (category) {
            setCategoryName(category.name);
          } else {
            setError("Category not found.");
            setIsLoading(false);
            return;
          }
        } else if (isMounted) {
          setError(categoryResponse.message || "Failed to load category.");
          setIsLoading(false);
          return;
        }

        const productResponse = await getProductsByCategory(slug);
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
                image: product.images[0]?.image || "https://via.placeholder.com/600x400?text=Image+Not+Found",
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
  }, [slug]);

  return (
    <>
      <BreadCrumb navigationArray={["Home", categoryName]} />
      <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
        <div className="centered-layout page-layout layout-spacing full-width-flex-col">
          {isLoading && (
            <div className={`${FormStyles.loading} b3 clr-gray`}>Loading...</div>
          )}
          {error && <div className={FormStyles.errorMessage}>{error}</div>}
          {!isLoading && !error && products.length === 0 && (
            <div className="b3 clr-gray">No products found.</div>
          )}
          {!isLoading && !error && products.length > 0 && (
            <Products title={categoryName} products={products} />
          )}
        </div>
      </div>
    </>
  );
};

Categories.propTypes = {
  slug: PropTypes.string,
};

export default Categories;