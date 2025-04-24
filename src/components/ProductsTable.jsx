import React, { useState, useEffect } from "react";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Plus, Package, Archive } from "lucide-react";
import { getUserExclusivePrice } from "utils/api/ecommerce";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Notification from "components/Notification";
import ImagePreview from "components/ImagePreview";
import { addToCart } from "utils/cartSlice";

const ProductsTable = ({ variantsWithData }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [itemUnits, setItemUnits] = useState({});
  const [variantPriceType, setVariantPriceType] = useState({});
  const [itemPrices, setItemPrices] = useState({});
  const [itemPackPrices, setItemPackPrices] = useState({});
  const [selectedTiers, setSelectedTiers] = useState({});
  const [variantDisplayPriceType, setVariantDisplayPriceType] = useState({});
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [exclusiveDiscounts, setExclusiveDiscounts] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });
  const [selectedImages, setSelectedImages] = useState(null);
  const [imageLoadFailed, setImageLoadFailed] = useState({});

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
    const hasUnits = Object.values(itemUnits).some((units) => units > 0);
    setShowStickyBar(hasUnits);
  }, [itemUnits]);

  useEffect(() => {
    if (!isLoggedIn || !variantsWithData.length) return;

    const abortController = new AbortController();
    const fetchExclusivePrices = async () => {
      const discounts = {};
      for (const variant of variantsWithData) {
        for (const item of variant.items) {
          try {
            const exclusivePrices = await getUserExclusivePrice(item.id, abortController.signal);
            if (exclusivePrices.length > 0) {
              const discountPercentage = Number(exclusivePrices[0].discount_percentage);
              discounts[item.id] = discountPercentage;
            }
          } catch (error) {
            console.warn(`Failed to fetch exclusive price for item ${item.id}:`, error.message);
          }
        }
      }
      setExclusiveDiscounts(discounts);
    };

    fetchExclusivePrices();

    return () => abortController.abort();
  }, [isLoggedIn, variantsWithData]);

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const findApplicableTier = (variant, units, priceType) => {
    const pricingTiers = variant.pricing_tiers || [];
    const filteredTiers = pricingTiers.filter((tier) => tier.tier_type === priceType);
    if (!filteredTiers.length) {
      console.warn(`No pricing tiers found for price type ${priceType}`);
      return null;
    }

    let quantity = 0;
    if (priceType === "pack") {
      const unitsPerPack = variant.units_per_pack || 1;
      quantity = Math.ceil(units / unitsPerPack);
    } else if (priceType === "pallet") {
      const unitsPerPallet = variant.units_per_pallet || 1;
      quantity = Math.ceil(units / unitsPerPallet);
    }

    filteredTiers.sort((a, b) => a.range_start - b.range_start);
    let applicableTier = null;

    for (const tier of filteredTiers) {
      if (tier.no_end_range) {
        if (quantity >= tier.range_start) {
          applicableTier = tier;
          break;
        }
      } else if (quantity >= tier.range_start && (tier.range_end === null || quantity <= tier.range_end)) {
        applicableTier = tier;
        break;
      }
    }

    if (!applicableTier) {
      applicableTier = filteredTiers
        .filter((tier) => tier.range_start <= quantity)
        .sort((a, b) => b.range_start - a.range_start)[0];
      if (!applicableTier) {
        applicableTier = filteredTiers[0];
        console.warn(`No tier matches quantity ${quantity} for price type ${priceType}, falling back to tier ID ${applicableTier?.id}`);
      }
    }

    return applicableTier;
  };

  const getHighestPackTierThreshold = (variant) => {
    const pricingTiers = variant.pricing_tiers || [];
    const packTiers = pricingTiers.filter((tier) => tier.tier_type === "pack");
    if (!packTiers.length) return Infinity;

    packTiers.sort((a, b) => b.range_start - a.range_start);
    const highestPackTier = packTiers[0];
    const unitsPerPack = variant.units_per_pack || 1;
    return highestPackTier.range_start * unitsPerPack;
  };

  const applyDiscount = (price, itemId) => {
    const discountPercentage = exclusiveDiscounts[itemId] || 0;
    return price * (1 - discountPercentage / 100);
  };

  const calculateTotalPrice = (itemId, variantId, units, tier, price) => {
    const variant = variantsWithData.find((v) => v.id === variantId);
    if (!variant || !tier || units <= 0 || !isFinite(price)) {
      setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
      setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
      return 0;
    }

    const unitsPerPack = variant.units_per_pack || 1;
    const numberOfPacks = Math.ceil(units / unitsPerPack);
    // Use the discounted price directly; do not reapply discount
    const packPrice = price * unitsPerPack;
    const totalPrice = price * units;
    const totalPackPrice = packPrice * numberOfPacks;

    setItemPrices((prev) => ({ ...prev, [itemId]: totalPrice }));
    setItemPackPrices((prev) => ({ ...prev, [itemId]: totalPackPrice }));
    return totalPrice;
  };

  const handleUnitChange = (itemId, variantId, change) => {
    const variant = variantsWithData.find((v) => v.id === variantId);
    if (!variant) {
      console.warn(`Variant ID ${variantId} not found`);
      return;
    }

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
    if (currentPriceType === "pack" && supportsPallets && newUnits > highestPackThreshold && newNumberOfPallets >= 1) {
      currentPriceType = "pallet";
      setVariantPriceType((prev) => ({ ...prev, [variantId]: "pallet" }));
    } else if (currentPriceType === "pallet" && supportsPallets && newUnits < minPalletUnits && newUnits <= highestPackThreshold) {
      currentPriceType = "pack";
      setVariantPriceType((prev) => ({ ...prev, [variantId]: "pack" }));
    }

    setItemUnits((prev) => ({ ...prev, [itemId]: newUnits }));

    if (newUnits === 0) {
      setSelectedTiers((prev) => ({ ...prev, [itemId]: null }));
      setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
      setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
      setShowStickyBar(Object.values({ ...itemUnits, [itemId]: 0 }).some((units) => units > 0));
      return;
    }

    const applicableTier = findApplicableTier(variant, newUnits, currentPriceType);
    let price = 0;

    if (applicableTier) {
      const pricingData = applicableTier.pricing_data?.find((pd) => pd.item === itemId);
      if (pricingData && isFinite(parseFloat(pricingData.price))) {
        // Apply user-specific discount once here
        price = applyDiscount(parseFloat(pricingData.price), itemId);
        setSelectedTiers((prev) => ({ ...prev, [itemId]: applicableTier.id }));
      } else {
        // Try fallback tier
        const fallbackTier = variant.pricing_tiers?.find((tier) => tier.tier_type === currentPriceType);
        if (fallbackTier) {
          const fallbackPricingData = fallbackTier.pricing_data?.find((pd) => pd.item === itemId);
          if (fallbackPricingData && isFinite(parseFloat(fallbackPricingData.price))) {
            // Apply user-specific discount once here
            price = applyDiscount(parseFloat(fallbackPricingData.price), itemId);
            setSelectedTiers((prev) => ({ ...prev, [itemId]: fallbackTier.id }));
          } else {
            console.warn(`No valid pricing data found for fallback tier ${fallbackTier.id} for item ${itemId}`);
            price = 0;
          }
        } else {
          console.warn(`No pricing tiers available for price type ${currentPriceType} for item ${itemId}`);
          price = 0;
        }
      }
    } else {
      console.warn(`No applicable tier found for ${newUnits} units and price type ${currentPriceType}`);
      price = 0;
    }

    if (applicableTier && price > 0) {
      setShowStickyBar(true);
      calculateTotalPrice(itemId, variantId, newUnits, applicableTier, price);
    } else {
      console.warn(`Price calculation failed for item ${itemId}: price=${price}, applicableTier=`, applicableTier);
      setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
      setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
      setShowStickyBar(Object.values({ ...itemUnits, [itemId]: newUnits }).some((units) => units > 0));
    }
  };

  const handlePriceTypeChange = (variantId, pricePer) => {
    setVariantPriceType((prev) => ({ ...prev, [variantId]: pricePer }));
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
    setShowStickyBar(true);

    // Apply user-specific discount once here
    const discountedPrice = applyDiscount(price, itemId);
    calculateTotalPrice(itemId, variantId, newUnits, tier, discountedPrice);
  };

  const toggleDisplayPriceType = (variantId, priceType) => {
    setVariantDisplayPriceType((prev) => ({
      ...prev,
      [variantId]: priceType,
    }));
  };

  const openImagePreview = (images) => {
    setSelectedImages(images);
  };

  const closeImagePreview = () => {
    setSelectedImages(null);
  };

  const handleImageError = (itemId) => {
    setImageLoadFailed((prev) => ({ ...prev, [itemId]: true }));
  };

  const handleAddToCart = () => {
    if (selectedItems.length === 0) {
      showNotification("No items selected to add to cart.", "error");
      return;
    }
    dispatch(addToCart(selectedItems));
    showNotification("Items added to cart successfully!", "success");
    navigate("/cart");
  };

  const selectedItems = [];
  let totalPrice = 0;
  variantsWithData.forEach((variant) => {
    const currentDisplayPriceType = variantDisplayPriceType[variant.id] || "unit";
    variant.items.forEach((item) => {
      const units = itemUnits[item.id] || 0;
      if (units > 0) {
        const unitsPerPack = variant.units_per_pack || 1;
        const numberOfPacks = Math.ceil(units / unitsPerPack);
        const subtotal = itemPrices[item.id] || 0;
        const packSubtotal = itemPackPrices[item.id] || 0;
        const primaryImage = item.images?.[0]?.image || "/fallback-image.jpg";
        totalPrice += subtotal;
        selectedItems.push({
          id: item.id,
          description: item.title || "Item",
          packs: numberOfPacks,
          units: units,
          subtotal: subtotal,
          packSubtotal: packSubtotal,
          displayPriceType: currentDisplayPriceType,
          variantId: variant.id,
          image: primaryImage,
        });
      }
    });
  });

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification message={notification.message} type={notification.type} visible={notification.visible} />
      {variantsWithData.length === 0 && <div className="b3 clr-text">No product variants available.</div>}
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
        const unitsToShow = currentPriceType === "pack" ? variant.units_per_pack : variant.units_per_pallet;

        return (
          <div key={variant.id}>
            <h3 className="clr-text">{variant.name}</h3>
            {variant.tableFields.length > 0 && variant.items.every((item) => !item.data_entries || item.data_entries.length === 0) && (
              <div className={`${TableStyles.warning} b3 clr-danger`}>No ItemData entries found for this variant's items. Please add ItemData in the admin panel.</div>
            )}
            <div className={TableStyles.tableContainer}>
              <div className={TableStyles.tableWrapper}>
                <table className={TableStyles.table}>
                  <thead>
                    <tr>
                      <th className={`${TableStyles.defaultHeader} l3 clr-text`}>Image</th>
                      <th className={`${TableStyles.defaultHeader} l3 clr-text`}>SKU</th>
                      {variant.tableFields.map((field) => (
                        <th key={field.id} className={`${TableStyles.defaultHeader} l3 clr-text`}>{field.name}</th>
                      ))}
                      {pricingTiers.map((tier) => (
                        <th key={tier.id} className={`${TableStyles.pricingTierHeader} l3 clr-text`}>
                          {tier.tier_type === "pack" ? "Packs" : "Pallets"} {tier.range_start}
                          {tier.no_end_range ? "+" : `-${tier.range_end}`}
                        </th>
                      ))}
                      <th className={`${TableStyles.unitsPerHeader} l3 clr-text`}>
                        <div className={TableStyles.thWithButtons}>
                          Units per
                          <span className={TableStyles.thButtonsWrapper}>
                            <button
                              className={`${TableStyles.thButton} b3 clr-text ${currentPriceType === "pack" ? TableStyles.active : ""}`}
                              onClick={() => handlePriceTypeChange(variant.id, "pack")}
                            >
                              <Package className="icon-xms" /> Pack
                            </button>
                            {variant.show_units_per !== "pack" && variant.units_per_pallet && (
                              <button
                                className={`${TableStyles.thButton} b3 clr-text ${currentPriceType === "pallet" ? TableStyles.active : ""}`}
                                onClick={() => handlePriceTypeChange(variant.id, "pallet")}
                              >
                                <Archive className="icon-xms" /> Pallet
                              </button>
                            )}
                          </span>
                        </div>
                      </th>
                      <th className={`${TableStyles.unitsInputHeader} l3 clr-text`}>Enter No. of Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.items.map((item) => {
                      const images = item.images?.map((img) => img.image) || [];
                      const primaryImage = images.length > 0 ? images[0] : "/fallback-image.jpg";
                      const hasImageFailed = imageLoadFailed[item.id];

                      return (
                        <tr key={item.id} className={itemUnits[item.id] > 0 ? TableStyles.selectedRow : ""}>
                          <td className="b3 clr-text">
                            {hasImageFailed ? (
                              <span className="b3 clr-gray">Image Not Available</span>
                            ) : (
                              <img
                                src={primaryImage}
                                alt={`${item.sku} primary image`}
                                className={TableStyles.colImageContainer}
                                onClick={() => images.length > 0 && openImagePreview(images)}
                                style={{ cursor: images.length > 0 ? "pointer" : "default" }}
                                onError={() => handleImageError(item.id)}
                              />
                            )}
                          </td>
                          <td className="b3 clr-text">{item.sku}</td>
                          {variant.tableFields.map((field) => {
                            const itemData = (item.data_entries || []).find(
                              (data) => Number(data.field.id) === Number(field.id)
                            );
                            return (
                              <td key={field.id} className="b3 clr-text">
                                {itemData ? (
                                  field.field_type === "image" && itemData.value_image ? (
                                    hasImageFailed ? (
                                      <span className="b3 clr-gray">Image Not Available</span>
                                    ) : (
                                      <img
                                        src={itemData.value_image}
                                        alt={field.name}
                                        className={TableStyles.colImageContainer}
                                        onError={() => handleImageError(item.id)}
                                      />
                                    )
                                  ) : field.field_type === "price" && itemData.value_number != null ? (
                                    `£${Number(itemData.value_number).toFixed(2)}`
                                  ) : field.field_type === "number" && itemData.value_number != null ? (
                                    itemData.value_number
                                  ) : itemData.value_text ? (
                                    itemData.value_text.replace(/\r\n/g, " ")
                                  ) : (
                                    "-"
                                  )
                                ) : "-"}
                              </td>
                            );
                          })}
                          {pricingTiers.map((tier) => {
                            const pricingData = tier.pricing_data?.find((pd) => pd.item === item.id);
                            if (!pricingData) return <td key={tier.id} className="b3 clr-gray">-</td>;

                            // Use original price; discount is applied in handlePriceClick
                            let price = parseFloat(pricingData.price);
                            let displayPrice;
                            const hasDiscount = exclusiveDiscounts[item.id] > 0;
                            const exclusivePrice = hasDiscount ? applyDiscount(price, item.id) : null;

                            if (currentDisplayPriceType === "unit") {
                              if (hasDiscount) {
                                displayPrice = (
                                  <>
                                    <span className={TableStyles.originalPrice}>£{price.toFixed(2)}</span>
                                    <span className={TableStyles.exclusivePrice}>£{exclusivePrice.toFixed(2)}</span>
                                  </>
                                );
                              } else {
                                displayPrice = `£${price.toFixed(2)}`;
                              }
                            } else {
                              const unitsPerPack = variant.units_per_pack || 1;
                              const packPrice = price * unitsPerPack;
                              const exclusivePackPrice = hasDiscount ? exclusivePrice * unitsPerPack : null;
                              if (hasDiscount) {
                                displayPrice = (
                                  <>
                                    <span className={TableStyles.originalPrice}>£{packPrice.toFixed(2)}</span>
                                    <span className={TableStyles.exclusivePrice}>£{exclusivePackPrice.toFixed(2)}</span>
                                  </>
                                );
                              } else {
                                displayPrice = `£${packPrice.toFixed(2)}`;
                              }
                            }

                            return (
                              <td key={tier.id} className="b3 clr-text">
                                <button
                                  className={`${TableStyles.priceButton} ${selectedTiers[item.id] === tier.id ? TableStyles.selectedTier : ""}`}
                                  onClick={() => handlePriceClick(item.id, variant.id, price, tier)}
                                  aria-current={selectedTiers[item.id] === tier.id ? "true" : "false"}
                                  aria-label={`Select price ${hasDiscount ? `£${exclusivePrice.toFixed(2)} (was £${price.toFixed(2)})` : `£${price.toFixed(2)}`} for ${tier.tier_type} tier ${tier.range_start}${tier.no_end_range ? "+" : `-${tier.range_end}`}`}
                                >
                                  {displayPrice}
                                </button>
                              </td>
                            );
                          })}
                          <td className="b3 clr-text">{unitsToShow || "-"}</td>
                          <td className="b3 clr-text">
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {selectedImages && <ImagePreview images={selectedImages} onClose={closeImagePreview} />}
      {showStickyBar && (
        <div className={TableStyles.stickyBar}>
          <div className="column-content">
            <div className="centered-layout-wrapper layout-spacing full-width-flex-col">
              <div className="centered-layout page-layout full-width-flex-col gap-m">
                <table className={TableStyles.summaryTable}>
                  <thead>
                    <tr>
                      <th className="b3 clr-text">Description</th>
                      <th className="b3 clr-text">Item(s)</th>
                      <th className="b3 clr-text">Packs</th>
                      <th className="b3 clr-text">Units</th>
                      <th className="b3 clr-text">Price ({selectedItems[0]?.displayPriceType || "unit"})</th>
                      <th className="b3 clr-text">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="b3 clr-text">{item.description}</td>
                        <td className="b3 clr-text">{1}</td>
                        <td className="b3 clr-text">{item.packs}</td>
                        <td className="b3 clr-text">{item.units}</td>
                        <td className="b3 clr-text">
                          £{(
                            item.displayPriceType === "unit"
                              ? (item.subtotal / item.units)
                              : (item.packSubtotal / item.packs)
                          ).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                        </td>
                        <td className="b3 clr-text">
                          £{(
                            item.displayPriceType === "unit" ? item.subtotal : item.packSubtotal
                          ).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={TableStyles.stickyBarActions}>
                  <div>
                    <button
                      className={`${TableStyles.actionButton} b3 clr-text`}
                      onClick={handleAddToCart}
                    >
                      Add & continue
                    </button>
                  </div>
                  <div className="b3 clr-text">
                    TOTAL £{totalPrice.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
