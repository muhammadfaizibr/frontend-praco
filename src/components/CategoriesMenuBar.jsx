import React from "react";
import CategoriesMenuBarStyles from "assets/css/CategoriesMenuBarStyles.module.css";
import { Boxes } from "lucide-react";

const CategoriesMenuBar = () => {
  const categories = [
    {
      label: "Boxes",
      url: "/category/1",
      icons: <Boxes className="clr-gray icon-md" strokeWidth={1.5} />,
    },
    {
      label: "Boxes",
      url: "/category/1",
      icons: <Boxes className="clr-gray icon-md" strokeWidth={1.5} />,
    },
    {
      label: "Boxes",
      url: "/category/1",
      icons: <Boxes className="clr-gray icon-md" strokeWidth={1.5} />,
    },
    {
      label: "Boxes",
      url: "/category/1",
      icons: <Boxes className="clr-gray icon-md" strokeWidth={1.5} />,
    },
    {
      label: "Boxes",
      url: "/category/1",
      icons: <Boxes className="clr-gray icon-md" strokeWidth={1.5} />,
    },
    {
      label: "Boxes",
      url: "/category/1",
      icons: <Boxes className="clr-gray icon-md" strokeWidth={1.5} />,
    },
  ];
  return (
    <ul className={CategoriesMenuBarStyles.menu}>

      {categories.map((category, index) => {
        return (
          <li className={`${CategoriesMenuBarStyles.category} b3`} key={`menuBarProductCategory_${category}_${index}`}>
            <span className={CategoriesMenuBarStyles.categoryIcon}>{category.icons}</span>
            {category.label}
          </li>
        );
      })}
      
      
    </ul>
  );
};

export default CategoriesMenuBar;
