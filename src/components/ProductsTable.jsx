import React, { useState, useEffect, useCallback, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import TableStyles from "assets/css/TableStyles.module.css";
import { Package, Archive, Plus, Minus } from "lucide-react";
import { getUserExclusivePrice } from "utils/api/ecommerce";
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
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });
  const [selectedImages, setSelectedImages] = useState(null);
  const [imageLoadFailed, setImageLoadFailed] = useState({});

  useEffect(() => {
    const initialUnits = {};
    const initialPriceType = {};
    const initialSelectedTiers = {};
    const initialDisplayPriceType = {};
    variantsWithData.forEach((variant) => {
      const supportsPallets =
        variant.show_units_per !== "pack" && variant.units_per_pallet > 0;
      initialPriceType[variant.id] =
        supportsPallets && variant.show_units_per === "pallet"
          ? "pallet"
          : "pack";
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
            const exclusivePrices = await getUserExclusivePrice(
              item.id,
              abortController.signal
            );
            if (exclusivePrices.length > 0) {
              discounts[item.id] = Number(
                exclusivePrices[0].discount_percentage
              );
            }
          } catch (error) {
            if (error.name !== "AbortError") {
              console.warn(
                `Failed to fetch exclusive price for item ${item.id}:`,
                error.message
              );
            }
          }
        }
      }
      setExclusiveDiscounts(discounts);
    };
    fetchExclusivePrices();
    return () => abortController.abort();
  }, [isLoggedIn, variantsWithData]);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, visible: false })),
      3000
    );
  }, []);

  const findApplicableTier = useCallback((variant, units, priceType) => {
    const pricingTiers = variant.pricing_tiers || [];
    const filteredTiers = pricingTiers.filter(
      (tier) => tier.tier_type === priceType
    );
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
    return (
      filteredTiers.find((tier) =>
        tier.no_end_range
          ? quantity >= tier.range_start
          : quantity >= tier.range_start &&
            (tier.range_end === null || quantity <= tier.range_end)
      ) ||
      filteredTiers.sort((a, b) => b.range_start - a.range_start)[0] ||
      filteredTiers[0]
    );
  }, []);

  const applyDiscount = useCallback(
    (price, itemId) => {
      const discountPercentage = exclusiveDiscounts[itemId] || 0;
      return price * (1 - discountPercentage / 100);
    },
    [exclusiveDiscounts]
  );

  const calculateTotalPrice = useCallback(
    (itemId, variantId, units, tier, price) => {
      const variant = variantsWithData.find((v) => v.id === variantId);
      if (!variant || !tier || units <= 0 || !isFinite(price)) {
        setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
        setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
        return 0;
      }

      const unitsPerPack = variant.units_per_pack || 1;
      const numberOfPacks = Math.ceil(units / unitsPerPack);
      const packPrice = price * unitsPerPack;
      const totalPrice = price * units;
      const totalPackPrice = packPrice * numberOfPacks;

      setItemPrices((prev) => ({ ...prev, [itemId]: totalPrice }));
      setItemPackPrices((prev) => ({ ...prev, [itemId]: totalPackPrice }));
      return totalPrice;
    },
    [variantsWithData]
  );

  const handleUnitChange = useCallback(
    (itemId, variantId, value) => {
      const variant = variantsWithData.find((v) => v.id === variantId);
      if (!variant) return;

      const currentPriceType = variantPriceType[variantId] || "pack";
      const unitsPerPack = variant.units_per_pack || 1;
      const unitsPerPallet = variant.units_per_pallet || Infinity;
      const supportsPallets =
        variant.show_units_per !== "pack" && unitsPerPallet > 0;
      const parsedValue = parseInt(value, 10);
      let newUnits = isNaN(parsedValue) || parsedValue < 0 ? 0 : parsedValue;

      // Round to nearest pack or pallet
      if (currentPriceType === "pallet" && supportsPallets) {
        newUnits = Math.round(newUnits / unitsPerPallet) * unitsPerPallet;
      } else {
        newUnits = Math.round(newUnits / unitsPerPack) * unitsPerPack;
      }

      setItemUnits((prev) => ({ ...prev, [itemId]: newUnits }));

      if (newUnits === 0) {
        setSelectedTiers((prev) => ({ ...prev, [itemId]: null }));
        setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
        setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
        setShowStickyBar(
          Object.values({ ...itemUnits, [itemId]: 0 }).some(
            (units) => units > 0
          )
        );
        return;
      }

      const applicableTier = findApplicableTier(
        variant,
        newUnits,
        currentPriceType
      );
      let price = 0;

      if (applicableTier) {
        const pricingData = applicableTier.pricing_data?.find(
          (pd) => pd.item === itemId
        );
        if (pricingData && isFinite(parseFloat(pricingData.price))) {
          price = applyDiscount(parseFloat(pricingData.price), itemId);
          setSelectedTiers((prev) => ({
            ...prev,
            [itemId]: applicableTier.id,
          }));
        } else {
          const fallbackTier = variant.pricing_tiers?.find(
            (tier) => tier.tier_type === currentPriceType
          );
          if (fallbackTier) {
            const fallbackPricingData = fallbackTier.pricing_data?.find(
              (pd) => pd.item === itemId
            );
            if (
              fallbackPricingData &&
              isFinite(parseFloat(fallbackPricingData.price))
            ) {
              price = applyDiscount(
                parseFloat(fallbackPricingData.price),
                itemId
              );
              setSelectedTiers((prev) => ({
                ...prev,
                [itemId]: fallbackTier.id,
              }));
            }
          }
        }
      }

      if (applicableTier && price > 0) {
        setShowStickyBar(true);
        calculateTotalPrice(itemId, variantId, newUnits, applicableTier, price);
      } else {
        setItemPrices((prev) => ({ ...prev, [itemId]: 0 }));
        setItemPackPrices((prev) => ({ ...prev, [itemId]: 0 }));
        setShowStickyBar(
          Object.values({ ...itemUnits, [itemId]: newUnits }).some(
            (units) => units > 0
          )
        );
      }
    },
    [
      variantPriceType,
      calculateTotalPrice,
      findApplicableTier,
      applyDiscount,
      itemUnits,
      variantsWithData,
    ]
  );

  const handleIncrement = useCallback(
    (itemId, variantId) => {
      const variant = variantsWithData.find((v) => v.id === variantId);
      if (!variant) return;

      const currentPriceType = variantPriceType[variantId] || "pack";
      const unitsPerPack = variant.units_per_pack || 1;
      const unitsPerPallet = variant.units_per_pallet || Infinity;
      const supportsPallets =
        variant.show_units_per !== "pack" && unitsPerPallet > 0;
      const currentUnits = itemUnits[itemId] || 0;
      const increment =
        currentPriceType === "pallet" && supportsPallets
          ? unitsPerPallet
          : unitsPerPack;

      const newUnits = currentUnits + increment;
      handleUnitChange(itemId, variantId, newUnits.toString());
    },
    [itemUnits, variantPriceType, variantsWithData, handleUnitChange]
  );

  const handleDecrement = useCallback(
    (itemId, variantId) => {
      const variant = variantsWithData.find((v) => v.id === variantId);
      if (!variant) return;

      const currentPriceType = variantPriceType[variantId] || "pack";
      const unitsPerPack = variant.units_per_pack || 1;
      const unitsPerPallet = variant.units_per_pallet || Infinity;
      const supportsPallets =
        variant.show_units_per !== "pack" && unitsPerPallet > 0;
      const currentUnits = itemUnits[itemId] || 0;
      const decrement =
        currentPriceType === "pallet" && supportsPallets
          ? unitsPerPallet
          : unitsPerPack;

      const newUnits = Math.max(0, currentUnits - decrement);
      handleUnitChange(itemId, variantId, newUnits.toString());
    },
    [itemUnits, variantPriceType, variantsWithData, handleUnitChange]
  );

  const handlePriceTypeChange = useCallback((variantId, pricePer) => {
    setVariantPriceType((prev) => ({ ...prev, [variantId]: pricePer }));
  }, []);

  const handlePriceClick = useCallback(
    (itemId, variantId, price, tier) => {
      const variant = variantsWithData.find((v) => v.id === variantId);
      if (!variant) return;

      const currentPriceType = tier.tier_type;
      setVariantPriceType((prev) => ({
        ...prev,
        [variantId]: currentPriceType,
      }));
      const unitsPer =
        currentPriceType === "pack"
          ? variant.units_per_pack || 1
          : variant.units_per_pallet || 1;
      const newUnits = tier.range_start * unitsPer;

      setItemUnits((prev) => ({ ...prev, [itemId]: newUnits }));
      setSelectedTiers((prev) => ({ ...prev, [itemId]: tier.id }));
      setShowStickyBar(true);

      const discountedPrice = applyDiscount(price, itemId);
      calculateTotalPrice(itemId, variantId, newUnits, tier, discountedPrice);
    },
    [calculateTotalPrice, applyDiscount, variantsWithData]
  );

  const toggleDisplayPriceType = useCallback((variantId, priceType) => {
    setVariantDisplayPriceType((prev) => ({ ...prev, [variantId]: priceType }));
  }, []);

  const openImagePreview = useCallback((images) => {
    setSelectedImages(images);
  }, []);

  const closeImagePreview = useCallback(() => {
    setSelectedImages(null);
  }, []);

  const handleImageError = useCallback((itemId) => {
    setImageLoadFailed((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  const computeSelectedItems = useCallback(() => {
    const items = [];
    let totalPrice = 0;
    variantsWithData.forEach((variant) => {
      const currentDisplayPriceType =
        variantDisplayPriceType[variant.id] || "unit";
      variant.items.forEach((item) => {
        const units = itemUnits[item.id] || 0;
        if (units > 0) {
          const unitsPerPack = variant.units_per_pack || 1;
          const numberOfPacks = Math.ceil(units / unitsPerPack);
          const subtotal = itemPrices[item.id] || 0;
          const packSubtotal = itemPackPrices[item.id] || 0;
          const primaryImage = item.images?.[0]?.image || "/fallback-image.jpg";
          totalPrice += subtotal;
          items.push({
            id: item.id,
            description: item.title || "Item",
            packs: numberOfPacks,
            units,
            subtotal,
            packSubtotal,
            displayPriceType: currentDisplayPriceType,
            variantId: variant.id,
            image: primaryImage,
          });
        }
      });
    });
    return { items, totalPrice };
  }, [
    itemUnits,
    itemPrices,
    itemPackPrices,
    variantDisplayPriceType,
    variantsWithData,
  ]);

  const handleAddToCart = useCallback(() => {
    const { items } = computeSelectedItems();
    if (items.length === 0) {
      showNotification("No items selected to add to cart.", "error");
      return;
    }
    dispatch(addToCart(items));
    showNotification("Items added to cart successfully!", "success");
    navigate("/cart");
  }, [dispatch, navigate, showNotification, computeSelectedItems]);

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
      />
      {variantsWithData.length === 0 && (
        <div className={`${TableStyles.noVariants} b3 clr-text`}>
          No product variants available.
        </div>
      )}
      {variantsWithData.map((variant) => {
        const pricingTiers = variant.pricing_tiers || [];
        pricingTiers.sort((a, b) =>
          a.tier_type === b.tier_type
            ? a.range_start - b.range_start
            : a.tier_type === "pack"
            ? -1
            : 1
        );

        const currentPriceType = variantPriceType[variant.id] || "pack";
        const currentDisplayPriceType =
          variantDisplayPriceType[variant.id] || "unit";
        const unitsToShow =
          currentPriceType === "pack"
            ? variant.units_per_pack
            : variant.units_per_pallet;

        return (
          <div
            key={variant.id}
            id={`variant-${variant.id}`}
            className={TableStyles.variantSection}
          >
            <h4 className={`${TableStyles.variantHeading} clr-text`}>
              {variant.name}
            </h4>
            {variant.tableFields.length > 0 &&
              variant.items.every(
                (item) => !item.data_entries || item.data_entries.length === 0
              ) && (
                <div className={`${TableStyles.warning} b3 clr-danger`}>
                  No ItemData entries found for this variant's items.
                </div>
              )}
            <div className={TableStyles.tableContainer}>
              <div className={TableStyles.tableWrapper}>
                <table className={TableStyles.table}>
                  <thead>
                    <tr>
                      <th
                        className={`${TableStyles.defaultHeader} l3 clr-text`}
                      >
                        Image
                      </th>
                      <th
                        className={`${TableStyles.defaultHeader} l3 clr-text`}
                      >
                        SKU
                      </th>
                      {variant.tableFields.map((field) => (
                        <th
                          key={field.id}
                          className={`${
                            TableStyles.defaultHeader
                          } l3 clr-text ${
                            field.long_field ? TableStyles.longField : ""
                          }`}
                        >
                          {field.name}
                        </th>
                      ))}
                      {pricingTiers.map((tier) => (
                        <th
                          key={tier.id}
                          className={`${TableStyles.pricingTierHeader} l3 clr-text`}
                        >
                          {tier.tier_type === "pack" ? "Packs" : "Pallets"}{" "}
                          {tier.range_start}
                          {tier.no_end_range ? "+" : `-${tier.range_end}`}
                        </th>
                      ))}
                      <th
                        className={`${TableStyles.unitsPerHeader} l3 clr-text`}
                      >
                        <div className={TableStyles.thWithButtons}>
                          Units per
                          <span className={TableStyles.thButtonsWrapper}>
                            <button
                              className={`${TableStyles.thButton} b3 clr-text ${
                                currentPriceType === "pack"
                                  ? TableStyles.active
                                  : ""
                              }`}
                              onClick={() =>
                                handlePriceTypeChange(variant.id, "pack")
                              }
                              aria-label="Select pack pricing"
                            >
                              <Package className="icon-xms" /> Pack
                            </button>
                            {variant.show_units_per !== "pack" &&
                              variant.units_per_pallet && (
                                <button
                                  className={`${
                                    TableStyles.thButton
                                  } b3 clr-text ${
                                    currentPriceType === "pallet"
                                      ? TableStyles.active
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handlePriceTypeChange(variant.id, "pallet")
                                  }
                                  aria-label="Select pallet pricing"
                                >
                                  <Archive className="icon-xms" /> Pallet
                                </button>
                              )}
                          </span>
                        </div>
                      </th>
                      <th
                        className={`${TableStyles.unitsInputHeader} l3 clr-text`}
                      >
                        No. of Units
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.items.map((item) => {
                      const images = item.images?.map((img) => img.image) || [];
                      const primaryImage =
                        imageLoadFailed[item.id] || images.length === 0
                          ? "/fallback-image.jpg"
                          : images[0];

                      return (
                        <tr
                          key={item.id}
                          className={
                            itemUnits[item.id] > 0
                              ? TableStyles.selectedRow
                              : ""
                          }
                        >
                          <td className={`${TableStyles.imageColTd} b3 clr-text`}>
                            {imageLoadFailed[item.id] || images.length === 0 ? (
                              <span className="b3 clr-gray">
                                Image Not Available
                              </span>
                            ) : (
                              <img
                                src={primaryImage}
                                alt={`${item.sku} primary image`}
                                className={TableStyles.colImageContainer}
                                onClick={() =>
                                  images.length > 0 && openImagePreview(images)
                                }
                                style={{
                                  cursor:
                                    images.length > 0 ? "pointer" : "default",
                                }}
                                onError={() => handleImageError(item.id)}
                                loading="lazy"
                              />
                            )}
                          </td>
                          <td className="b3 clr-text">{item.sku}</td>
                          {variant.tableFields.map((field) => {
                            const itemData = (item.data_entries || []).find(
                              (data) =>
                                Number(data.field.id) === Number(field.id)
                            );
                            return (
                              <td key={field.id} className="b3 clr-text">
                                {itemData ? (
                                  field.field_type === "image" &&
                                  itemData.value_image ? (
                                    imageLoadFailed[item.id] ? (
                                      <span className="b3 clr-gray">
                                        Image Not Available
                                      </span>
                                    ) : (
                                      <img
                                        src={itemData.value_image}
                                        alt={field.name}
                                        className={
                                          TableStyles.colImageContainer
                                        }
                                        onError={() =>
                                          handleImageError(item.id)
                                        }
                                        loading="lazy"
                                      />
                                    )
                                  ) : field.field_type === "price" &&
                                    itemData.value_number != null ? (
                                    `£${Number(itemData.value_number).toFixed(
                                      2
                                    )}`
                                  ) : field.field_type === "number" &&
                                    itemData.value_number != null ? (
                                    itemData.value_number
                                  ) : itemData.value_text ? (
                                    itemData.value_text.replace(/\r\n/g, " ")
                                  ) : (
                                    "-"
                                  )
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                          {pricingTiers.map((tier) => {
                            const pricingData = tier.pricing_data?.find(
                              (pd) => pd.item === item.id
                            );
                            if (!pricingData)
                              return (
                                <td key={tier.id} className="b3 clr-gray">
                                  -
                                </td>
                              );

                            let price = parseFloat(pricingData.price);
                            let displayPrice;
                            const hasDiscount = exclusiveDiscounts[item.id] > 0;
                            const exclusivePrice = hasDiscount
                              ? applyDiscount(price, item.id)
                              : null;

                            if (currentDisplayPriceType === "unit") {
                              displayPrice = hasDiscount ? (
                                <>
                                  <span className={TableStyles.exclusivePrice}>
                                    £{exclusivePrice.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                `£${price.toFixed(2)}`
                              );
                            } else {
                              const unitsPerPack = variant.units_per_pack || 1;
                              const packPrice = price * unitsPerPack;
                              const exclusivePackPrice = hasDiscount
                                ? exclusivePrice * unitsPerPack
                                : null;
                              displayPrice = hasDiscount ? (
                                <>
                                  <span className={TableStyles.originalPrice}>
                                    £{packPrice.toFixed(2)}
                                  </span>
                                  <span className={TableStyles.exclusivePrice}>
                                    £{exclusivePackPrice.toFixed(2)}
                                  </span>
                                </>
                              ) : (
                                `£${packPrice.toFixed(2)}`
                              );
                            }

                            return (
                              <td key={tier.id} className="b3 clr-text">
                                <button
                                  className={`${TableStyles.priceButton} ${
                                    selectedTiers[item.id] === tier.id
                                      ? TableStyles.selectedTier
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handlePriceClick(
                                      item.id,
                                      variant.id,
                                      price,
                                      tier
                                    )
                                  }
                                  aria-current={
                                    selectedTiers[item.id] === tier.id
                                  }
                                  aria-label={`Select ${tier.tier_type} tier ${
                                    tier.range_start
                                  }${
                                    tier.no_end_range
                                      ? "+"
                                      : `-${tier.range_end}`
                                  } for £${
                                    hasDiscount
                                      ? exclusivePrice.toFixed(2)
                                      : price.toFixed(2)
                                  }`}
                                >
                                  {displayPrice}
                                </button>
                              </td>
                            );
                          })}
                          <td className="b3 clr-text">{unitsToShow || "-"}</td>
                          <td className="b3 clr-text">
                            <div className={TableStyles.unitInputGroup}>
                              <button
                                className={`${TableStyles.unitButton} ${TableStyles.unitButtonMinus}`}
                                onClick={() => handleDecrement(item.id, variant.id)}
                                aria-label={`Decrement units for ${item.sku}`}
                              >
                                <Minus className="icon-s" />
                              </button>
                              <input
                                type="text"
                                value={itemUnits[item.id] || ""}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, "");
                                  setItemUnits((prev) => ({
                                    ...prev,
                                    [item.id]: value,
                                  }));
                                }}
                                onBlur={(e) =>
                                  handleUnitChange(item.id, variant.id, e.target.value)
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleUnitChange(item.id, variant.id, e.target.value);
                                    e.target.blur();
                                  }
                                }}
                                className={TableStyles.unitInput}
                                aria-label={`Enter units for ${item.sku}`}
                              />
                              <button
                                className={`${TableStyles.unitButton} ${TableStyles.unitButtonPlus}`}
                                onClick={() => handleIncrement(item.id, variant.id)}
                                aria-label={`Increment units for ${item.sku}`}
                              >
                                <Plus className="icon-s" />
                              </button>
                            </div>
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

      {selectedImages && (
        <ImagePreview images={selectedImages} onClose={closeImagePreview} />
      )}
      {showStickyBar && (
        <div className={TableStyles.stickyBar}>
          <div className={TableStyles.stickyBarContent}>
            <table className={TableStyles.summaryTable}>
              <thead>
                <tr>
                  <th className="b3 clr-text">Description</th>
                  <th className="b3 clr-text">Packs</th>
                  <th className="b3 clr-text">Units</th>
                  <th className="b3 clr-text">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {computeSelectedItems().items.map((item) => (
                  <tr key={item.id}>
                    <td className="b3 clr-text">{item.description}</td>
                    <td className="b3 clr-text">{item.packs}</td>
                    <td className="b3 clr-text">{item.units}</td>
                    <td className="b3 clr-text">
                      £
                      {(item.displayPriceType === "unit"
                        ? item.subtotal
                        : item.packSubtotal
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={TableStyles.stickyBarActions}>
              <div className={TableStyles.actionButtons}>
                <button
                  className={"primary-btn"}
                  onClick={handleAddToCart}
                  aria-label="Add selected items to cart"
                >
                  Add to Cart
                </button>
                <button
                  className={"secondary-btn"}
                  onClick={handleAddToCart}
                  aria-label="Add selected items to cart"
                >
                  Checkout
                </button>
              </div>
              <div className={TableStyles.totalPrice}>
                TOTAL £{computeSelectedItems().totalPrice.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductsTable);
