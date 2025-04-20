import React, { useEffect, useState } from "react";
import { getCategories } from "utils/api/ecommerce"; // Adjust path to your API client file
import { NavLink } from "react-router-dom";
import NavBarStyles from "assets/css/NavBarStyles.module.css";

const MenuCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.results || data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p className="b2" style={{ color: "var(--clr-text)" }}>
          Loading categories...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="b2" style={{ color: "var(--clr-danger)" }}>
        {error}
      </p>
    );
  }

  return (
    <ul className={NavBarStyles.menuCategories}>
      {categories.map((category) => (
        <li key={category.id || category.slug}>
          <NavLink
            to={`/category/${category.slug}`}
            className={({ isActive }) =>
              `b1 text-uppercase clr-black ${isActive ? "active" : ""}`
            }

          >
            {category.name || category.title}
          </NavLink>
        </li>
      ))}
    </ul>
  );
};

export default MenuCategories;
