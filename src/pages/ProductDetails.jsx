import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import HeadingBar from "components/HeadingBar";
import ProductsTable from "components/ProductsTable";
import {
  getProductBySlug,
  getProductVariants,
  getItemsByProductVariant,
  getTableFieldsByProductVariant,
  getPricingTierDataByItem,
} from "utils/api/ecommerce";

const ProductDetails = () => {
  const { category, product } = useParams();
  const [productData, setProductData] = useState(null);
  const [variantsWithData, setVariantsWithData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        // Fetch product by slug
        const productResponse = await getProductBySlug(product);
        if (!productResponse) {
          throw new Error("Product not found");
        }
        setProductData(productResponse);

        // Fetch product variants
        const variants = await getProductVariants(productResponse.id);
        console.log("Variants:", variants);

        // Fetch items, table fields, and pricing tier data for each variant
        const variantsData = [];
        for (const variant of variants) {
          const items = await getItemsByProductVariant(variant.id);
          console.log(`Items for variant ${variant.id}:`, items);
          const tableFields = await getTableFieldsByProductVariant(variant.id);
          console.log(`TableFields for variant ${variant.id}:`, tableFields);
          const itemsWithPricing = await Promise.all(
            items.map(async (item) => {
              const pricingTierData = await getPricingTierDataByItem(item.id);
              return { ...item, pricing_tier_data: pricingTierData };
            })
          );
          variantsData.push({ ...variant, items: itemsWithPricing, tableFields });
        }
        console.log("Variants with data:", variantsData);
        setVariantsWithData(variantsData);
      } catch (err) {
        setError(err.message || "Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [category, product]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="column-content">
      <div className="centered-layout-wrapper layout-spacing full-width-flex-col layout-vertical-padding">
        <div className="centered-layout page-layout full-width-flex-col gap-m">
          <HeadingBar
            displayType={"row"}
            headline={productData.name}
            headlineSize={"h3"}
            headlineSizeType={"tag"}
            theme={"light"}
          />
          <ProductsTable variantsWithData={variantsWithData} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;