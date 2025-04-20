import React, { useState, useEffect } from "react";
import CategoriesMenuBarStyles from "assets/css/CategoriesMenuBarStyles.module.css";
import { Boxes } from "lucide-react";
import { Link } from "react-router-dom";
import { getCategories } from "utils/api/ecommerce";

// Map API icon strings to lucide-react components
const iconMap = {
  Boxes: <Boxes className="clr-gray icon-md" strokeWidth={1.5} />,
};

const CategoriesMenuBar = () => {
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
          // Map API response to component format
          const mappedCategories = (response.results || []).map((cat) => ({
            id: cat.id,
            label: cat.name,
            url: `/category/${cat.id}`,
            icon: "Boxes", // Default icon; extend mapping if needed
          }));
          setCategories(mappedCategories);
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

    return () => {}; // Cleanup (no abort controller needed for single request)
  }, []);

  return (
    <div className={CategoriesMenuBarStyles.container}>
      {isLoading && <div className="b3 clr-gray">Loading...</div>}
      {error && <div className={CategoriesMenuBarStyles.errorMessage}>{error}</div>}
      {!isLoading && !error && (
        <ul className={CategoriesMenuBarStyles.menu}>
          {categories.map((category, index) => (
            <li
              className={`${CategoriesMenuBarStyles.category} b3`}
              key={`menuBarProductCategory_${category.id}_${index}`}
            >
              <Link to={category.url} className={CategoriesMenuBarStyles.categoryLink}>
                <span className={CategoriesMenuBarStyles.categoryIcon}>
                  {iconMap[category.icon] || <Boxes className="clr-gray icon-md" strokeWidth={1.5} />}
                </span>
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoriesMenuBar;