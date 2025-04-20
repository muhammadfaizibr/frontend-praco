import React, { useState, useEffect } from "react";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Plus } from "lucide-react";
import { calculatePrice } from "utils/api/ecommerce";

const ProductsTable = ({ variantsWithData }) => {
  const [itemUnits, setItemUnits] = useState({}); // Track units per item
  const [variantPriceType, setVariantPriceType] = useState({}); // Track price_per (pack/pallet) per variant
  const [itemPrices, setItemPrices] = useState({}); // Track calculated prices per item

  // Initialize units and price type for each item and variant
  useEffect(() => {
    const initialUnits = {};
    const initialPriceType = {};
    variantsWithData.forEach((variant) => {
      initialPriceType[variant.id] = variant.show_units_per === "pallet" ? "pallet" : "pack"; // Default to pack unless pallet-only
      variant.items.forEach((item) => {
        initialUnits[item.id] = 0;
      });
    });
    setItemUnits(initialUnits);
    setVariantPriceType(initialPriceType);
  }, [variantsWithData]);

  // Handle unit change and recalculate price
  const handleUnitChange = async (itemId, variantId, change) => {
    const newUnits = Math.max(0, (itemUnits[itemId] || 0) + change); // Prevent negative units
    setItemUnits((prev) => ({ ...prev, [itemId]: newUnits }));

    try {
      const pricePer = variantPriceType[variantId] === "pallet" ? "unit" : "pack"; // Map pallet to unit for API
      const priceData = await calculatePrice(variantId, newUnits, pricePer);
      setItemPrices((prev) => ({ ...prev, [itemId]: priceData.total }));
    } catch (error) {
      console.error("Error calculating price:", error);
    }
  };

  // Handle price type change (pack/pallet) and recalculate prices for all items in the variant
  const handlePriceTypeChange = async (variantId, pricePer) => {
    setVariantPriceType((prev) => ({ ...prev, [variantId]: pricePer }));

    // Recalculate prices for all items in the variant with non-zero units
    const variant = variantsWithData.find((v) => v.id === variantId);
    if (variant) {
      for (const item of variant.items) {
        if (itemUnits[item.id] > 0) {
          try {
            const apiPricePer = pricePer === "pallet" ? "unit" : "pack"; // Map pallet to unit for API
            const priceData = await calculatePrice(variantId, itemUnits[item.id], apiPricePer);
            setItemPrices((prev) => ({ ...prev, [item.id]: priceData.total }));
          } catch (error) {
            console.error("Error calculating price:", error);
          }
        }
      }
    }
  };

  return (
    <div className={TableStyles.tableContentWrapper}>
      {variantsWithData.length === 0 && <div>No product variants available.</div>}
      {variantsWithData.map((variant) => {
        // Get unique pricing tiers from variant.pricing_tiers
        const pricingTiers = variant.pricing_tiers || [];
        // Sort tiers by tier_type (pack first) and range_start
        pricingTiers.sort((a, b) => {
          if (a.tier_type === b.tier_type) {
            return a.range_start - b.range_start;
          }
          return a.tier_type === "pack" ? -1 : 1;
        });

        // Determine units to display based on price type
        const currentPriceType = variantPriceType[variant.id] || "pack";
        const unitsToShow =
          currentPriceType === "pack" ? variant.units_per_pack : variant.units_per_pallet;

        return (
          <div key={variant.id} className={TableStyles.tableContainer}>
            <h4>{variant.name}</h4>
            <table className={TableStyles.table}>
              <thead>
                <tr>
                  <th className="l3 clr-accent-dark-blue">SKU</th>
                  <th className="l3 clr-accent-dark-blue">Physical Product</th>
                  <th className="l3 clr-accent-dark-blue">Weight</th>
                  <th className="l3 clr-accent-dark-blue">Weight Unit</th>
                  <th className="l3 clr-accent-dark-blue">Track Inventory</th>
                  <th className="l3 clr-accent-dark-blue">Stock</th>
                  <th className="l3 clr-accent-dark-blue">Title</th>
                  <th className="l3 clr-accent-dark-blue">Status</th>
                  {/* Dynamic TableField columns */}
                  {variant.tableFields.map((field) => (
                    <th key={field.id} className="l3 clr-accent-dark-blue">{field.name}</th>
                  ))}
                  {/* Pricing Tier columns */}
                  {pricingTiers.map((tier) => (
                    <th key={tier.id} className="l3 clr-accent-dark-blue">
                      {tier.tier_type === 'pack' ? 'Packs' : 'Pallets'} {tier.range_start}-
                      {tier.no_end_range ? '+' : tier.range_end}
                    </th>
                  ))}
                  <th className="l3 clr-accent-dark-blue">
                    <div className={TableStyles.thWithButtons}>
                      Units per
                      <span className={TableStyles.thButtonsWrapper}>
                        {variant.show_units_per !== "pallet" && (
                          <button
                            className={`${TableStyles.thButton} text-medium ${
                              currentPriceType === "pack" ? "active" : ""
                            }`}
                            onClick={() => handlePriceTypeChange(variant.id, "pack")}
                          >
                            Packs
                          </button>
                        )}
                        {variant.show_units_per !== "pack" && (
                          <button
                            className={`${TableStyles.thButton} text-medium ${
                              currentPriceType === "pallet" ? "active" : ""
                            }`}
                            onClick={() => handlePriceTypeChange(variant.id, "pallet")}
                          >
                            Pallets
                          </button>
                        )}
                      </span>
                    </div>
                  </th>
                  <th className="l3 clr-accent-dark-blue">Enter No. of Units</th>
                  <th className="l3 clr-accent-dark-blue">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {variant.items.map((item) => (
                  <tr key={item.id}>
                    <td className="c3">{item.sku}</td>
                    <td className="c3">{item.is_physical_product ? "Yes" : "No"}</td>
                    <td className="c3">{item.weight || "-"}</td>
                    <td className="c3">{item.weight_unit || "-"}</td>
                    <td className="c3">{item.track_inventory ? "Yes" : "No"}</td>
                    <td className="c3">{item.stock || "-"}</td>
                    <td className="c3">{item.title || "-"}</td>
                    <td className="c3">{item.status}</td>
                    {/* Dynamic TableField data */}
                    {variant.tableFields.map((field) => {
                      const itemData = (item.data_entries || []).find((de) => de.field.id === field.id);
                      return (
                        <td key={field.id} className="c3">
                          {itemData ? (
                            field.field_type === 'image' ? (
                              <img
                                src={itemData.value_image}
                                alt={field.name}
                                className={TableStyles.colImageContainer}
                                style={{ maxWidth: '50px', maxHeight: '50px' }}
                              />
                            ) : field.field_type === 'price' ? (
                              `$${itemData.value_number}`
                            ) : (
                              itemData.value_text || itemData.value_number || "-"
                            )
                          ) : "-"}
                        </td>
                      );
                    })}
                    {/* Pricing Tier data */}
                    {pricingTiers.map((tier) => {
                      const pricingData = (item.pricing_tier_data || []).find(
                        (ptd) => ptd.pricing_tier.id === tier.id
                      ) || tier.pricing_data.find((pd) => pd.item === item.id);
                      return (
                        <td key={tier.id} className="c3">
                          {pricingData ? `$${pricingData.price}` : "-"}
                        </td>
                      );
                    })}
                    <td className="c3">{unitsToShow || "-"}</td>
                    <td className="c3">
                      <span className={TableStyles.cartUnitsColWrapper}>
                        <button
                          className={TableStyles.cartButton}
                          onClick={() => handleUnitChange(item.id, variant.id, -1)}
                        >
                          <Minus className="icon-xms" />
                        </button>
                        <span>{itemUnits[item.id] || 0}</span>
                        <button
                          className={TableStyles.cartButton}
                          onClick={() => handleUnitChange(item.id, variant.id, 1)}
                        >
                          <Plus className="icon-xms" />
                        </button>
                      </span>
                    </td>
                    <td className="c3">
                      {itemPrices[item.id] ? `$${itemPrices[item.id].toFixed(2)}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default ProductsTable;