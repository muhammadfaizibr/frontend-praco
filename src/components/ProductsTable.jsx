import React, { useState, useEffect, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import TableStyles from "assets/css/TableStyles.module.css";
import { Package, Archive, Plus, Minus } from "lucide-react";
import {
  getOrCreateCart,
  getUserExclusivePrice,
  addCartItem,
} from "utils/api/ecommerce";
import Notification from "components/Notification";
import ImagePreview from "components/ImagePreview";
import axios from "axios";
import { BASE_URL } from "utils/global";

const ProductsTable = ({ variantsWithData }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();
  const [itemUnits, setItemUnits] = useState({});
  const [inputValues, setInputValues] = useState({});
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
  const [cartWeight, setCartWeight] = useState(0);

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCartData = async () => {
      if (!isLoggedIn) return;
      
      try {
        const cart = await getOrCreateCart();
        const cartId = cart.id;
        const cartUrl = `${BASE_URL}ecommerce/carts/${cartId}/`;
        const cartResponse = await axios.get(cartUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const weight = parseFloat(cartResponse.data.total_weight) || 0;
        setCartWeight(weight);

        // If cart weight is already >= 850kg, switch to pallet pricing
        if (weight >= 850) {
          const newPriceTypes = {};
          variantsWithData?.forEach(variant => {
            if (variant?.id && variant.units_per_pallet > 0) {
              newPriceTypes[variant.id] = "pallet";
            }
          });
          setVariantPriceType(prev => ({ ...prev, ...newPriceTypes }));
        }
      } catch (error) {
        console.error("Failed to fetch cart data:", error.message);
        setCartWeight(0);
      }
    };

    fetchCartData();
  }, [isLoggedIn, variantsWithData]);

  // Initialize states when variantsWithData changes
  useEffect(() => {
    const initialUnits = {};
    const initialInputValues = {};
    const initialPriceType = {};
    const initialSelectedTiers = {};
    const initialDisplayPriceType = {};
    const initialUnitsDisplayType = {};

    (variantsWithData || []).forEach((variant) => {
      if (!variant?.id || !Array.isArray(variant.items)) {
        console.warn("Invalid variant, missing id or items:", variant);
        return;
      }
      
      // Initialize with pallet pricing if cart weight is already >= 850kg
      const supportsPallets = variant.units_per_pallet > 0;
      initialPriceType[variant.id] = 
        (supportsPallets && cartWeight >= 850) || 
        (supportsPallets && variant.show_units_per === "pallet")
          ? "pallet"
          : "pack";
          
      initialDisplayPriceType[variant.id] = "pack"; // Changed to pack
      initialUnitsDisplayType[variant.id] = "pack";

      variant.items.forEach((item) => {
        if (!item?.id) {
          console.warn(`Invalid item in variant ${variant.id}:`, item);
          return;
        }
        initialUnits[item.id] = 0;
        initialInputValues[item.id] = "0";
        initialSelectedTiers[item.id] = null;
      });
    });

    setItemUnits(initialUnits);
    setInputValues(initialInputValues);
    setVariantPriceType(initialPriceType);
    setSelectedTiers(initialSelectedTiers);
    setVariantDisplayPriceType(initialDisplayPriceType);
    setUnitsDisplayType(initialUnitsDisplayType);
  }, [variantsWithData, cartWeight]);

  // Show sticky bar when items are selected
  useEffect(() => {
    setShowStickyBar(Object.values(itemUnits).some((units) => units > 0));
  }, [itemUnits]);

  // Fetch exclusive prices for logged in users
  useEffect(() => {
    if (!isLoggedIn || !variantsWithData?.length) return;
    const abortController = new AbortController();
    let isMounted = true;

    const fetchExclusivePrices = async () => {
      const discounts = {};
      try {
        for (const variant of variantsWithData) {
          if (!variant?.items) continue;
          for (const item of variant.items) {
            if (!item?.id) continue;
            const exclusivePrices = await getUserExclusivePrice(
              item.id,
              abortController.signal
            );
            if (Array.isArray(exclusivePrices) && exclusivePrices.length > 0) {
              discounts[item.id] = {
                id: exclusivePrices,
                discount_percentage:
                  Number(exclusivePrices[0].discount_percentage) || 0,
              };
            } else {
              discounts[item.id] = { id: null, discount_percentage: 0 };
            }
          }
        }
        if (isMounted) {
          setExclusiveDiscounts(discounts);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch exclusive prices:", error.message);
        }
      }
    };

    fetchExclusivePrices();
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [isLoggedIn, variantsWithData]);

  // Helper function to calculate total weight with specific units
  const calculateTotalWeightWithUnits = useCallback(
    (unitsToCalculate) => {
      let newWeight = 0;
      variantsWithData.forEach((variant) => {
        if (!variant?.items) return;
        variant.items.forEach((item) => {
          const units = unitsToCalculate[item.id] || 0;
          const itemWeight = item.weight || 0;
          const itemWeightUnit = item.weight_unit || "kg";
          const conversionFactor =
            itemWeightUnit === "lb"
              ? 0.453592
              : itemWeightUnit === "oz"
              ? 0.0283495
              : itemWeightUnit === "g"
              ? 0.001
              : 1;
          newWeight += itemWeight * conversionFactor * units;
        });
      });
      return newWeight;
    },
    [variantsWithData]
  );

  // Notification helper
  const showNotification = useCallback((message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(
      () => setNotification((prev) => ({ ...prev, visible: false })),
      3000
    );
  }, []);

  // Find applicable pricing tier
  const findApplicableTier = useCallback((variant, units, priceType) => {
    const pricingTiers =
      variant?.pricing_tiers?.filter((tier) => tier.tier_type === priceType) ||
      [];
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
          : quantity >= tier.range_start &&
            (tier.range_end === null || quantity <= tier.range_end)
      ) || pricingTiers.sort((a, b) => b.range_start - a.range_start)[0]
    );
  }, []);

  // Apply exclusive discounts if available
  const applyDiscount = useCallback(
    (price, itemId) => {
      const discountPercentage =
        exclusiveDiscounts[itemId]?.discount_percentage || 0;
      return price * (1 - discountPercentage / 100);
    },
    [exclusiveDiscounts]
  );

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

  // Determine pricing tier based on weight and units
  const determinePricingTier = useCallback(
    (variant, units, currentSelectedWeight) => {
      const hasPalletPricing = variant.pricing_tiers?.some(
        (tier) => tier.tier_type === "pallet"
      );
      const currentPriceType = variantPriceType[variant.id] || "pack";

      const combinedWeight = cartWeight + currentSelectedWeight;
      let newPriceType = currentPriceType;

      if (
        hasPalletPricing &&
        combinedWeight >= 850 &&
        currentPriceType !== "pallet"
      ) {
        newPriceType = "pallet";
        showNotification(
          "Switched to pallet pricing due to total weight ≥ 850kg.",
          "info"
        );
      } else if (combinedWeight < 850 && currentPriceType === "pallet") {
        newPriceType = "pack";
        showNotification(
          "Reverted to pack pricing due to total weight < 850kg.",
          "info"
        );
      }

      return { itemPriceType: newPriceType, variantPriceType: newPriceType };
    },
    [cartWeight, showNotification, variantPriceType]
  );

  // Update prices for all items in a variant
  const updatePricesForVariant = useCallback(
    (variant, itemUnitsToUse, currentSelectedWeight, currentVariantPriceType) => {
      variant.items.forEach((item) => {
        const itemUnitsValue = itemUnitsToUse[item.id] || 0;
        if (itemUnitsValue === 0) {
          setSelectedTiers((prev) => ({ ...prev, [item.id]: null }));
          setItemPrices((prev) => ({ ...prev, [item.id]: 0 }));
          setItemPackPrices((prev) => ({ ...prev, [item.id]: 0 }));
          return;
        }

        const { itemPriceType: itemPriceTypeForItem } = determinePricingTier(
          variant,
          itemUnitsValue,
          currentSelectedWeight
        );
        const priceTypeToUse =
          currentVariantPriceType === "pallet"
            ? "pallet"
            : itemPriceTypeForItem;
        const applicableTier = findApplicableTier(
          variant,
          itemUnitsValue,
          priceTypeToUse
        );
        let price = 0;

        if (applicableTier) {
          const pricingData = applicableTier.pricing_data?.find(
            (pd) => pd.item === item.id
          );
          if (pricingData && isFinite(parseFloat(pricingData.price))) {
            price = applyDiscount(parseFloat(pricingData.price), item.id);
            setSelectedTiers((prev) => ({
              ...prev,
              [item.id]: applicableTier.id,
            }));
          }
        }

        if (applicableTier && price > 0) {
          calculateTotalPrice(
            item.id,
            variant.id,
            itemUnitsValue,
            applicableTier,
            price
          );
        } else {
          setItemPrices((prev) => ({ ...prev, [item.id]: 0 }));
          setItemPackPrices((prev) => ({ ...prev, [item.id]: 0 }));
        }
      });
    },
    [
      findApplicableTier,
      applyDiscount,
      calculateTotalPrice,
      determinePricingTier,
    ]
  );

  // Handle unit changes
  const handleUnitChange = useCallback(
    (itemId, variantId, value) => {
      const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;
      setInputValues((prev) => ({
        ...prev,
        [itemId]: numericValue.toString(),
      }));

      setItemUnits((prevItemUnits) => {
        const variant = variantsWithData.find((v) => v?.id === variantId);
        if (!variant?.items) return prevItemUnits;

        const item = variant.items.find((i) => i.id === itemId);
        if (!item) return prevItemUnits;

        const packQuantity = variant.units_per_pack || 1;
        // Round to nearest multiple of packQuantity
        let adjustedUnits =
          Math.round(numericValue / packQuantity) * packQuantity;
        adjustedUnits = Math.max(0, adjustedUnits);

        if (item.track_inventory && adjustedUnits > item.stock) {
          adjustedUnits = Math.floor(item.stock / packQuantity) * packQuantity;
          showNotification(
            `Cannot exceed available stock: ${item.title}.`,
            "warning"
          );
        }

        const updatedItemUnits = { ...prevItemUnits, [itemId]: adjustedUnits };

        // Update input value to show the rounded number
        setInputValues((prev) => ({
          ...prev,
          [itemId]: adjustedUnits.toString(),
        }));

        // Calculate weight with updated units
        const newSelectedWeight = calculateTotalWeightWithUnits(updatedItemUnits);

        // Determine pricing tier with updated weight
        const { variantPriceType: newVariantPriceType } = determinePricingTier(
          variant,
          adjustedUnits,
          newSelectedWeight
        );
        if (variantPriceType[variantId] !== newVariantPriceType) {
          setVariantPriceType((prev) => ({
            ...prev,
            [variantId]: newVariantPriceType,
          }));
        }

        // Update prices for all items in variant
        updatePricesForVariant(
          variant,
          updatedItemUnits,
          newSelectedWeight,
          newVariantPriceType
        );

        return updatedItemUnits;
      });
    },
    [
      variantsWithData,
      showNotification,
      variantPriceType,
      determinePricingTier,
      calculateTotalWeightWithUnits,
      updatePricesForVariant,
    ]
  );

  // Handle increment
  const handleIncrement = useCallback(
    (itemId, variantId) => {
      setItemUnits((prevItemUnits) => {
        const variant = variantsWithData.find((v) => v?.id === variantId);
        if (!variant?.items) return prevItemUnits;

        const item = variant.items.find((i) => i.id === itemId);
        if (!item) return prevItemUnits;

        const packQuantity = variant.units_per_pack || 1;
        const palletQuantity = variant.units_per_pallet || 0;
        const currentUnits = prevItemUnits[itemId] || 0;

        // Always increment by at least one pack
        let newUnits = currentUnits + packQuantity;

        // Handle pallet increments if applicable
        if (palletQuantity > 0 && currentUnits > 0) {
          // If we're at a pallet boundary, increment by pallet quantity
          if (
            currentUnits >= palletQuantity &&
            currentUnits % palletQuantity === 0
          ) {
            newUnits = currentUnits + palletQuantity;
          }
        }

        // Respect stock limits
        if (item.track_inventory && newUnits > item.stock) {
          newUnits = Math.floor(item.stock / packQuantity) * packQuantity;
          showNotification(
            `Cannot exceed available stock of ${item.stock} units for ${item.title}.`,
            "warning"
          );
        }

        const updatedItemUnits = { ...prevItemUnits, [itemId]: newUnits };

        // Update input value to show the new units
        setInputValues((prev) => ({ ...prev, [itemId]: newUnits.toString() }));

        // Calculate weight with updated units
        const newSelectedWeight = calculateTotalWeightWithUnits(updatedItemUnits);

        // Determine pricing tier with updated weight
        const { variantPriceType: newVariantPriceType } = determinePricingTier(
          variant,
          newUnits,
          newSelectedWeight
        );
        if (variantPriceType[variantId] !== newVariantPriceType) {
          setVariantPriceType((prev) => ({
            ...prev,
            [variantId]: newVariantPriceType,
          }));
        }

        // Update prices for all items in variant
        updatePricesForVariant(
          variant,
          updatedItemUnits,
          newSelectedWeight,
          newVariantPriceType
        );

        return updatedItemUnits;
      });
    },
    [
      variantsWithData,
      showNotification,
      variantPriceType,
      determinePricingTier,
      calculateTotalWeightWithUnits,
      updatePricesForVariant,
    ]
  );

  const handleDecrement = useCallback(
    (itemId, variantId) => {
      setItemUnits((prevItemUnits) => {
        const variant = variantsWithData.find((v) => v?.id === variantId);
        if (!variant?.items) return prevItemUnits;

        const packQuantity = variant.units_per_pack || 1;
        const palletQuantity = variant.units_per_pallet || 0;
        const currentUnits = prevItemUnits[itemId] || 0;

        // Always decrement by at least one pack
        let newUnits = Math.max(0, currentUnits - packQuantity);

        // Handle pallet decrements if applicable
        if (palletQuantity > 0) {
          if (currentUnits === palletQuantity) {
            // If exactly one pallet, decrement by one pack
            newUnits = currentUnits - packQuantity;
          } else if (
            currentUnits > palletQuantity &&
            currentUnits % palletQuantity === 0
          ) {
            // If at pallet boundary, decrement by one pallet
            newUnits = currentUnits - palletQuantity;
          }
        }

        const updatedItemUnits = { ...prevItemUnits, [itemId]: newUnits };

        // Update input value to show the new units
        setInputValues((prev) => ({ ...prev, [itemId]: newUnits.toString() }));

        // Calculate weight with updated units
        const newSelectedWeight = calculateTotalWeightWithUnits(updatedItemUnits);

        // Determine pricing tier with updated weight
        const { variantPriceType: newVariantPriceType } = determinePricingTier(
          variant,
          newUnits,
          newSelectedWeight
        );
        if (variantPriceType[variantId] !== newVariantPriceType) {
          setVariantPriceType((prev) => ({
            ...prev,
            [variantId]: newVariantPriceType,
          }));
        }

        // Update prices for all items in variant
        updatePricesForVariant(
          variant,
          updatedItemUnits,
          newSelectedWeight,
          newVariantPriceType
        );

        return updatedItemUnits;
      });
    },
    [
      variantsWithData,
      variantPriceType,
      determinePricingTier,
      calculateTotalWeightWithUnits,
      updatePricesForVariant,
    ]
  );

  // Handle units display type change (pack/pallet)
  const handleUnitsDisplayTypeChange = useCallback((variantId, displayType) => {
    setUnitsDisplayType((prev) => ({ ...prev, [variantId]: displayType }));
  }, []);

  const handlePriceClick = useCallback(
    (itemId, variantId, price, tier) => {
      const variant = variantsWithData.find((v) => v?.id === variantId);
      if (!variant) return;

      const item = variant.items.find((i) => i.id === itemId);
      if (!item) return;

      const unitsPerPack = variant.units_per_pack || 1;
      const unitsPerPallet = variant.units_per_pallet || 0;
      let newUnits =
        tier.range_start *
        (tier.tier_type === "pack" ? unitsPerPack : unitsPerPallet);

      // Ensure newUnits is a multiple of pack quantity
      if (tier.tier_type === "pallet") {
        // First calculate based on pallet quantity
        newUnits = tier.range_start * unitsPerPallet;

        // Then round up to nearest multiple of pack quantity if needed
        if (newUnits % unitsPerPack !== 0) {
          newUnits = Math.ceil(newUnits / unitsPerPack) * unitsPerPack;
        }
      }

      // Handle weight-based minimum for pallets
      if (tier.tier_type === "pallet") {
        const itemWeight = item.weight || 0;
        const itemWeightUnit = item.weight_unit || "kg";
        const conversionFactor =
          itemWeightUnit === "lb"
            ? 0.453592
            : itemWeightUnit === "oz"
            ? 0.0283495
            : itemWeightUnit === "g"
            ? 0.001
            : 1;
        const weightPerUnit = itemWeight * conversionFactor;

        if (weightPerUnit > 0) {
          const requiredUnits = Math.ceil(850 / weightPerUnit);
          newUnits = Math.max(newUnits, requiredUnits);

          // Ensure we're still at a pack multiple
          if (newUnits % unitsPerPack !== 0) {
            newUnits = Math.ceil(newUnits / unitsPerPack) * unitsPerPack;
          }

          if (item.track_inventory && newUnits > item.stock) {
            newUnits = Math.floor(item.stock / unitsPerPack) * unitsPerPack;
            showNotification(
              `Adjusted to available stock of ${item.stock} units for ${item.title} to reach ~850kg.`,
              "warning"
            );
          }
        }
      }

      // Final validation against stock
      if (item.track_inventory && newUnits > item.stock) {
        newUnits = Math.floor(item.stock / unitsPerPack) * unitsPerPack;
        showNotification(
          `Cannot exceed available stock of ${item.stock} units for ${item.title}.`,
          "warning"
        );
      }

      setItemUnits((prevItemUnits) => {
        const updatedItemUnits = { ...prevItemUnits, [itemId]: newUnits };

        // Calculate weight with updated units
        const newSelectedWeight = calculateTotalWeightWithUnits(updatedItemUnits);

        // Determine pricing tier with updated weight
        const { variantPriceType: newVariantPriceType } = determinePricingTier(
          variant,
          newUnits,
          newSelectedWeight
        );
        if (variantPriceType[variantId] !== newVariantPriceType) {
          setVariantPriceType((prev) => ({
            ...prev,
            [variantId]: newVariantPriceType,
          }));
        }

        // Update prices for all items in variant
        updatePricesForVariant(
          variant,
          updatedItemUnits,
          newSelectedWeight,
          newVariantPriceType
        );

        return updatedItemUnits;
      });

      setInputValues((prev) => ({ ...prev, [itemId]: newUnits.toString() }));
      setSelectedTiers((prev) => ({ ...prev, [item.id]: tier.id }));
      setShowStickyBar(true);

      const discountedPrice = applyDiscount(price, itemId);
      calculateTotalPrice(itemId, variantId, newUnits, tier, discountedPrice);
    },
    [
      variantsWithData,
      showNotification,
      calculateTotalWeightWithUnits,
      determinePricingTier,
      updatePricesForVariant,
      applyDiscount,
      calculateTotalPrice,
    ]
  );

  // Image handling functions
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
      const currentDisplayPriceType =
        variantDisplayPriceType[variant.id] || "pack"; // Changed to pack
      const currentPriceType = variantPriceType[variant.id] || "pack";

      variant.items.forEach((item) => {
        const units = itemUnits[item.id] || 0;
        if (units <= 0) return;

        const unitsPerPack = variant.units_per_pack || 1;
        const numberOfPacks = Math.ceil(units / unitsPerPack);

        const activeTier = findApplicableTier(variant, units, currentPriceType);
        let price = 0;

        if (activeTier) {
          const pricingData = activeTier.pricing_data?.find(
            (pd) => pd.item === item.id
          );
          if (pricingData && isFinite(parseFloat(pricingData.price))) {
            price = applyDiscount(parseFloat(pricingData.price), item.id);
          }
        }

        const subtotal = price * units;
        const packSubtotal = price * unitsPerPack * numberOfPacks;

        totalPrice += subtotal;

        const itemWeight = item.weight || 0;
        const itemWeightUnit = item.weight_unit || "kg";
        const conversionFactor =
          itemWeightUnit === "lb"
            ? 0.453592
            : itemWeightUnit === "oz"
            ? 0.0283495
            : itemWeightUnit === "g"
            ? 0.001
            : 1;
        const totalWeight = itemWeight * conversionFactor * units;

        const primaryImage = item.images?.[0]?.image || "";
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
          discountPercentage:
            exclusiveDiscounts[item.id]?.discount_percentage || 0,
          activeTierId: activeTier?.id || null,
          weight: totalWeight,
        });
      });
    });
    return { items, totalPrice };
  }, [
    itemUnits,
    variantDisplayPriceType,
    variantPriceType,
    variantsWithData,
    exclusiveDiscounts,
    findApplicableTier,
    applyDiscount,
  ]);

  // Handle add to cart
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
      const cart = await getOrCreateCart();
      if (!cart?.id) {
        showNotification("Failed to retrieve or create cart.", "error");
        return;
      }

      const cartItems = [];
      for (const item of items) {
        const variant = variantsWithData.find((v) => v.id === item.variantId);
        if (!variant) continue;

        const tierId = item.activeTierId;
        if (!tierId) {
          showNotification(
            `No pricing tier selected for item ${item.description}.`,
            "error"
          );
          return;
        }

        const tier = variant.pricing_tiers?.find((t) => t.id === tierId);
        if (!tier) {
          showNotification(
            `Invalid pricing tier for item ${item.description}.`,
            "error"
          );
          return;
        }

        const pricingData = tier.pricing_data?.find(
          (pd) => pd.item === item.id
        );
        if (!pricingData) {
          showNotification(
            `No pricing data found for item ${item.description}.`,
            "error"
          );
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

      await addCartItem(cartItems);
      showNotification(
        `Added ${cartItems.length} item(s) to cart successfully!`,
        "success"
      );

      // Reset states
      setItemUnits((prev) => {
        const resetUnits = { ...prev };
        Object.keys(resetUnits).forEach((key) => (resetUnits[key] = 0));
        return resetUnits;
      });
      setInputValues((prev) => {
        const resetInputs = { ...prev };
        Object.keys(resetInputs).forEach((key) => (resetInputs[key] = "0"));
        return resetInputs;
      });
      setSelectedTiers({});
      setItemPrices({});
      setItemPackPrices({});
      setShowStickyBar(false);

      // Update cart weight after adding items
      const updatedCart = await getOrCreateCart();
      const cartId = updatedCart.id;
      const cartUrl = `${BASE_URL}ecommerce/carts/${cartId}/`;
      const cartResponse = await axios.get(cartUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setCartWeight(parseFloat(cartResponse.data.total_weight) || 0);

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
    variantsWithData,
    exclusiveDiscounts,
  ]);

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
      />

      {!variantsWithData?.length && (
        <div className={`${TableStyles.noVariants} b6 clr-text`}>
          No product variants available.
        </div>
      )}

      {variantsWithData.map((variant) => {
        if (!variant?.id || !variant.items) return null;
        const pricingTiers = (variant.pricing_tiers || []).sort((a, b) =>
          a.tier_type === b.tier_type
            ? a.range_start - b.range_start
            : a.tier_type === "pack"
            ? -1
            : 1
        );
        const currentPriceType = variantPriceType[variant.id] || "pack";
        const currentDisplayPriceType =
          variantDisplayPriceType[variant.id] || "pack"; // Changed to pack
        const currentUnitsDisplayType = unitsDisplayType[variant.id] || "pack";
        const unitsToShow =
          currentUnitsDisplayType === "pack"
            ? variant.units_per_pack
            : variant.units_per_pallet;

        return (
          <div
            key={variant.id}
            id={`variant-${variant.id}`}
            className={TableStyles.variantSection}
          >
            <h4 className={`${TableStyles.variantHeading} clr-text`}>
              {variant.name || "Unnamed Variant"}
            </h4>

            {variant.tableFields?.length > 0 &&
              variant.items.every((item) => !item.data_entries?.length) && (
                <div className={`${TableStyles.warning} b6 clr-danger`}>
                  No ItemData entries found for this variant's items.
                </div>
              )}

            <div className={TableStyles.tableContainer}>
              <div className={TableStyles.tableWrapper}>
                <table className={TableStyles.table}>
                  <thead>
                    <tr>
                      <th
                        className={`${TableStyles.defaultHeader} b6 clr-text`}
                      >
                        Image
                      </th>
                      <th
                        className={`${TableStyles.defaultHeader} b6 clr-text`}
                      >
                        SKU
                      </th>
                      {variant.tableFields?.map((field) => (
                        <th
                          key={field.id}
                          className={`${
                            TableStyles.defaultHeader
                          } b6 clr-text ${
                            field.long_field ? TableStyles.longField : ""
                          }`}
                        >
                          {field.name}
                        </th>
                      ))}
                      {pricingTiers.map((tier) => (
                        <th
                          key={tier.id}
                          className={`${TableStyles.pricingTierHeader} b6 clr-text`}
                        >
                          {tier.tier_type === "pack" ? "Packs" : "Pallets"}{" "}
                          {tier.range_start}
                          {tier.no_end_range ? "+" : `-${tier.range_end}`}
                        </th>
                      ))}
                      <th
                        className={`${TableStyles.unitsPerHeader} b6 clr-text`}
                      >
                        <div className={TableStyles.thWithButtons}>
                          Units per
                          <span className={TableStyles.thButtonsWrapper}>
                            <button
                              className={`${TableStyles.thButton} b6 clr-text ${
                                currentUnitsDisplayType === "pack"
                                  ? TableStyles.active
                                  : ""
                              }`}
                              onClick={() =>
                                handleUnitsDisplayTypeChange(variant.id, "pack")
                              }
                              aria-label="Show units per pack"
                            >
                              <Package className="icon-xms" /> Pack
                            </button>
                            {variant.show_units_per !== "pack" &&
                              variant.units_per_pallet && (
                                <button
                                  className={`${
                                    TableStyles.thButton
                                  } b6 clr-text ${
                                    currentUnitsDisplayType === "pallet"
                                      ? TableStyles.active
                                      : ""
                                  }`}
                                  onClick={() =>
                                    handleUnitsDisplayTypeChange(
                                      variant.id,
                                      "pallet"
                                    )
                                  }
                                  aria-label="Show units per pallet"
                                >
                                  <Archive className="icon-xms" /> Pallet
                                </button>
                              )}
                          </span>
                        </div>
                      </th>
                      <th
                        className={`${TableStyles.unitsInputHeader} b6 clr-text`}
                      >
                        No. of Units
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.items.map((item) => {
                      const images = item.images?.map((img) => img.image) || [];
                      const primaryImage =
                        imageLoadFailed[item.id] || !images.length
                          ? ""
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
                          <td
                            className={`${TableStyles.imageColTd} b6 clr-text`}
                          >
                            {imageLoadFailed[item.id] || !images.length ? (
                              <span className="b6 clr-gray">
                                Image Not Available
                              </span>
                            ) : (
                              <img
                                src={primaryImage}
                                alt={`${item.sku || "item"} primary image`}
                                className={TableStyles.colImageContainer}
                                onClick={() =>
                                  images.length > 0 &&
                                  openImagePreview(
                                    images,
                                    variant.name,
                                    item.title || "Item"
                                  )
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
                          <td className="b6 clr-text">{item.sku || "-"}</td>
                          {variant.tableFields?.map((field) => {
                            const itemData = item.data_entries?.find(
                              (data) =>
                                Number(data.field?.id) === Number(field.id)
                            );
                            return (
                              <td key={field.id} className="b6 clr-text">
                                {itemData ? (
                                  field.field_type === "image" &&
                                  itemData.value_image ? (
                                    imageLoadFailed[item.id] ? (
                                      <span className="b6 clr-gray">
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
                                <td key={tier.id} className="b6 clr-gray">
                                  -
                                </td>
                              );

                            const price = parseFloat(pricingData.price);
                            const hasDiscount =
                              exclusiveDiscounts[item.id]?.discount_percentage >
                              0;
                            const exclusivePrice = hasDiscount
                              ? applyDiscount(price, item.id)
                              : null;
                            const unitsPerPack = variant.units_per_pack || 1;
                            const unitsPerPallet = variant.units_per_pallet || 1;
                            const packPrice = price * (tier.tier_type === "pack" ? unitsPerPack : unitsPerPallet);
                            const exclusivePackPrice = hasDiscount
                              ? exclusivePrice * (tier.tier_type === "pack" ? unitsPerPack : unitsPerPallet)
                              : null;

                            const displayPrice = hasDiscount ? (
                              <>
                                <span
                                  style={{ textDecoration: "line-through" }}
                                >
                                  £{packPrice.toFixed(2)}
                                </span>
                                <span
                                  className={TableStyles.exclusivePrice}
                                >
                                  {" "}
                                  £{exclusivePackPrice.toFixed(2)}{" "}
                                  <div
                                    className={TableStyles.percentageTag}
                                  >
                                    {
                                      exclusiveDiscounts[item.id]
                                        .discount_percentage
                                    }
                                    % Off
                                  </div>
                                </span>
                              </>
                            ) : (
                              <span>£{packPrice.toFixed(2)}</span>
                            );

                            return (
                              <td key={tier.id} className="b6 clr-text">
                                <button
                                  className={`${TableStyles.priceButton} ${
                                    selectedTiers[item.id] === tier.id
                                      ? TableStyles.selectedTier
                                      : ""
                                  } b6`}
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
                          <td className="b6 clr-text">{unitsToShow || "-"}</td>
                          <td className="b6 clr-text">
                            <div className={TableStyles.unitInputGroup}>
                              <button
                                className={`${TableStyles.unitButton} ${TableStyles.unitButtonMinus}`}
                                onClick={() =>
                                  handleDecrement(item.id, variant.id)
                                }
                                aria-label={`Decrement units for ${
                                  item.sku || "item"
                                }`}
                              >
                                <Minus className="icon-s" />
                              </button>
                              <input
                                type="text"
                                value={
                                  inputValues[item.id] ??
                                  itemUnits[item.id] ??
                                  "0"
                                }
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  setInputValues((prev) => ({
                                    ...prev,
                                    [item.id]: value,
                                  }));
                                }}
                                onBlur={(e) => {
                                  const value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  handleUnitChange(item.id, variant.id, value);
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    const value = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    handleUnitChange(
                                      item.id,
                                      variant.id,
                                      value
                                    );
                                    e.target.blur();
                                  }
                                }}
                                className={TableStyles.unitInput}
                                aria-label={`Enter units for ${
                                  item.sku || "item"
                                }`}
                              />
                              <button
                                className={`${TableStyles.unitButton} ${TableStyles.unitButtonPlus}`}
                                onClick={() =>
                                  handleIncrement(item.id, variant.id)
                                }
                                aria-label={`Increment units for ${
                                  item.sku || "item"
                                }`}
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
        <div className={`${TableStyles.stickyBar} centered-layout-wrapper`}>
          <div
            className={`${TableStyles.stickyBarContent} centered-layout page-layout`}
          >
            <table className={TableStyles.productsSummaryTable}>
              <thead>
                <tr>
                  <th className="b6 clr-text">Description</th>
                  <th className="b6 clr-text">Packs</th>
                  <th className="b6 clr-text">Units</th>
                  <th className="b6 clr-text">Weight</th>
                  <th className="b6 clr-text">Subtotal</th>
                  <th className="b6 clr-text">Total</th>
                </tr>
              </thead>
              <tbody>
                {computeSelectedItems().items.map((item) => {
                  const displaySubtotal =
                    item.displayPriceType === "pack"
                      ? item.packSubtotal
                      : item.subtotal;
                  const originalSubtotal =
                    item.discountPercentage > 0
                      ? displaySubtotal / (1 - item.discountPercentage / 100)
                      : displaySubtotal;

                  return (
                    <tr key={item.id}>
                      <td className="b6 clr-text">
                        {item?.description?.slice(0, 18)}
                        {item?.description?.length > 18 ? "..." : ""}
                      </td>
                      <td className="b6 clr-text">{item.packs}</td>
                      <td className="b6 clr-text">{item.units}</td>
                      <td className="b6 clr-text">
                        {item.weight.toFixed(2)} kg
                      </td>
                      <td className="b6 clr-text">
                        {item.discountPercentage > 0 ? (
                          <span style={{ textDecoration: "line-through" }}>
                            £{originalSubtotal.toFixed(2)}
                          </span>
                        ) : (
                          <span>£{originalSubtotal.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="b6 clr-text">
                        {item.discountPercentage > 0 ? (
                          <>
                            <span className={TableStyles.exclusivePrice}>
                              £{displaySubtotal.toFixed(2)}{" "}
                              <div className={TableStyles.percentageTag}>
                                {item.discountPercentage}% Off
                              </div>
                            </span>
                          </>
                        ) : (
                          <span>£{displaySubtotal.toFixed(2)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className={TableStyles.stickyBarActions}>
              <div className={TableStyles.actionButtons}>
                <button
                  className="primary-btn text-large"
                  onClick={handleAddToCart}
                  aria-label="Add selected items to cart"
                >
                  Add to Cart
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

ProductsTable.propTypes = {
  variantsWithData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          weight: PropTypes.number,
          weight_unit: PropTypes.string,
        })
      ).isRequired,
    })
  ).isRequired,
};

ProductsTable.defaultProps = {
  variantsWithData: [],
};

export default memo(ProductsTable);