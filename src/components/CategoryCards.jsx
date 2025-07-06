import React, { useEffect, useState } from "react";
import CardStyles from "assets/css/CategoryCardsStyles.module.css";
import { Link } from "react-router-dom";
import { getCategories } from "utils/api/ecommerce";
import CustomLoading from "components/CustomLoading";
import HeadingBar from "components/HeadingBar";

const CategoryCards = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await getCategories();
        if (!response.errors) {
          setCategories(response.results || []);
        } else {
          setError(response.message || "Failed to load categories.");
        }
      } catch (err) {
        setError(err.message || "Failed to load categories.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className={CardStyles.cardGridContainer}>
              <div className="centered-layout page-layout layout-vertical-padding full-width layout-spacing">
      
      {isLoading && <CustomLoading />}
      {error && <div className={CardStyles.errorMessage}>{error}</div>}
      {!isLoading && !error && categories.length === 0 && (
        <div className="b3 clr-gray">No categories available.</div>
      )}
      {!isLoading && !error && categories.length > 0 && (
        
        <div className={CardStyles.cardGrid}>
          
          {categories.map((category) => (
            <Link
              to={`/category/${category.slug}`}
              key={`card_${category.id}`}
              className={CardStyles.card}
            >
              <div className={CardStyles.imageContainer}>
                <img
                  src={
                    "https://images.unsplash.com/photo-1748392029321-58793571f850?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8"
                  }
                  alt={category.name}
                />
              </div>
              <div className={CardStyles.cardTitle}>{category.name}</div>
            </Link>
          ))}
                   
        </div>
      )}
    </div>
    </div>
  );
};

export default CategoryCards;
