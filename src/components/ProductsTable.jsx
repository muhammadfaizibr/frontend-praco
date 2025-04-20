import React, { useState, useEffect } from "react";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Plus } from "lucide-react";
import { calculatePrice } from "utils/api/ecommerce";

const ProductsTable = ({ variantsWithData }) => {
  const [itemUnits, setItemUnits] = useState({});
  const [variantPriceType, setVariantPriceType] = useState({});
  const [itemPrices, setItemPrices] = useState({});
  const [itemPackPrices, setItemPackPrices] = useState({});
  const [selectedTiers, setSelectedTiers] = useState({});
  const [variantDisplayPriceType, setVariantDisplayPriceType] = useState({});
  const [showStickyBar, setShowStickyBar] = useState(false); // New state for sticky bar visibility

  useEffect(() => {
    const initialUnits = {};
    const initialPriceType = {};
    const initialSelectedTiers = {};
    const initialDisplayPriceType = {};
    variantsWithData.forEach((variant) => {
      const supportsPallets = variant.show_units_per !== "pack" && variant.units_per_pallet && variant.units_per_pallet > 0;
      initialPriceType[variant.id] = supportsPallets && variant.show_units_per === "pallet" ? "pallet" : "pack";
      initialDisplayPriceType[variant.id] = "unit";
      variant.items.forEach((item) => {
        initialUnits[item.id] = 0;
        initialSelectedTiers[item.id] = null;
      });
    });
    setItemUnits(initialUnits);
    setVariantPriceType(initialPriceType);
    setSelectedTiers(initialSelectedTiers);
    setVariantDisplayPriceType(initialDisplayPriceType);
  }, [variantsWithData]);

  useEffect(() => {
    // Check if any item has units > 0 to show/hide the sticky bar
    const hasUnits = Object.values(itemUnits).some((units) => units > 0);
    setShowStickyBar(hasUnits);
  }, [itemUnits]);

  const findApplicableTier = (variant, units, priceType) => {
    const pricingTiers = variant.pricing_tiers || [];
    const filteredTiers = pricingTiers.filter((tier) => tier.tier_type === priceType);
    if (!filteredTiers.length) return null;

    let quantity = 0;
    if (priceType === "pack") {
      const unitsPerPack = variant.units_per_pack || 1;
      quantity = Math.ceil(units / unitsPerPack);
    } else if (priceType === "pallet") {
      const unitsPerPallet = variant.units_per_pallet || 1;
      quantity = Math.ceil(units / unitsPerPallet);
    }

    filteredTiers.sort((a, b) => a.range_start - b.range_start);
    let applicableTier = filteredTiers[0];
    for (const tier of filteredTiers) {
      if (tier.no_end_range) {
        if (quantity >= tier.range_start) {
          applicableTier = tier;
          break;
        }
      } else if (quantity >= tier.range_start && quantity <= tier.range_end) {
        applicableTier = tier;
        break;
      } else if (quantity > tier.range_end && tier.range_end >= applicableTier.range_end) {
        applicableTier = tier;
      }
    }
    return applicableTier;
  };

  const getHighestPackTierThreshold = (variant) => {
    const pricingTiers = variant.pricing_tiers || [];
    const packTiers = pricingTiers.filter((tier) => tier.tier_type === "pack");
    if (!packTiers.length) return Infinity;

    packTiers.sort((a, b) => b.range_start - b.range_start);
    const highestPackTier = packTiers[0];
    const unitsPerPack = variant.units_per_pack || 1;
    return highestPackTier.range_start * unitsPerPack;
  };

  const calculateTotalPrice = (itemId, variantId, units, tier) => {
    const variant = variantsWithData.find((v) => v.id === variantId);
    if (!variant || !tier || units <= 0) {
      setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
      setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
      return 0;
    }

    const pricingData = variant.items
      .find((i) => i.id === itemId)
      .pricing_tier_data.find((ptd) => ptd.pricing_tier.id === tier.id);
    if (!pricingData) return 0;

    const price = Number(pricingData.price);
    let totalPrice = 0;
    let totalPackPrice = 0;

    const unitsPerPack = variant.units_per_pack || 1;
    const numberOfPacks = Math.ceil(units / unitsPerPack);
    const packPrice = price * unitsPerPack;

    if (tier.tier_type === "pack") {
      totalPrice = price * units;
      totalPackPrice = packPrice * numberOfPacks;
    } else if (tier.tier_type === "pallet") {
      const unitsPerPallet = variant.units_per_pallet || 1;
      const numberOfPallets = Math.ceil(units / unitsPerPallet);
      totalPrice = price * unitsPerPallet * numberOfPallets;
      totalPackPrice = packPrice * numberOfPacks;
    }

    setItemPrices((prev) => ({ ...prev, [itemId]: totalPrice }));
    setItemPackPrices((prev) => ({ ...prev, [itemId]: totalPackPrice }));
    return totalPrice;
  };

  const handleUnitChange = (itemId, variantId, change) => {
    const variant = variantsWithData.find((v) => v.id === variantId);
    if (!variant) return;

    let currentPriceType = variantPriceType[variantId] || "pack";
    const unitsPerPack = variant.units_per_pack || 1;
    const unitsPerPallet = variant.units_per_pallet && variant.units_per_pallet > 0 ? variant.units_per_pallet : null;
    const supportsPallets = variant.show_units_per !== "pack" && unitsPerPallet !== null;
    const currentUnits = itemUnits[itemId] || 0;
    let newUnits = currentUnits;

    if (!supportsPallets && currentPriceType === "pallet") {
      currentPriceType = "pack";
      setVariantPriceType((prev) => ({ ...prev, [variantId]: "pack" }));
    }

    const highestPackThreshold = getHighestPackTierThreshold(variant);
    const minPalletUnits = unitsPerPallet || Infinity;
    const numberOfPallets = unitsPerPallet ? currentUnits / unitsPerPallet : 0;

    if (currentPriceType === "pallet" && supportsPallets) {
      if (change < 0) {
        if (currentUnits === minPalletUnits) {
          currentPriceType = "pack";
          setVariantPriceType((prev) => ({ ...prev, [variantId]: "pack" }));
          newUnits = Math.max(0, currentUnits - unitsPerPack);
        } else {
          newUnits = Math.max(minPalletUnits, currentUnits + (change * unitsPerPallet));
        }
      } else {
        newUnits = currentUnits + (change * unitsPerPallet);
      }
    } else {
      newUnits = Math.max(0, currentUnits + (change * unitsPerPack));
    }

    const newNumberOfPallets = unitsPerPallet ? newUnits / unitsPerPallet : 0;
    if (currentPriceType === "pack" && supportsPallets) {
      if (newUnits > highestPackThreshold && newNumberOfPallets >= 1) {
        currentPriceType = "pallet";
        setVariantPriceType((prev) => ({ ...prev, [variantId]: "pallet" }));
      }
    } else if (currentPriceType === "pallet" && supportsPallets) {
      if (newUnits < minPalletUnits && newUnits <= highestPackThreshold) {
        currentPriceType = "pack";
        setVariantPriceType((prev) => ({ ...prev, [variantId]: "pack" }));
      }
    }

    setItemUnits((prev) => ({ ...prev, [itemId]: newUnits }));

    if (newUnits === 0) {
      setSelectedTiers((prev) => ({ ...prev, [itemId]: null }));
      setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
      setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
      return;
    }

    const applicableTier = findApplicableTier(variant, newUnits, currentPriceType);
    if (applicableTier) {
      setSelectedTiers((prev) => ({ ...prev, [itemId]: applicableTier.id }));
      calculateTotalPrice(itemId, variantId, newUnits, applicableTier);
    }
  };

  const handlePriceTypeChange = (variantId, pricePer) => {
    const variant = variantsWithData.find((v) => v.id === variantId);
    if (!variant) return;

    const supportsPallets = variant.show_units_per !== "pack" && variant.units_per_pallet && variant.units_per_pallet > 0;
    if (pricePer === "pallet" && !supportsPallets) {
      return;
    }

    setVariantPriceType((prev) => ({ ...prev, [variantId]: pricePer }));

    variant.items.forEach((item) => {
      const units = itemUnits[item.id] || 0;
      if (units > 0) {
        const applicableTier = findApplicableTier(variant, units, pricePer);
        if (applicableTier) {
          setSelectedTiers((prev) => ({ ...prev, [item.id]: applicableTier.id }));
          calculateTotalPrice(item.id, variantId, units, applicableTier);
        }
      }
    });
  };

  const handlePriceClick = (itemId, variantId, price, tier) => {
    const variant = variantsWithData.find((v) => v.id === variantId);
    if (!variant) return;

    let currentPriceType = variantPriceType[variantId] || "pack";
    const supportsPallets = variant.show_units_per !== "pack" && variant.units_per_pallet && variant.units_per_pallet > 0;

    if (tier.tier_type === "pack" && currentPriceType === "pallet") {
      currentPriceType = "pack";
      setVariantPriceType((prev) => ({ ...prev, [variantId]: "pack" }));
    } else if (tier.tier_type === "pallet" && currentPriceType === "pack" && supportsPallets) {
      currentPriceType = "pallet";
      setVariantPriceType((prev) => ({ ...prev, [variantId]: "pallet" }));
    }

    const unitsPer = currentPriceType === "pack" ? (variant.units_per_pack || 1) : (variant.units_per_pallet || 1);
    const newUnits = tier.range_start * unitsPer;
    setItemUnits((prev) => ({ ...prev, [itemId]: newUnits }));
    setSelectedTiers((prev) => ({ ...prev, [itemId]: tier.id }));
    calculateTotalPrice(itemId, variantId, newUnits, tier);
  };

  const toggleDisplayPriceType = (variantId) => {
    setVariantDisplayPriceType((prev) => ({
      ...prev,
      [variantId]: prev[variantId] === "unit" ? "pack" : "unit",
    }));
  };

  // Calculate total and gather items for the sticky bar
  const selectedItems = [];
  let totalPrice = 0;
  variantsWithData.forEach((variant) => {
    const currentDisplayPriceType = variantDisplayPriceType[variant.id] || "unit";
    variant.items.forEach((item) => {
      const units = itemUnits[item.id] || 0;
      if (units > 0) {
        const unitsPerPack = variant.units_per_pack || 1;
        const numberOfPacks = Math.ceil(units / unitsPerPack);
        const subtotal = currentDisplayPriceType === "unit" ? itemPrices[item.id] || 0 : itemPackPrices[item.id] || 0;
        totalPrice += subtotal;
        selectedItems.push({
          id: item.id,
          description: item.title || "Item",
          packs: numberOfPacks,
          units: units,
          subtotal: subtotal,
        });
      }
    });
  });

  return (
    <div className={TableStyles.tableContentWrapper}>
      {variantsWithData.length === 0 && <div>No product variants available.</div>}
      {variantsWithData.map((variant) => {
        const pricingTiers = variant.pricing_tiers || [];
        pricingTiers.sort((a, b) => {
          if (a.tier_type === b.tier_type) {
            return a.range_start - b.range_start;
          }
          return a.tier_type === "pack" ? -1 : 1;
        });

        const currentPriceType = variantPriceType[variant.id] || "pack";
        const currentDisplayPriceType = variantDisplayPriceType[variant.id] || "unit";
        const unitsToShow =
          currentPriceType === "pack" ? variant.units_per_pack : variant.units_per_pallet;

        return (
          <div key={variant.id} className={TableStyles.tableContainer}>
            <h4>{variant.name}</h4>
            {variant.tableFields.length > 0 && variant.items.every((item) => !item.data_entries || item.data_entries.length === 0) && (
              <div className="warning" style={{ color: 'red', marginBottom: '10px' }}>
                No ItemData entries found for this variant's items. Please add ItemData in the admin panel.
              </div>
            )}
            <table className={TableStyles.table}>
              <thead>
                <tr>
                  <th className="l3 clr-accent-dark-blue">SKU</th>
                  {/* <th className="l3 clr-accent-dark-blue">Physical Product</th>
                  <th className="l3 clr-accent-dark-blue">Weight</th>
                  <th className="l3 clr-accent-dark-blue">Weight Unit</th>
                  <th className="l3 clr-accent-dark-blue">Track Inventory</th>
                  <th className="l3 clr-accent-dark-blue">Stock</th>
                  <th className="l3 clr-accent-dark-blue">Title</th>
                  <th className="l3 clr-accent-dark-blue">Status</th> */}
                  {variant.tableFields.map((field) => (
                    <th key={field.id} className="l3 clr-accent-dark-blue">{field.name}</th>
                  ))}
                  {pricingTiers.map((tier) => (
                    <th key={tier.id} className="l3 clr-accent-dark-blue">
                      {tier.tier_type === 'pack' ? 'Packs' : 'Pallets'} {tier.range_start}
                      {tier.no_end_range ? '+' : `-${tier.range_end}`}
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
                        {variant.show_units_per !== "pack" && variant.units_per_pallet && variant.units_per_pallet > 0 && (
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
                  <th className="l3 clr-accent-dark-blue">
                    <div className={TableStyles.thWithButtons}>
                      Total Price
                      <span className={TableStyles.thButtonsWrapper}>
                        <button
                          className={`${TableStyles.thButton} text-medium ${
                            currentDisplayPriceType === "unit" ? "active" : ""
                          }`}
                          onClick={() => toggleDisplayPriceType(variant.id)}
                        >
                          Per Unit
                        </button>
                        <button
                          className={`${TableStyles.thButton} text-medium ${
                            currentDisplayPriceType === "pack" ? "active" : ""
                          }`}
                          onClick={() => toggleDisplayPriceType(variant.id)}
                        >
                          Per Pack
                        </button>
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {variant.items.map((item) => {
                  console.log(`Item ${item.id} (SKU: ${item.sku}) data_entries:`, item.data_entries || []);
                  return (
                    <tr key={item.id}>
                      <td className="c3">{item.sku}</td>
                      {/* <td className="c3">{item.is_physical_product ? "Yes" : "No"}</td>
                      <td className="c3">{item.weight || "-"}</td>
                      <td className="c3">{item.weight_unit || "-"}</td>
                      <td className="c3">{item.track_inventory ? "Yes" : "No"}</td>
                      <td className="c3">{item.stock || "-"}</td>
                      <td className="c3">{item.title || "-"}</td>
                      <td className="c3">{item.status}</td> */}
                      {variant.tableFields.map((field) => {
                        const itemData = (item.data_entries || []).find(
                          (data) => {
                            const match = Number(data.field.id) === Number(field.id);
                            console.log(
                              `Field ${field.id} (${field.name}, type: ${field.field_type}):`,
                              { itemData: data, match, dataFieldId: data?.field.id, tableFieldId: field.id }
                            );
                            return match;
                          }
                        );
                        return (
                          <td key={field.id} className="c3">
                            {itemData ? (
                              field.field_type === 'image' && itemData.value_image ? (
                                <img
                                  src={itemData.value_image}
                                  alt={field.name}
                                  className={TableStyles.colImageContainer}
                                  style={{ maxWidth: '50px', maxHeight: '50px' }}
                                  onError={(e) => (e.target.src = '/fallback-image.jpg')}
                                />
                              ) : field.field_type === 'price' && itemData.value_number != null ? (
                                `€${Number(itemData.value_number).toFixed(2)}`
                              ) : field.field_type === 'number' && itemData.value_number != null ? (
                                itemData.value_number
                              ) : itemData.value_text ? (
                                itemData.value_text.replace(/\r\n/g, ' ')
                              ) : (
                                "-"
                              )
                            ) : "-"}
                          </td>
                        );
                      })}
                      {pricingTiers.map((tier) => {
                        const pricingData = (item.pricing_tier_data || []).find(
                          (ptd) => ptd.pricing_tier.id === tier.id
                        ) || tier.pricing_data.find((pd) => pd.item === item.id);
                        if (!pricingData) return <td key={tier.id} className="c3">-</td>;

                        const price = Number(pricingData.price);
                        let displayPrice;
                        if (currentDisplayPriceType === "unit") {
                          displayPrice = `€${price.toFixed(2)}`;
                        } else {
                          const unitsPerPack = variant.units_per_pack || 1;
                          const packPrice = price * unitsPerPack;
                          displayPrice = `€${packPrice.toFixed(2)}`;
                        }

                        return (
                          <td key={tier.id} className="c3">
                            <button
                              className={TableStyles.priceButton}
                              onClick={() => handlePriceClick(item.id, variant.id, price, tier)}
                              aria-current={selectedTiers[item.id] === tier.id ? "true" : "false"}
                              aria-label={`Select price ${displayPrice} for ${tier.tier_type} tier ${tier.range_start}${tier.no_end_range ? '+' : `-${tier.range_end}`}`}
                            >
                              {displayPrice}
                            </button>
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
                        {currentDisplayPriceType === "unit"
                          ? itemPrices[item.id]
                            ? `€${itemPrices[item.id].toFixed(2)}`
                            : "-"
                          : itemPackPrices[item.id]
                          ? `€${itemPackPrices[item.id].toFixed(2)}`
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* Sticky Bottom Bar */}
      {showStickyBar && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#fff',
            borderTop: '1px solid #ccc',
            boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
            padding: '10px 20px',
            zIndex: 1000,
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>1 item(s)</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>Packs</th>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: 'bold' }}>Units</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ textAlign: 'left', padding: '8px' }}>{item.description}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{1}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{item.packs}</td>
                  <td style={{ textAlign: 'center', padding: '8px' }}>{item.units}</td>
                  <td style={{ textAlign: 'right', padding: '8px' }}>
                    £{item.subtotal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <button
                style={{
                  backgroundColor: '#f5a623',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  marginRight: '10px',
                  cursor: 'pointer',
                }}
              >
                Add & continue
              </button>
              <button
                style={{
                  backgroundColor: '#28a745',
                  color: '#fff',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Checkout now 🛒
              </button>
            </div>
            <div style={{ fontWeight: 'bold' }}>
              TOTAL £{totalPrice.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;