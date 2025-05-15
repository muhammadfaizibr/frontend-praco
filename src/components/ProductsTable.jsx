import React, { useState, useEffect, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import TableStyles from "assets/css/TableStyles.module.css";
import { Package, Archive, Plus, Minus } from "lucide-react";
import { getUserExclusivePrice, getOrCreateCart, addCartItem } from "utils/api/ecommerce";
import Notification from "components/Notification";
import ImagePreview from "components/ImagePreview";

const ProductsTable = ({ variantsWithData }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
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
  const [unitsDisplayType, setUnitsDisplayType] = useState({});

  // Initialize state based on variantsWithData
  useEffect(() => {
    const initialUnits = {};
    const initialPriceType = {};
    const initialSelectedTiers = {};
    const initialDisplayPriceType = {};
    const initialUnitsDisplayType = {};
    (variantsWithData || []).forEach((variant) => {
      if (!variant?.id || !variant.items) return;
      const supportsPallets = variant.units_per_pallet > 0 && variant.show_units_per !== "pack";
      initialPriceType[variant.id] = supportsPallets && variant.show_units_per === "pallet" ? "pallet" : "pack";
      initialDisplayPriceType[variant.id] = "unit";
      initialUnitsDisplayType[variant.id] = "pack";
      variant.items.forEach((item) => {
        if (!item?.id) return;
        initialUnits[item.id] = 0;
        initialSelectedTiers[item.id] = null;
      });
    });
    setItemUnits(initialUnits);
    setVariantPriceType(initialPriceType);
    setSelectedTiers(initialSelectedTiers);
    setVariantDisplayPriceType(initialDisplayPriceType);
    setUnitsDisplayType(initialUnitsDisplayType);
  }, [variantsWithData]);

  // Update sticky bar visibility
  useEffect(() => {
    setShowStickyBar(Object.values(itemUnits).some((units) => units > 0));
  }, [itemUnits]);

  // Fetch exclusive prices for logged-in users
  useEffect(() => {
    if (!isLoggedIn || !variantsWithData?.length) return;
    const abortController = new AbortController();
    const fetchExclusivePrices = async () => {
      const discounts = {};
      try {
        for (const variant of variantsWithData) {
          if (!variant?.items) continue;
          for (const item of variant.items) {
            if (!item?.id) continue;
            const exclusivePrices = await getUserExclusivePrice(item.id, abortController.signal);
            if (Array.isArray(exclusivePrices) && exclusivePrices.length > 0) {
              discounts[item.id] = {
                id: exclusivePrices[0].id,
                discount_percentage: Number(exclusivePrices[0].discount_percentage) || 0,
              };
            } else {
              discounts[item.id] = { id: null, discount_percentage: 0 };
            }
          }
        }
        setExclusiveDiscounts(discounts);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch exclusive prices:", error.message);
        }
      }
    };
    fetchExclusivePrices();
    return () => abortController.abort();
  }, [isLoggedIn, variantsWithData]);

  // Show notification with timeout
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), 3000);
  }, []);

  // Find applicable pricing tier
  const findApplicableTier = useCallback((variant, units, priceType) => {
    const pricingTiers = variant?.pricing_tiers?.filter((tier) => tier.tier_type === priceType) || [];
    if (!pricingTiers.length) return null;

    let quantity = units;
    if (priceType === "pack") {
      quantity = Math.ceil(units / (variant.units_per_pack || 1));
    } else if (priceType === "pallet") {
      quantity = Math.ceil(units / (variant.units_per_pallet || 1));
    }

    return (
      pricingTiers.find((tier) =>
        tier.no_end_range
          ? quantity >= tier.range_start
          : quantity >= tier.range_start && (tier.range_end === null || quantity <= tier.range_end)
      ) || pricingTiers.sort((a, b) => b.range_start - a.range_start)[0]
    );
  }, []);

  // Apply discount to price
  const applyDiscount = useCallback((price, itemId) => {
    const discountPercentage = exclusiveDiscounts[itemId]?.discount_percentage || 0;
    return price * (1 - discountPercentage / 100);
  }, [exclusiveDiscounts]);

  // Calculate total price for an item
  const calculateTotalPrice = useCallback(
    (itemId, variantId, units, tier, price) => {
      const variant = variantsWithData.find((v) => v?.id === variantId);
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

  // Determine pricing tier for item and variant
  const determinePricingTier = useCallback(
    (variant, itemId, units, totalUnits, currentVariantPriceType) => {
      const packQuantity = variant.units_per_pack || 1;
      const palletQuantity = variant.units_per_pallet || 0;
      const supportsPallets = palletQuantity > 0 && variant.show_units_per !== "pack";
      const hasPalletPricing = variant.pricing_tiers?.some((tier) => tier.tier_type === "pallet");

      // Variant-level pricing tier: If totalUnits >= palletQuantity and pallet pricing is available, use pallet pricing
      let variantPriceType = "pack";
      if (supportsPallets && hasPalletPricing && totalUnits >= palletQuantity) {
        variantPriceType = "pallet";
      }

      // Item-level pricing tier: If units >= palletQuantity and pallet pricing is available, use pallet pricing
      let itemPriceType = variantPriceType === "pallet" && supportsPallets ? "pallet" : "pack";
      if (supportsPallets && hasPalletPricing && units >= palletQuantity) {
        itemPriceType = "pallet";
      }

      return { itemPriceType, variantPriceType };
    },
    []
  );

  // Handle unit changes and pricing tier switching with stock validation
  const handleUnitChange = useCallback(
    (itemId, variantId, value) => {
      const variant = variantsWithData.find((v) => v?.id === variantId);
      if (!variant?.items) return;

      const item = variant.items.find((i) => i.id === itemId);
      if (!item) return;

      const packQuantity = variant.units_per_pack || 1;
      const palletQuantity = variant.units_per_pallet || 0;
      const supportsPallets = palletQuantity > 0 && variant.show_units_per !== "pack";
      let newUnits = Math.max(0, parseInt(value, 10) || 0);

      // Stock validation
      if (item.track_inventory && newUnits > item.stock) {
        newUnits = item.stock;
        showNotification(`Cannot exceed available stock of ${item.stock} units for ${item.title}.`, "warning");
      }

      // Adjust units to nearest valid step based on pack quantity for custom input
      let adjustedUnits = newUnits;
      adjustedUnits = Math.round(newUnits / packQuantity) * packQuantity;

      // Update item units
      const updatedItemUnits = { ...itemUnits, [itemId]: adjustedUnits };

      // Calculate total units for the variant
      const totalUnits = variant.items.reduce((sum, item) => sum + (updatedItemUnits[item.id] || 0), 0);

      // Determine pricing tiers
      const { variantPriceType: newVariantPriceType } = determinePricingTier(
        variant,
        itemId,
        adjustedUnits,
        totalUnits,
        variantPriceType[variantId]
      );

      // Notify pricing tier changes
      if (variantPriceType[variantId] !== newVariantPriceType) {
        const message =
          newVariantPriceType === "pallet"
            ? "Switched to pallet pricing due to total quantity."
            : "Reverted to pack pricing due to non-pallet quantity.";
        showNotification(message, "info");
      }

      // Update variant pricing tier state
      setVariantPriceType((prev) => ({ ...prev, [variantId]: newVariantPriceType }));
      setItemUnits(updatedItemUnits);

      // Apply pricing for all items in the variant
      variant.items.forEach((item) => {
        const itemUnitsValue = updatedItemUnits[item.id] || 0;
        if (itemUnitsValue === 0) {
          setSelectedTiers((prev) => ({ ...prev, [item.id]: null }));
          setItemPrices((prev) => ({ ...prev, [item.id]: 0 }));
          setItemPackPrices((prev) => ({ ...prev, [item.id]: 0 }));
          return;
        }

        // Use variantPriceType for pricing if it's pallet, else use item-specific tier
        const { itemPriceType: itemPriceTypeForItem } = determinePricingTier(
          variant,
          item.id,
          itemUnitsValue,
          totalUnits,
          newVariantPriceType
        );
        const priceTypeToUse = newVariantPriceType === "pallet" && supportsPallets ? "pallet" : itemPriceTypeForItem;
        const applicableTier = findApplicableTier(variant, itemUnitsValue, priceTypeToUse);
        let price = 0;

        if (applicableTier) {
          const pricingData = applicableTier.pricing_data?.find((pd) => pd.item === item.id);
          if (pricingData && isFinite(parseFloat(pricingData.price))) {
            price = applyDiscount(parseFloat(pricingData.price), item.id);
            setSelectedTiers((prev) => ({ ...prev, [item.id]: applicableTier.id }));
          } else {
            const fallbackTier = variant.pricing_tiers?.find((tier) => tier.tier_type === priceTypeToUse);
            if (fallbackTier) {
              const fallbackPricingData = fallbackTier.pricing_data?.find((pd) => pd.item === item.id);
              if (fallbackPricingData && isFinite(parseFloat(fallbackPricingData.price))) {
                price = applyDiscount(parseFloat(fallbackPricingData.price), item.id);
                setSelectedTiers((prev) => ({ ...prev, [item.id]: fallbackTier.id }));
              }
            }
          }
        }

        if (applicableTier && price > 0) {
          calculateTotalPrice(item.id, variantId, itemUnitsValue, applicableTier, price);
        } else {
          setItemPrices((prev) => ({ ...prev, [item.id]: 0 }));
          setItemPackPrices((prev) => ({ ...prev, [item.id]: 0 }));
        }
      });
    },
    [
      itemUnits,
      variantPriceType,
      calculateTotalPrice,
      findApplicableTier,
      applyDiscount,
      variantsWithData,
      showNotification,
      determinePricingTier,
    ]
  );

  // Handle increment based on item quantity with stock validation
  const handleIncrement = useCallback(
    (itemId, variantId) => {
      const variant = variantsWithData.find((v) => v?.id === variantId);
      if (!variant?.items) return;

      const item = variant.items.find((i) => i.id === itemId);
      if (!item) return;

      const packQuantity = variant.units_per_pack || 1;
      const palletQuantity = variant.units_per_pallet || 0;
      const supportsPallets = palletQuantity > 0 && variant.show_units_per !== "pack";
      const currentUnits = itemUnits[itemId] || 0;

      // Increment by packQuantity if pallets are not supported or if quantity is 0
      let increment = packQuantity;
      if (supportsPallets && currentUnits > 0) {
        increment = currentUnits >= palletQuantity && currentUnits % palletQuantity === 0 ? palletQuantity : packQuantity;
      }

      let newUnits = currentUnits + increment;

      // Stock validation
      if (item.track_inventory && newUnits > item.stock) {
        newUnits = item.stock;
        showNotification(`Cannot exceed available stock of ${item.stock} units for ${item.title}.`, "warning");
      }

      handleUnitChange(itemId, variantId, newUnits.toString());
    },
    [itemUnits, variantsWithData, handleUnitChange, showNotification]
  );

  // Handle decrement based on item quantity
  const handleDecrement = useCallback(
    (itemId, variantId) => {
      const variant = variantsWithData.find((v) => v?.id === variantId);
      if (!variant?.items) return;

      const packQuantity = variant.units_per_pack || 1;
      const palletQuantity = variant.units_per_pallet || 0;
      const supportsPallets = palletQuantity > 0 && variant.show_units_per !== "pack";
      const currentUnits = itemUnits[itemId] || 0;

      // Decrement by packQuantity if pallets are not supported
      let decrement = packQuantity;
      if (supportsPallets) {
        if (currentUnits === palletQuantity) {
          decrement = packQuantity;
        } else if (currentUnits >= palletQuantity && currentUnits % palletQuantity === 0) {
          decrement = palletQuantity;
        } else {
          decrement = packQuantity;
        }
      }

      const newUnits = Math.max(0, currentUnits - decrement);
      handleUnitChange(itemId, variantId, newUnits.toString());
    },
    [itemUnits, variantsWithData, handleUnitChange]
  );

  // Handle units display type change (Pack/Pallet toggle)
  const handleUnitsDisplayTypeChange = useCallback((variantId, displayType) => {
    setUnitsDisplayType((prev) => ({ ...prev, [variantId]: displayType }));
  }, []);

  // Handle price tier selection with stock validation
  const handlePriceClick = useCallback(
    (itemId, variantId, price, tier) => {
      const variant = variantsWithData.find((v) => v?.id === variantId);
      if (!variant) return;

      const item = variant.items.find((i) => i.id === itemId);
      if (!item) return;

      const unitsPer = tier.tier_type === "pack" ? variant.units_per_pack || 1 : variant.units_per_pallet || 1;
      let newUnits = tier.range_start * unitsPer;

      // Stock validation
      if (item.track_inventory && newUnits > item.stock) {
        newUnits = item.stock;
        showNotification(`Cannot exceed available stock of ${item.stock} units for ${item.title}.`, "warning");
      }

      // Update selected tier and sticky bar
      setSelectedTiers((prev) => ({ ...prev, [itemId]: tier.id }));
      setShowStickyBar(true);

      // Update quantity and trigger pricing tier reevaluation
      handleUnitChange(itemId, variantId, newUnits.toString());

      // Apply pricing for the selected item
      const discountedPrice = applyDiscount(price, itemId);
      calculateTotalPrice(itemId, variantId, newUnits, tier, discountedPrice);
    },
    [calculateTotalPrice, applyDiscount, variantsWithData, handleUnitChange, showNotification]
  );

  // Toggle display price type
  const toggleDisplayPriceType = useCallback((variantId, priceType) => {
    setVariantDisplayPriceType((prev) => ({ ...prev, [variantId]: priceType }));
  }, []);

  // Image preview handlers
  const openImagePreview = useCallback((images, variantName, productName) => {
    setSelectedImages({ images, variantName, productName });
  }, []);

  const closeImagePreview = useCallback(() => {
    setSelectedImages(null);
  }, []);

  const handleImageError = useCallback((itemId) => {
    setImageLoadFailed((prev) => ({ ...prev, [itemId]: true }));
  }, []);

  // Compute selected items for sticky bar
  const computeSelectedItems = useCallback(() => {
    const items = [];
    let totalPrice = 0;
    variantsWithData.forEach((variant) => {
      if (!variant?.items) return;
      const currentDisplayPriceType = variantDisplayPriceType[variant.id] || "unit";
      variant.items.forEach((item) => {
        const units = itemUnits[item.id] || 0;
        if (units <= 0) return;

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
      });
    });
    return { items, totalPrice };
  }, [itemUnits, itemPrices, itemPackPrices, variantDisplayPriceType, variantsWithData]);

  // Add items to cart
  const handleAddToCart = useCallback(async () => {
    if (!isLoggedIn) {
      showNotification("Please log in to add items to cart.", "error");
      navigate("/login");
      return;
    }

    const { items } = computeSelectedItems();
    if (!items.length) {
      showNotification("No items selected to add to cart.", "warning");
      return;
    }

    try {
      // Get or create cart
      const cart = await getOrCreateCart();
      console.log(cart, 'cart')
      if (!cart?.id) {
        showNotification("Failed to retrieve or create cart.", "error");
        return;
      }

      // Prepare cart items for bulk creation
      const cartItems = [];
      for (const item of items) {
        const variant = variantsWithData.find((v) => v.id === item.variantId);
        if (!variant) continue;

        const tierId = selectedTiers[item.id];
        if (!tierId) {
          showNotification(`No pricing tier selected for item ${item.description}.`, "error");
          return;
        }

        const tier = variant.pricing_tiers?.find((t) => t.id === tierId);
        if (!tier) {
          showNotification(`Invalid pricing tier for item ${item.description}.`, "error");
          return;
        }

        const pricingData = tier.pricing_data?.find((pd) => pd.item === item.id);
        if (!pricingData) {
          showNotification(`No pricing data found for item ${item.description}.`, "error");
          return;
        }

        const unitsPerPack = variant.units_per_pack || 1;
        const quantity = Math.ceil(item.units / unitsPerPack);

        cartItems.push({
          cart: cart.id,
          item: item.id,
          pricing_tier: tier.id,
          pack_quantity: quantity,
          unit_type: "pack",
          user_exclusive_price: exclusiveDiscounts[item.id]?.id || null,
        });
      }

      if (!cartItems.length) {
        showNotification("No valid items to add to cart.", "warning");
        return;
      }

      // Send bulk cart items to backend
      await addCartItem(cartItems);
      showNotification(`Added ${cartItems.length} item(s) to cart successfully!`, "success");

      // Reset state
      setItemUnits((prev) => {
        const resetUnits = { ...prev };
        Object.keys(resetUnits).forEach((key) => (resetUnits[key] = 0));
        return resetUnits;
      });
      setSelectedTiers({});
      setItemPrices({});
      setItemPackPrices({});
      setShowStickyBar(false);

      // Navigate to cart
      navigate("/cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      const errorMessage =
        error.response?.data?.detail ||
        (error.response?.data && typeof error.response.data === "object"
          ? Object.values(error.response.data).flat().join(" ")
          : error.message || "Failed to add items to cart. Please try again.");
      showNotification(errorMessage, "error");
    }
  }, [
    isLoggedIn,
    navigate,
    showNotification,
    computeSelectedItems,
    selectedTiers,
    variantsWithData,
    getOrCreateCart,
    addCartItem,
    exclusiveDiscounts,
  ]);

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification message={notification.message} type={notification.type} visible={notification.visible} />
      {!variantsWithData?.length && (
        <div className={`${TableStyles.noVariants} b3 clr-text`}>No product variants available.</div>
      )}
      {variantsWithData.map((variant) => {
        if (!variant?.id || !variant.items) return null;
        const pricingTiers = (variant.pricing_tiers || []).sort((a, b) =>
          a.tier_type === b.tier_type ? a.range_start - b.range_start : a.tier_type === "pack" ? -1 : 1
        );
        const currentPriceType = variantPriceType[variant.id] || "pack";
        const currentDisplayPriceType = variantDisplayPriceType[variant.id] || "unit";
        const currentUnitsDisplayType = unitsDisplayType[variant.id] || "pack";
        const unitsToShow = currentUnitsDisplayType === "pack" ? variant.units_per_pack : variant.units_per_pallet;

        return (
          <div key={variant.id} id={`variant-${variant.id}`} className={TableStyles.variantSection}>
            <h4 className={`${TableStyles.variantHeading} clr-text`}>{variant.name || "Unnamed Variant"}</h4>
            {variant.tableFields?.length > 0 && variant.items.every((item) => !item.data_entries?.length) && (
              <div className={`${TableStyles.warning} b3 clr-danger`}>No ItemData entries found for this variant's items.</div>
            )}
            <div className={TableStyles.tableContainer}>
              <div className={TableStyles.tableWrapper}>
                <table className={TableStyles.table}>
                  <thead>
                    <tr>
                      <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Image</th>
                      <th className={`${TableStyles.defaultHeader} b3 clr-text`}>SKU</th>
                      {variant.tableFields?.map((field) => (
                        <th
                          key={field.id}
                          className={`${TableStyles.defaultHeader} b3 clr-text ${field.long_field ? TableStyles.longField : ""}`}
                        >
                          {field.name}
                        </th>
                      ))}
                      {pricingTiers.map((tier) => (
                        <th key={tier.id} className={`${TableStyles.pricingTierHeader} b3 clr-text`}>
                          {tier.tier_type === "pack" ? "Packs" : "Pallets"} {tier.range_start}
                          {tier.no_end_range ? "+" : `-${tier.range_end}`}
                        </th>
                      ))}
                      <th className={`${TableStyles.unitsPerHeader} b3 clr-text`}>
                        <div className={TableStyles.thWithButtons}>
                          Units per
                          <span className={TableStyles.thButtonsWrapper}>
                            <button
                              className={`${TableStyles.thButton} b3 clr-text ${currentUnitsDisplayType === "pack" ? TableStyles.active : ""}`}
                              onClick={() => handleUnitsDisplayTypeChange(variant.id, "pack")}
                              aria-label="Show units per pack"
                            >
                              <Package className="icon-xms" /> Pack
                            </button>
                            {variant.show_units_per !== "pack" && variant.units_per_pallet && (
                              <button
                                className={`${TableStyles.thButton} b3 clr-text ${currentUnitsDisplayType === "pallet" ? TableStyles.active : ""}`}
                                onClick={() => handleUnitsDisplayTypeChange(variant.id, "pallet")}
                                aria-label="Show units per pallet"
                              >
                                <Archive className="icon-xms" /> Pallet
                              </button>
                            )}
                          </span>
                        </div>
                      </th>
                      <th className={`${TableStyles.unitsInputHeader} b3 clr-text`}>No. of Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.items.map((item) => {
                      const images = item.images?.map((img) => img.image) || [];
                      const primaryImage = imageLoadFailed[item.id] || !images.length ? "/fallback-image.jpg" : images[0];

                      return (
                        <tr key={item.id} className={itemUnits[item.id] > 0 ? TableStyles.selectedRow : ""}>
                          <td className={`${TableStyles.imageColTd} b3 clr-text`}>
                            {imageLoadFailed[item.id] || !images.length ? (
                              <span className="b3 clr-gray">Image Not Available</span>
                            ) : (
                              <img
                                src={primaryImage}
                                alt={`${item.sku || "item"} primary image`}
                                className={TableStyles.colImageContainer}
                                onClick={() => images.length > 0 && openImagePreview(images, variant.name, item.title || "Item")}
                                style={{ cursor: images.length > 0 ? "pointer" : "default" }}
                                onError={() => handleImageError(item.id)}
                                loading="lazy"
                              />
                            )}
                          </td>
                          <td className="b3 clr-text">{item.sku || "-"}</td>
                          {variant.tableFields?.map((field) => {
                            const itemData = item.data_entries?.find((data) => Number(data.field?.id) === Number(field.id));
                            return (
                              <td key={field.id} className="b3 clr-text">
                                {itemData ? (
                                  field.field_type === "image" && itemData.value_image ? (
                                    imageLoadFailed[item.id] ? (
                                      <span className="b3 clr-gray">Image Not Available</span>
                                    ) : (
                                      <img
                                        src={itemData.value_image}
                                        alt={field.name}
                                        className={TableStyles.colImageContainer}
                                        onError={() => handleImageError(item.id)}
                                        loading="lazy"
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
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                          {pricingTiers.map((tier) => {
                            const pricingData = tier.pricing_data?.find((pd) => pd.item === item.id);
                            if (!pricingData) return <td key={tier.id} className="b3 clr-gray">-</td>;

                            const price = parseFloat(pricingData.price);
                            const hasDiscount = exclusiveDiscounts[item.id]?.discount_percentage > 0;
                            const exclusivePrice = hasDiscount ? applyDiscount(price, item.id) : null;
                            const unitsPerPack = variant.units_per_pack || 1;
                            const packPrice = price * unitsPerPack;
                            const exclusivePackPrice = hasDiscount ? exclusivePrice * unitsPerPack : null;

                            const displayPrice = currentDisplayPriceType === "unit" ? (
                              hasDiscount ? (
                                <span className={TableStyles.exclusivePrice}>£{exclusivePrice.toFixed(2)}</span>
                              ) : (
                                `£${price.toFixed(2)}`
                              )
                            ) : hasDiscount ? (
                              <>
                                <span className={TableStyles.originalPrice}>£{packPrice.toFixed(2)}</span>
                                <span className={TableStyles.exclusivePrice}>£{exclusivePackPrice.toFixed(2)}</span>
                              </>
                            ) : (
                              `£${packPrice.toFixed(2)}`
                            );

                            return (
                              <td key={tier.id} className="b3 clr-text">
                                <button
                                  className={`${TableStyles.priceButton} ${selectedTiers[item.id] === tier.id ? TableStyles.selectedTier : ""} b3`}
                                  onClick={() => handlePriceClick(item.id, variant.id, price, tier)}
                                  aria-current={selectedTiers[item.id] === tier.id}
                                  aria-label={`Select ${tier.tier_type} tier ${tier.range_start}${tier.no_end_range ? "+" : `-${tier.range_end}`} for £${hasDiscount ? exclusivePrice.toFixed(2) : price.toFixed(2)}`}
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
                                aria-label={`Decrement units for ${item.sku || "item"}`}
                              >
                                <Minus className="icon-s" />
                              </button>
                              <input
                                type="text"
                                value={itemUnits[item.id] ?? 0}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, "");
                                  setItemUnits((prev) => ({ ...prev, [item.id]: parseInt(value, 10) || 0 }));
                                }}
                                onBlur={(e) => handleUnitChange(item.id, variant.id, e.target.value.replace(/[^0-9]/g, ""))}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleUnitChange(item.id, variant.id, e.target.value.replace(/[^0-9]/g, ""));
                                    e.target.blur();
                                  }
                                }}
                                className={TableStyles.unitInput}
                                aria-label={`Enter units for ${item.sku || "item"}`}
                              />
                              <button
                                className={`${TableStyles.unitButton} ${TableStyles.unitButtonPlus}`}
                                onClick={() => handleIncrement(item.id, variant.id)}
                                aria-label={`Increment units for ${item.sku || "item"}`}
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
        <ImagePreview
          images={selectedImages.images}
          onClose={closeImagePreview}
          variantName={selectedImages.variantName}
          productName={selectedImages.productName}
        />
      )}
      {showStickyBar && (
        <div className={TableStyles.stickyBar}>
          <div className={TableStyles.stickyBarContent}>
            <table className={TableStyles.productsSummaryTable}>
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
                    <td className="b3 clr-text">£{(item.displayPriceType === "unit" ? item.subtotal : item.packSubtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={TableStyles.stickyBarActions}>
              <div className={TableStyles.actionButtons}>
                <button className="primary-btn text-large" onClick={handleAddToCart} aria-label="Add selected items to cart">
                  Add to Cart
                </button>
              </div>
              <div className={TableStyles.totalPrice}>TOTAL £{computeSelectedItems().totalPrice.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ProductsTable);