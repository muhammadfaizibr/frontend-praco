import React, { useState } from "react";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Plus, Table } from "lucide-react";

const ProductsTable = () => {
  const [productVariants, setProductVariants] = useState([
    {
      image:
        "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
      description:
        "General purpose - Clear Blown alternative Flush core - 30% recycled content",
      width_length: "400mm x 250m",
      number_of_units: 300,
      units: 5,
    },
  ]);

  // Function to handle increment/decrement of units
  const updateUnits = (index, change) => {
    const updatedVariants = [...productVariants];
    updatedVariants[index].units = Math.max(
      0,
      updatedVariants[index].units + change
    ); // Prevent negative units
    setProductVariants(updatedVariants);
  };

  return (
    <div className={TableStyles.tableContentWrapper}>
      <div className={TableStyles.tableContainer}>
        <table className={TableStyles.table}>
          <thead>
            <tr>
              <th className="l3 clr-accent-dark-blue">Image</th>
              <th className={`l3 clr-accent-dark-blue ${TableStyles.colLongWidth}`}>Description</th>
               <th className="l3 clr-accent-dark-blue">Width x Length</th>
              <th className={`l3 clr-accent-dark-blue`}>
                <div className={TableStyles.thWithButtons}>
                  Units per
                  <span className={TableStyles.thButtonsWrapper}>
                    <button className={`${TableStyles.thButton} text-medium`}>
                      Pallets
                    </button>
                    <button className={`${TableStyles.thButton} text-medium`}>
                      Packs
                    </button>
                  </span>
                </div>
              </th>
             <th className={`no-padding ${TableStyles.colLongWidth}`}>
                <div className={`l3 clr-accent-dark-blue column-content full-width`}>
                  <div
                    className={`${TableStyles.thWithButtonsRow} padding-xxs-y`}
                  >
                    Units per
                    <span className={TableStyles.thButtonsWrapper}>
                      <button className={`${TableStyles.thButton} text-medium`}>
                        Pallets
                      </button>
                      <button className={`${TableStyles.thButton} text-medium`}>
                        Packs
                      </button>
                    </span>
                  </div>
                  <th className={`row-content ${TableStyles.nestedTh}`}>
                    <th className="l3 clr-accent-dark-blue">1-4 Packs</th>
                    <th className="l3 clr-accent-dark-blue">5-19 Packs</th>
                    <th className="l3 clr-accent-dark-blue">20+ Packs</th>
                  </th>
                </div>
              </th>
              <th className="l3 clr-accent-dark-blue">Enter No. of Units</th>
            </tr>
          </thead>
          <tbody>
            {productVariants.map((cartElement, index) => (
              <tr key={index}>
                <td className="c3">
                  <div className={TableStyles.colImageWrapper}>
                    <div className={TableStyles.colImageContainer}>
                      <img
                        src={cartElement.image}
                        alt="Product"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </td>
                <td className={`c3 ${TableStyles.colLongWidth}`}>
                  {cartElement.description}
                </td>
                 <td className="c3">{cartElement.width_length}</td>
                <td className="c3">{cartElement.number_of_units}</td>
                <td className={`${TableStyles.tdWrapperForNestedContent} ${TableStyles.colLongWidth}`}>
                <td className={TableStyles.nestedTd}>
                  <td className="l3 clr-accent-dark-blue">1-4 Packs</td>
                  <td className="l3 clr-accent-dark-blue">5-19 Packs</td>
                  <td className="l3 clr-accent-dark-blue">20+ Packs</td>
                </td>
                </td>
               <td className="c3">
                  <span className={TableStyles.cartUnitsColWrapper}>
                    <button
                      className={TableStyles.cartButton}
                      onClick={() => updateUnits(index, -1)}
                    >
                      <Minus className="icon-xms" />
                    </button>
                    <span>{cartElement.units}</span>
                    <button
                      className={TableStyles.cartButton}
                      onClick={() => updateUnits(index, 1)}
                    >
                      <Plus className="icon-xms" />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTable;
