// import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import PropTypes from "prop-types";
// import TableStyles from "assets/css/TableStyles.module.css";
// import { Package, Archive, Plus, Minus } from "lucide-react";
// import {
//   getOrCreateCart,
//   getUserExclusivePrice,
//   addCartItem,
//   getCartItems,
// } from "utils/api/ecommerce";
// import Notification from "components/Notification";
// import ImagePreview from "components/ImagePreview";
// import axios from "axios";
// import { BASE_URL } from "utils/global";

// const ProductsTable = ({ variantsWithData }) => {
//   const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
//   const navigate = useNavigate();

//   // State management
//   const [state, setState] = useState({
//     itemUnits: {},
//     inputValues: {},
//     variantPriceType: {},
//     itemPrices: {},
//     itemPackPrices: {},
//     selectedTiers: {},
//     variantDisplayPriceType: {},
//     showStickyBar: false,
//     exclusiveDiscounts: {},
//     notification: { message: "", type: "", visible: false },
//     selectedImages: null,
//     imageLoadFailed: {},
//     unitsDisplayType: {},
//     cartWeight: 0,
//     cartItems: [], // Initialize as empty array
//   });

//   // Memoized variants data
//   const memoizedVariants = useMemo(
//     () => variantsWithData || [],
//     [variantsWithData]
//   );

//   // Notification helper
//   const showNotification = useCallback((message, type) => {
//     setState((prev) => ({
//       ...prev,
//       notification: { message, type, visible: true },
//     }));
//     setTimeout(() => {
//       setState((prev) => ({
//         ...prev,
//         notification: { ...prev.notification, visible: false },
//       }));
//     }, 3000);
//   }, []);

//   // Fetch cart data on component mount
//   useEffect(() => {
//     const fetchCartData = async () => {
//       if (!isLoggedIn) return;

//       try {
//         const cart = await getOrCreateCart();
//         const cartUrl = `${BASE_URL}ecommerce/carts/${cart.id}/`;
//         const cartResponse = await axios.get(cartUrl, {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         });
//         const weight = parseFloat(cartResponse.data.total_weight) || 0;

//         // Fetch cart items - ensure we always get an array
//         const itemsResponse = await getCartItems(cart.id);
//         const cartItems = Array.isArray(itemsResponse) ? itemsResponse : [];

//         setState((prev) => ({
//           ...prev,
//           cartWeight: weight,
//           cartItems,
//         }));
//       } catch (error) {
//         console.error("Failed to fetch cart data:", error.message);
//         setState((prev) => ({
//           ...prev,
//           cartWeight: 0,
//           cartItems: [], // Fallback to empty array
//         }));
//       }
//     };

//     fetchCartData();
//   }, [isLoggedIn]);

//   // Initialize states when variantsWithData or cartItems changes
//   useEffect(() => {
//     const initialUnits = {};
//     const initialInputValues = {};
//     const initialPriceType = {};
//     const initialSelectedTiers = {};
//     const initialDisplayPriceType = {};
//     const initialUnitsDisplayType = {};

//     // Calculate total units per item from cart - safe array handling
//     const cartItemUnits = {};
//     const cartItemTiers = {};
//     (state.cartItems || []).forEach((cartItem) => {
//       const itemId = cartItem.item;
//       const packQuantity = cartItem.pack_quantity || 1;
//       const unitsPerPack =
//         memoizedVariants.flatMap((v) => v.items).find((i) => i.id === itemId)
//           ?.units_per_pack || 1;
//       const units = packQuantity * unitsPerPack;
//       cartItemUnits[itemId] = (cartItemUnits[itemId] || 0) + units;
//       cartItemTiers[itemId] = cartItem.pricing_tier; // Store the pricing tier from cart
//     });

//     memoizedVariants.forEach((variant) => {
//       if (!variant?.id || !Array.isArray(variant.items)) return;

//       const supportsPallets = variant.units_per_pallet > 0;
//       initialPriceType[variant.id] =
//         (supportsPallets && state.cartWeight >= 750) ||
//         (supportsPallets && variant.show_units_per === "pallet")
//           ? "pallet"
//           : "pack";

//       initialDisplayPriceType[variant.id] = "pack";
//       initialUnitsDisplayType[variant.id] = "pack";

//       variant.items.forEach((item) => {
//         if (!item?.id) return;

//         // Initialize with cart quantity if exists
//         const cartUnits = cartItemUnits[item.id] || 0;
//         initialUnits[item.id] = cartUnits;
//         initialInputValues[item.id] = cartUnits.toString();

//         // Use the cart item's pricing tier if available, otherwise find appropriate tier
//         if (cartUnits > 0) {
//           if (cartItemTiers[item.id]) {
//             // Use the tier from cart if available
//             initialSelectedTiers[item.id] = cartItemTiers[item.id];
//           } else {
//             // Fallback to finding applicable tier
//             const applicableTier = findApplicableTier(
//               variant,
//               item,
//               cartUnits,
//               initialPriceType[variant.id]
//             );
//             initialSelectedTiers[item.id] = applicableTier?.id || null;
//           }
//         } else {
//           initialSelectedTiers[item.id] = null;
//         }
//       });
//     });

//     setState((prev) => ({
//       ...prev,
//       itemUnits: initialUnits,
//       inputValues: initialInputValues,
//       variantPriceType: initialPriceType,
//       selectedTiers: initialSelectedTiers,
//       variantDisplayPriceType: initialDisplayPriceType,
//       unitsDisplayType: initialUnitsDisplayType,
//       showStickyBar: Object.values(initialUnits).some((units) => units > 0),
//     }));

//     // Calculate initial prices based on cart items
//     if (Object.keys(initialUnits).length > 0) {
//       updateAllVariantPricingTiers(initialUnits, state.cartWeight);
//     }
//   }, [memoizedVariants, state.cartWeight, state.cartItems]);

//   // Show sticky bar when items are selected
//   useEffect(() => {
//     const hasSelectedItems = Object.values(state.itemUnits).some(
//       (units) => units > 0
//     );
//     if (hasSelectedItems !== state.showStickyBar) {
//       setState((prev) => ({ ...prev, showStickyBar: hasSelectedItems }));
//     }
//   }, [state.itemUnits, state.showStickyBar]);

//   // Fetch exclusive prices for logged in users
//   useEffect(() => {
//     if (!isLoggedIn || !memoizedVariants.length) return;

//     const abortController = new AbortController();
//     let isMounted = true;

//     const fetchExclusivePrices = async () => {
//       const discounts = {};
//       try {
//         for (const variant of memoizedVariants) {
//           if (!variant?.items) continue;
//           for (const item of variant.items) {
//             if (!item?.id) continue;
//             const exclusivePrices = await getUserExclusivePrice(
//               item.id,
//               abortController.signal
//             );
//             discounts[item.id] =
//               Array.isArray(exclusivePrices) && exclusivePrices.length > 0
//                 ? {
//                     id: exclusivePrices,
//                     discount_percentage:
//                       Number(exclusivePrices[0].discount_percentage) || 0,
//                   }
//                 : { id: null, discount_percentage: 0 };
//           }
//         }
//         if (isMounted) {
//           setState((prev) => ({ ...prev, exclusiveDiscounts: discounts }));
//         }
//       } catch (error) {
//         if (error.name !== "AbortError") {
//           console.error("Failed to fetch exclusive prices:", error.message);
//         }
//       }
//     };

//     fetchExclusivePrices();
//     return () => {
//       isMounted = false;
//       abortController.abort();
//     };
//   }, [isLoggedIn, memoizedVariants]);

//   // Memoized helper functions
//   const findApplicableTier = useCallback((variant, item, units, priceType) => {
//     const pricingTiers =
//       variant?.pricing_tiers?.filter((tier) => tier.tier_type === priceType) ||
//       [];
//     if (!pricingTiers.length) return null;

//     const unitsPerPack = item.units_per_pack || 1;
//     const quantity =
//       priceType === "pack"
//         ? Math.ceil(units / unitsPerPack)
//         : Math.ceil(units / (variant.units_per_pallet || 1));

//     return (
//       pricingTiers.find((tier) =>
//         tier.no_end_range
//           ? quantity >= tier.range_start
//           : quantity >= tier.range_start &&
//             (tier.range_end === null || quantity <= tier.range_end)
//       ) || pricingTiers.sort((a, b) => b.range_start - a.range_start)[0]
//     );
//   }, []);

//   const applyDiscount = useCallback(
//     (price, itemId) => {
//       const discountPercentage =
//         state.exclusiveDiscounts[itemId]?.discount_percentage || 0;
//       return price * (1 - discountPercentage / 100);
//     },
//     [state.exclusiveDiscounts]
//   );

//   const calculateTotalPrice = useCallback(
//     (itemId, variantId, units, tier, price) => {
//       const variant = memoizedVariants.find((v) => v?.id === variantId);
//       const item = variant?.items.find((i) => i.id === itemId);
//       if (!variant || !item || !tier || units <= 0 || !isFinite(price)) {
//         setState((prev) => ({
//           ...prev,
//           itemPrices: { ...prev.itemPrices, [itemId]: 0 },
//           itemPackPrices: { ...prev.itemPackPrices, [itemId]: 0 },
//         }));
//         return 0;
//       }

//       const unitsPerPack = item.units_per_pack || 1;
//       const numberOfPacks = Math.ceil(units / unitsPerPack);
//       const packPrice = price * unitsPerPack;
//       const totalPrice = price * units;
//       const totalPackPrice = packPrice * numberOfPacks;

//       setState((prev) => ({
//         ...prev,
//         itemPrices: { ...prev.itemPrices, [itemId]: totalPrice },
//         itemPackPrices: { ...prev.itemPackPrices, [itemId]: totalPackPrice },
//       }));
//       return totalPrice;
//     },
//     [memoizedVariants]
//   );

//   const calculateTotalWeightWithUnits = useCallback(
//     (unitsToCalculate) => {
//       let newWeight = 0;
//       memoizedVariants.forEach((variant) => {
//         if (!variant?.items) return;
//         variant.items.forEach((item) => {
//           const units = unitsToCalculate[item.id] || 0;
//           const itemWeight = item.weight || 0;
//           const itemWeightUnit = item.weight_unit || "kg";
//           const conversionFactor =
//             itemWeightUnit === "lb"
//               ? 0.453592
//               : itemWeightUnit === "oz"
//               ? 0.0283495
//               : itemWeightUnit === "g"
//               ? 0.001
//               : 1;
//           newWeight += itemWeight * conversionFactor * units;
//         });
//       });
//       return newWeight;
//     },
//     [memoizedVariants]
//   );

//   // Updated function to determine pricing tier for all variants based on total weight
//   const updateAllVariantPricingTiers = useCallback(
//     (currentItemUnits, newCartWeight = state.cartWeight) => {
//       const selectedItemsWeight =
//         calculateTotalWeightWithUnits(currentItemUnits);
//       const totalWeight = newCartWeight + selectedItemsWeight;

//       // Determine the new price type for each variant
//       const newVariantPriceTypes = {};
//       const newSelectedTiers = { ...state.selectedTiers };
//       const newItemPrices = { ...state.itemPrices };
//       const newItemPackPrices = { ...state.itemPackPrices };

//       memoizedVariants.forEach((variant) => {
//         if (!variant?.id || !variant.items) return;

//         const hasPalletPricing = variant.pricing_tiers?.some(
//           (tier) => tier.tier_type === "pallet"
//         );
//         const currentPriceType = state.variantPriceType[variant.id] || "pack";

//         // Determine new price type based on total weight
//         let newPriceType = currentPriceType;
//         if (totalWeight >= 750 && hasPalletPricing) {
//           newPriceType = "pallet";
//         } else {
//           newPriceType = "pack";
//         }

//         newVariantPriceTypes[variant.id] = newPriceType;

//         // Update pricing for all items in this variant
//         variant.items.forEach((item) => {
//           const units = currentItemUnits[item.id] || 0;
//           if (units > 0) {
//             // Find applicable tier (try determined type first, fall back to pack)
//             let applicableTier = findApplicableTier(
//               variant,
//               item,
//               units,
//               newPriceType
//             );
//             if (!applicableTier && newPriceType === "pallet") {
//               applicableTier = findApplicableTier(variant, item, units, "pack");
//             }

//             if (applicableTier) {
//               const pricingData = applicableTier.pricing_data?.find(
//                 (pd) => pd.item === item.id
//               );
//               if (pricingData) {
//                 const price = applyDiscount(
//                   parseFloat(pricingData.price),
//                   item.id
//                 );
//                 const totalPrice = price * units;

//                 newItemPrices[item.id] = totalPrice;
//                 newSelectedTiers[item.id] = applicableTier.id;

//                 // Calculate pack price if needed
//                 const unitsPerPack = item.units_per_pack || 1;
//                 const numberOfPacks = Math.ceil(units / unitsPerPack);
//                 newItemPackPrices[item.id] =
//                   price * unitsPerPack * numberOfPacks;
//               }
//             } else {
//               newItemPrices[item.id] = 0;
//               newItemPackPrices[item.id] = 0;
//               newSelectedTiers[item.id] = null;
//             }
//           } else {
//             newItemPrices[item.id] = 0;
//             newItemPackPrices[item.id] = 0;
//             newSelectedTiers[item.id] = null;
//           }
//         });
//       });

//       // Show notification if pricing tier changed
//       const changedVariants = Object.keys(newVariantPriceTypes).filter(
//         (variantId) =>
//           state.variantPriceType[variantId] !== newVariantPriceTypes[variantId]
//       );

//       // Update the state with all changes
//       setState((prev) => ({
//         ...prev,
//         variantPriceType: newVariantPriceTypes,
//         selectedTiers: newSelectedTiers,
//         itemPrices: newItemPrices,
//         itemPackPrices: newItemPackPrices,
//       }));
//     },
//     [
//       state.cartWeight,
//       state.variantPriceType,
//       state.selectedTiers,
//       state.itemPrices,
//       state.itemPackPrices,
//       memoizedVariants,
//       calculateTotalWeightWithUnits,
//       findApplicableTier,
//       applyDiscount,
//       showNotification,
//     ]
//   );

//   // Event handlers
//   const handleUnitChange = useCallback(
//     (itemId, variantId, value) => {
//       const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;

//       setState((prev) => {
//         // 1. Update the changed item's quantity first
//         const variant = memoizedVariants.find((v) => v?.id === variantId);
//         if (!variant?.items) return prev;

//         const item = variant.items.find((i) => i.id === itemId);
//         if (!item) return prev;

//         const packQuantity = item.units_per_pack || 1;
//         let adjustedUnits =
//           Math.round(numericValue / packQuantity) * packQuantity;
//         adjustedUnits = Math.max(0, adjustedUnits);

//         // Check stock before allowing changes
//         if (item.track_inventory) {
//           const currentCartQuantity = prev.itemUnits[item.id] || 0;
//           const availableStock = item.stock || 0;

//           if (adjustedUnits > availableStock) {
//             showNotification(
//               `Cannot exceed available stock of ${availableStock} units for ${item.title}`,
//               "warning"
//             );
//             adjustedUnits = Math.min(adjustedUnits, availableStock);
//           }
//         }

//         // Create updated units map
//         const updatedItemUnits = { ...prev.itemUnits, [itemId]: adjustedUnits };

//         // 2. Calculate new total weight (cart + all selected items)
//         const newSelectedWeight =
//           calculateTotalWeightWithUnits(updatedItemUnits);
//         const totalWeight = prev.cartWeight + newSelectedWeight;

//         // 3. Update input values
//         const updatedState = {
//           ...prev,
//           itemUnits: updatedItemUnits,
//           inputValues: {
//             ...prev.inputValues,
//             [itemId]: adjustedUnits.toString(),
//           },
//           showStickyBar: Object.values(updatedItemUnits).some((u) => u > 0),
//         };

//         // 4. Update pricing for all variants based on new total weight
//         updateAllVariantPricingTiers(updatedItemUnits, prev.cartWeight);

//         return updatedState;
//       });
//     },
//     [
//       memoizedVariants,
//       showNotification,
//       calculateTotalWeightWithUnits,
//       updateAllVariantPricingTiers,
//     ]
//   );

//   // Compute selected items for sticky bar
//   const computeSelectedItems = useCallback(() => {
//     const items = [];
//     let totalPrice = 0;

//     memoizedVariants.forEach((variant) => {
//       if (!variant?.items) return;
//       const currentDisplayPriceType =
//         state.variantDisplayPriceType[variant.id] || "pack";
//       const currentPriceType = state.variantPriceType[variant.id] || "pack";

//       variant.items.forEach((item) => {
//         const units = state.itemUnits[item.id] || 0;
//         if (units <= 0) return;

//         const unitsPerPack = item.units_per_pack || 1;
//         const numberOfPacks = Math.ceil(units / unitsPerPack);
//         const activeTier = findApplicableTier(
//           variant,
//           item,
//           units,
//           currentPriceType
//         );
//         let price = 0;

//         if (activeTier) {
//           const pricingData = activeTier.pricing_data?.find(
//             (pd) => pd.item === item.id
//           );
//           if (pricingData && isFinite(parseFloat(pricingData.price))) {
//             price = applyDiscount(parseFloat(pricingData.price), item.id);
//           }
//         }

//         const subtotal = price * units;
//         const packSubtotal = price * unitsPerPack * numberOfPacks;
//         totalPrice += subtotal;

//         const itemWeight = item.weight || 0;
//         const itemWeightUnit = item.weight_unit || "kg";
//         const conversionFactor =
//           itemWeightUnit === "lb"
//             ? 0.453592
//             : itemWeightUnit === "oz"
//             ? 0.0283495
//             : itemWeightUnit === "g"
//             ? 0.001
//             : 1;
//         const totalWeight = itemWeight * conversionFactor * units;

//         items.push({
//           id: item.id,
//           description: item.title || "Item",
//           packs: numberOfPacks,
//           units,
//           subtotal,
//           packSubtotal,
//           displayPriceType: currentDisplayPriceType,
//           variantId: variant.id,
//           image: item.images?.[0]?.image || "",
//           discountPercentage:
//             state.exclusiveDiscounts[item.id]?.discount_percentage || 0,
//           activeTierId: activeTier?.id || null,
//           weight: totalWeight,
//         });
//       });
//     });

//     return { items, totalPrice };
//   }, [memoizedVariants, state, findApplicableTier, applyDiscount]);

//   // Handle add to cart
//   const handleAddToCart = useCallback(async () => {
//     if (!isLoggedIn) {
//       showNotification("Please log in to add items to cart.", "error");
//       navigate("/login");
//       return;
//     }

//     const { items } = computeSelectedItems();
//     if (!items.length) {
//       showNotification("No items selected to add to cart.", "warning");
//       return;
//     }

//     try {
//       const cart = await getOrCreateCart();
//       if (!cart?.id) {
//         showNotification("Failed to retrieve or create cart.", "error");
//         return;
//       }

//       // In the handleAddToCart function, modify the cartItems mapping to include unit_type based on pricing tier
//       const cartItems = items
//         .map((item) => {
//           const variant = memoizedVariants.find((v) => v.id === item.variantId);
//           if (!variant) return null;

//           const tier = variant.pricing_tiers?.find(
//             (t) => t.id === item.activeTierId
//           );
//           if (!tier) {
//             showNotification(
//               `Invalid pricing tier for item ${item.description}.`,
//               "error"
//             );
//             return null;
//           }

//           const itemObj = variant.items.find((i) => i.id === item.id);
//           const unitsPerPack = itemObj?.units_per_pack || 1;

//           // Fix: Get just the ID from exclusiveDiscounts
//           const exclusivePrice = state.exclusiveDiscounts[item.id];
//           const userExclusivePriceId = exclusivePrice?.id?.[0]?.id || null;

//           // Determine unit_type based on tier type
//           const unitType = tier.tier_type === "pallet" ? "pallet" : "pack";

//           return {
//             cart: cart.id,
//             item: item.id,
//             pricing_tier: tier.id,
//             pack_quantity: Math.ceil(item.units / unitsPerPack),
//             unit_type: unitType, // This will be "pallet" or "pack" based on tier type
//             user_exclusive_price: userExclusivePriceId,
//           };
//         })
//         .filter(Boolean);

//       if (!cartItems.length) return;

//       await addCartItem(cartItems);
//       showNotification(
//         `Added ${cartItems.length} item(s) to cart successfully!`,
//         "success"
//       );

//       // Reset states
//       setState((prev) => ({
//         ...prev,
//         itemUnits: {},
//         inputValues: {},
//         selectedTiers: {},
//         itemPrices: {},
//         itemPackPrices: {},
//         showStickyBar: false,
//       }));

//       // Update cart weight and items
//       const updatedCart = await getOrCreateCart();
//       const cartResponse = await axios.get(
//         `${BASE_URL}ecommerce/carts/${updatedCart.id}/`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );
//       const itemsResponse = await getCartItems(updatedCart.id);

//       setState((prev) => ({
//         ...prev,
//         cartWeight: parseFloat(cartResponse.data.total_weight) || 0,
//         cartItems: itemsResponse || [],
//       }));

//       navigate("/cart");
//     } catch (error) {
//       console.error("Add to cart error:", error);

//       let errorMessage = "Failed to add items to cart. Please try again.";

//       if (error.response?.data) {
//         if (error.response.data.detail) {
//           try {
//             const detail = JSON.parse(error.response.data.detail);
//             if (detail.pack_quantity) {
//               errorMessage = Array.isArray(detail.pack_quantity)
//                 ? detail.pack_quantity.join(" ")
//                 : detail.pack_quantity;
//             }
//           } catch (e) {
//             errorMessage = error.response.data.detail;
//           }
//         } else if (error.response.data.pack_quantity) {
//           errorMessage = Array.isArray(error.response.data.pack_quantity)
//             ? error.response.data.pack_quantity.join(" ")
//             : error.response.data.pack_quantity;
//         } else if (typeof error.response.data === "object") {
//           errorMessage = Object.entries(error.response.data)
//             .map(
//               ([field, messages]) =>
//                 `${field}: ${
//                   Array.isArray(messages) ? messages.join(" ") : messages
//                 }`
//             )
//             .join("\n");
//         }
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       errorMessage = errorMessage
//         .replace(/^{.*['"]/, "")
//         .replace(/['"].*}$/, "");
//       showNotification(errorMessage, "error");

//       if (error.response?.data?.pack_quantity) {
//         setState((prev) => {
//           const newItemUnits = { ...prev.itemUnits };
//           const newInputValues = { ...prev.inputValues };

//           computeSelectedItems().items.forEach((item) => {
//             const variant = memoizedVariants.find(
//               (v) => v.id === item.variantId
//             );
//             if (variant) {
//               const itemObj = variant.items.find((i) => i.id === item.id);
//               const unitsPerPack = itemObj?.units_per_pack || 1;
//               const packQuantity = Math.ceil(item.units / unitsPerPack);

//               if (
//                 errorMessage.includes(`Requested: ${item.units}`) ||
//                 errorMessage.includes(`Available: ${itemObj?.stock}`)
//               ) {
//                 newItemUnits[item.id] = 0;
//                 newInputValues[item.id] = "0";
//               }
//             }
//           });

//           return {
//             ...prev,
//             itemUnits: newItemUnits,
//             inputValues: newInputValues,
//           };
//         });
//       }
//     }
//   }, [
//     isLoggedIn,
//     navigate,
//     showNotification,
//     computeSelectedItems,
//     memoizedVariants,
//     state.exclusiveDiscounts,
//   ]);

//   // Image handling functions
//   const openImagePreview = useCallback((images, variantName, productName) => {
//     setState((prev) => ({
//       ...prev,
//       selectedImages: { images, variantName, productName },
//     }));
//   }, []);

//   const closeImagePreview = useCallback(() => {
//     setState((prev) => ({ ...prev, selectedImages: null }));
//   }, []);

//   const handleImageError = useCallback((itemId) => {
//     setState((prev) => ({
//       ...prev,
//       imageLoadFailed: { ...prev.imageLoadFailed, [itemId]: true },
//     }));
//   }, []);

//   // Memoized table rendering
//   const renderTable = useMemo(() => {
//     if (!memoizedVariants.length) {
//       return (
//         <div className={`${TableStyles.noVariants} b6 clr-text`}>
//           No product variants available.
//         </div>
//       );
//     }

//     return memoizedVariants.map((variant) => {
//       if (!variant?.id || !variant.items) return null;

//       const pricingTiers = (variant.pricing_tiers || []).sort((a, b) =>
//         a.tier_type === b.tier_type
//           ? a.range_start - b.range_start
//           : a.tier_type === "pack"
//           ? -1
//           : 1
//       );

//       const currentPriceType = state.variantPriceType[variant.id] || "pack";
//       const currentDisplayPriceType =
//         state.variantDisplayPriceType[variant.id] || "pack";
//       const currentUnitsDisplayType =
//         state.unitsDisplayType[variant.id] || "pack";

//       return (
//         <div
//           key={variant.id}
//           id={`variant-${variant.id}`}
//           className={TableStyles.variantSection}
//         >
//           <h4 className={`${TableStyles.variantHeading} clr-text`}>
//             {variant.name || "Unnamed Variant"}
//           </h4>

//           {variant.tableFields?.length > 0 &&
//             variant.items.every((item) => !item.data_entries?.length) && (
//               <div className={`${TableStyles.warning} b6 clr-danger`}>
//                 No ItemData entries found for this variant's items.
//               </div>
//             )}

//           <div className={TableStyles.tableContainer}>
//             <div className={TableStyles.tableWrapper}>
//               <table className={TableStyles.table}>
//                 <thead>
//                   <tr>
//                     <th className={`${TableStyles.defaultHeader} b6 clr-text`}>
//                       Image
//                     </th>
//                     <th className={`${TableStyles.defaultHeader} b6 clr-text`}>
//                       SKU
//                     </th>
//                     {variant.tableFields?.map((field) => (
//                       <th
//                         key={field.id}
//                         className={`${TableStyles.defaultHeader} b6 clr-text ${
//                           field.long_field ? TableStyles.longField : ""
//                         }`}
//                       >
//                         {field.name}
//                       </th>
//                     ))}
//                     {pricingTiers.map((tier) => (
//                       <th
//                         key={tier.id}
//                         className={`${TableStyles.pricingTierHeader} b6 clr-text`}
//                       >

//                         {tier.range_start === tier.range_end
//                           ? `Single ${tier.tier_type === "pack" ? "Box" : "Pallet"}`
//                           : `${tier.tier_type === "pack" ? "Boxes" : "Pallets"} ${tier.range_start}${
//                               tier.no_end_range ? "+" : `-${tier.range_end}`
//                             }`}
//                       </th>
//                     ))}
//                     <th className={`${TableStyles.unitsPerHeader} b6 clr-text`}>
//                       <div className={TableStyles.thWithButtons}>
//                         Units per
//                         <span className={TableStyles.thButtonsWrapper}>
//                           <button
//                             className={`${TableStyles.thButton} b6 clr-text ${
//                               currentUnitsDisplayType === "pack"
//                                 ? TableStyles.active
//                                 : ""
//                             }`}
//                             onClick={() =>
//                               setState((prev) => ({
//                                 ...prev,
//                                 unitsDisplayType: {
//                                   ...prev.unitsDisplayType,
//                                   [variant.id]: "pack",
//                                 },
//                               }))
//                             }
//                             aria-label="Show units per pack"
//                           >
//                             <Package className="icon-xms" /> Box
//                           </button>
//                           {variant.show_units_per !== "pack" &&
//                             variant.units_per_pallet && (
//                               <button
//                                 className={`${
//                                   TableStyles.thButton
//                                 } b6 clr-text ${
//                                   currentUnitsDisplayType === "pallet"
//                                     ? TableStyles.active
//                                     : ""
//                                 }`}
//                                 onClick={() =>
//                                   setState((prev) => ({
//                                     ...prev,
//                                     unitsDisplayType: {
//                                       ...prev.unitsDisplayType,
//                                       [variant.id]: "pallet",
//                                     },
//                                   }))
//                                 }
//                                 aria-label="Show units per pallet"
//                               >
//                                 <Archive className="icon-xms" /> Pallet
//                               </button>
//                             )}
//                         </span>
//                       </div>
//                     </th>
//                     <th
//                       className={`${TableStyles.unitsInputHeader} b6 clr-text`}
//                     >
//                       No. of Units
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {variant.items.map((item) => {
//                     const images = item.images?.map((img) => img.image) || [];
//                     const primaryImage =
//                       state.imageLoadFailed[item.id] || !images.length
//                         ? ""
//                         : images[0];
//                     const unitsToShow =
//                       currentUnitsDisplayType === "pack"
//                         ? item.units_per_pack || 1
//                         : variant.units_per_pallet || 1;

//                     return (
//                       <tr
//                         key={item.id}
//                         className={
//                           state.itemUnits[item.id] > 0
//                             ? TableStyles.selectedRow
//                             : ""
//                         }
//                       >
//                         <td className={`${TableStyles.imageColTd} b6 clr-text`}>
//                           {state.imageLoadFailed[item.id] || !images.length ? (
//                             <span className="b6 clr-gray">
//                               Image Not Available
//                             </span>
//                           ) : (
//                             <img
//                               src={primaryImage}
//                               alt={`${item.sku || "item"} primary image`}
//                               className={TableStyles.colImageContainer}
//                               onClick={() =>
//                                 images.length > 0 &&
//                                 openImagePreview(
//                                   images,
//                                   variant.name,
//                                   item.title || "Item"
//                                 )
//                               }
//                               style={{
//                                 cursor:
//                                   images.length > 0 ? "pointer" : "default",
//                               }}
//                               onError={() => handleImageError(item.id)}
//                               loading="lazy"
//                             />
//                           )}
//                         </td>
//                         <td className="b6 clr-text">{item.sku || "-"}</td>
//                         {variant.tableFields?.map((field) => {
//                           const itemData = item.data_entries?.find(
//                             (data) =>
//                               Number(data.field?.id) === Number(field.id)
//                           );
//                           if (!itemData)
//                             return (
//                               <td key={field.id} className="b6 clr-text">
//                                 -
//                               </td>
//                             );

//                           return (
//                             <td key={field.id} className="b6 clr-text">
//                               {field.field_type === "image" &&
//                               itemData.value_image ? (
//                                 state.imageLoadFailed[item.id] ? (
//                                   <span className="b6 clr-gray">
//                                     Image Not Available
//                                   </span>
//                                 ) : (
//                                   <img
//                                     src={itemData.value_image}
//                                     alt={field.name}
//                                     className={TableStyles.colImageContainer}
//                                     onError={() => handleImageError(item.id)}
//                                     loading="lazy"
//                                   />
//                                 )
//                               ) : field.field_type === "price" &&
//                                 itemData.value_number != null ? (
//                                 `£${Number(itemData.value_number).toFixed(2)}`
//                               ) : field.field_type === "number" &&
//                                 itemData.value_number != null ? (
//                                 itemData.value_number
//                               ) : itemData.value_text ? (
//                                 itemData.value_text.replace(/\r\n/g, " ")
//                               ) : (
//                                 "-"
//                               )}
//                             </td>
//                           );
//                         })}
//                         {pricingTiers.map((tier) => {
//                           const pricingData = tier.pricing_data?.find(
//                             (pd) => pd.item === item.id
//                           );
//                           if (!pricingData)
//                             return (
//                               <td key={tier.id} className="b6 clr-gray">
//                                 -
//                               </td>
//                             );

//                           const price = parseFloat(pricingData.price);
//                           const hasDiscount =
//                             state.exclusiveDiscounts[item.id]
//                               ?.discount_percentage > 0;
//                           const exclusivePrice = hasDiscount
//                             ? applyDiscount(price, item.id)
//                             : null;
//                           const unitsPerPack = item.units_per_pack || 1;
//                           const packPrice = price * unitsPerPack;
//                           const exclusivePackPrice = hasDiscount
//                             ? exclusivePrice * unitsPerPack
//                             : null;

//                           const displayPrice = hasDiscount ? (
//                             <>
//                               <span style={{ textDecoration: "line-through" }}>
//                                 £{packPrice.toFixed(2)}
//                               </span>
//                               <span className={TableStyles.exclusivePrice}>
//                                 {" "}
//                                 £{exclusivePackPrice.toFixed(2)}{" "}
//                                 {/* <div className={TableStyles.percentageTag}>
//                                   {
//                                     state.exclusiveDiscounts[item.id]
//                                       .discount_percentage
//                                   }
//                                   % Off
//                                 </div> */}
//                               </span>
//                             </>
//                           ) : (
//                             <span>£{packPrice.toFixed(2)}</span>
//                           );

//                           return (
//                             <td key={tier.id} className="b6 clr-text">
//                               <button
//                                 className={`${TableStyles.priceButton} ${
//                                   state.selectedTiers[item.id] === tier.id
//                                     ? TableStyles.selectedTier
//                                     : ""
//                                 } b6`}
//                                 onClick={() => {
//                                   const variantObj = memoizedVariants.find(
//                                     (v) => v?.id === variant.id
//                                   );
//                                   const itemObj = variantObj?.items.find(
//                                     (i) => i.id === item.id
//                                   );
//                                   if (!variantObj || !itemObj) return;

//                                   const unitsPerPack =
//                                     itemObj.units_per_pack || 1;
//                                   const unitsPerPallet =
//                                     variantObj.units_per_pallet || 0;
//                                   let newUnits =
//                                     tier.range_start *
//                                     (tier.tier_type === "pack"
//                                       ? unitsPerPack
//                                       : unitsPerPallet);

//                                   if (tier.tier_type === "pallet") {
//                                     if (newUnits % unitsPerPack !== 0) {
//                                       newUnits =
//                                         Math.ceil(newUnits / unitsPerPack) *
//                                         unitsPerPack;
//                                     }

//                                     const itemWeight = itemObj.weight || 0;
//                                     const itemWeightUnit =
//                                       itemObj.weight_unit || "kg";
//                                     const conversionFactor =
//                                       itemWeightUnit === "lb"
//                                         ? 0.453592
//                                         : itemWeightUnit === "oz"
//                                         ? 0.0283495
//                                         : itemWeightUnit === "g"
//                                         ? 0.001
//                                         : 1;
//                                     const weightPerUnit =
//                                       itemWeight * conversionFactor;

//                                     if (weightPerUnit > 0) {
//                                       const requiredUnits = Math.ceil(
//                                         750 / weightPerUnit
//                                       );
//                                       newUnits = Math.max(
//                                         newUnits,
//                                         requiredUnits
//                                       );
//                                       if (newUnits % unitsPerPack !== 0) {
//                                         newUnits =
//                                           Math.ceil(newUnits / unitsPerPack) *
//                                           unitsPerPack;
//                                       }
//                                     }
//                                   }

//                                   if (
//                                     itemObj.track_inventory &&
//                                     newUnits > itemObj.stock
//                                   ) {
//                                     newUnits =
//                                       Math.floor(itemObj.stock / unitsPerPack) *
//                                       unitsPerPack;
//                                     showNotification(
//                                       `Cannot exceed available stock of ${itemObj.stock} units for ${itemObj.title}.`,
//                                       "warning"
//                                     );
//                                   }

//                                   setState((prev) => {
//                                     const updatedItemUnits = {
//                                       ...prev.itemUnits,
//                                       [item.id]: newUnits,
//                                     };
//                                     const newSelectedWeight =
//                                       calculateTotalWeightWithUnits(
//                                         updatedItemUnits
//                                       );
//                                     const totalWeight =
//                                       prev.cartWeight + newSelectedWeight;

//                                     // Update all variant pricing tiers based on new total weight
//                                     const newVariantPriceTypes = {
//                                       ...prev.variantPriceType,
//                                     };
//                                     const newSelectedTiers = {
//                                       ...prev.selectedTiers,
//                                     };
//                                     const newItemPrices = {
//                                       ...prev.itemPrices,
//                                     };
//                                     const newItemPackPrices = {
//                                       ...prev.itemPackPrices,
//                                     };

//                                     memoizedVariants.forEach((v) => {
//                                       if (!v?.id || !v.items) return;

//                                       const hasPalletPricing =
//                                         v.pricing_tiers?.some(
//                                           (t) => t.tier_type === "pallet"
//                                         );
//                                       const newPriceType =
//                                         totalWeight >= 750 && hasPalletPricing
//                                           ? "pallet"
//                                           : "pack";

//                                       newVariantPriceTypes[v.id] = newPriceType;

//                                       v.items.forEach((i) => {
//                                         const u = updatedItemUnits[i.id] || 0;
//                                         if (u > 0) {
//                                           let applicableTier =
//                                             findApplicableTier(
//                                               v,
//                                               i,
//                                               u,
//                                               newPriceType
//                                             );
//                                           if (
//                                             !applicableTier &&
//                                             newPriceType === "pallet"
//                                           ) {
//                                             applicableTier = findApplicableTier(
//                                               v,
//                                               i,
//                                               u,
//                                               "pack"
//                                             );
//                                           }

//                                           if (applicableTier) {
//                                             const pricingData =
//                                               applicableTier.pricing_data?.find(
//                                                 (pd) => pd.item === i.id
//                                               );
//                                             if (pricingData) {
//                                               const p = applyDiscount(
//                                                 parseFloat(pricingData.price),
//                                                 i.id
//                                               );
//                                               newItemPrices[i.id] = p * u;
//                                               newSelectedTiers[i.id] =
//                                                 applicableTier.id;

//                                               const numberOfPacks = Math.ceil(
//                                                 u / (i.units_per_pack || 1)
//                                               );
//                                               newItemPackPrices[i.id] =
//                                                 p *
//                                                 (i.units_per_pack || 1) *
//                                                 numberOfPacks;
//                                             }
//                                           } else {
//                                             newItemPrices[i.id] = 0;
//                                             newItemPackPrices[i.id] = 0;
//                                             newSelectedTiers[i.id] = null;
//                                           }
//                                         } else {
//                                           newItemPrices[i.id] = 0;
//                                           newItemPackPrices[i.id] = 0;
//                                           newSelectedTiers[i.id] = null;
//                                         }
//                                       });
//                                     });

//                                     return {
//                                       ...prev,
//                                       itemUnits: updatedItemUnits,
//                                       inputValues: {
//                                         ...prev.inputValues,
//                                         [item.id]: newUnits.toString(),
//                                       },
//                                       variantPriceType: newVariantPriceTypes,
//                                       selectedTiers: newSelectedTiers,
//                                       itemPrices: newItemPrices,
//                                       itemPackPrices: newItemPackPrices,
//                                       showStickyBar: true,
//                                     };
//                                   });
//                                 }}
//                                 aria-current={
//                                   state.selectedTiers[item.id] === tier.id
//                                 }
//                                 aria-label={`Select ${tier.tier_type} tier ${
//                                   tier.range_start
//                                 }${
//                                   tier.no_end_range ? "+" : `-${tier.range_end}`
//                                 } for £${
//                                   hasDiscount
//                                     ? exclusivePrice.toFixed(2)
//                                     : price.toFixed(2)
//                                 }`}
//                               >
//                                 {displayPrice}
//                               </button>
//                             </td>
//                           );
//                         })}
//                         <td className="b6 clr-text">{unitsToShow || "-"}</td>
//                         <td className="b6 clr-text">
//                           <div className={TableStyles.unitInputGroup}>
//                             <button
//                               className={`${TableStyles.unitButton} ${TableStyles.unitButtonMinus}`}
//                               onClick={() => {
//                                 const variantObj = memoizedVariants.find(
//                                   (v) => v?.id === variant.id
//                                 );
//                                 if (!variantObj?.items) return;

//                                 const itemObj = variantObj.items.find(
//                                   (i) => i.id === item.id
//                                 );
//                                 if (!itemObj) return;

//                                 const packQuantity =
//                                   itemObj.units_per_pack || 1;
//                                 const palletQuantity =
//                                   variantObj.units_per_pallet || 0;
//                                 const currentUnits =
//                                   state.itemUnits[item.id] || 0;

//                                 let newUnits = Math.max(
//                                   0,
//                                   currentUnits - packQuantity
//                                 );

//                                 if (palletQuantity > 0) {
//                                   if (currentUnits === palletQuantity) {
//                                     newUnits = currentUnits - packQuantity;
//                                   } else if (
//                                     currentUnits > palletQuantity &&
//                                     currentUnits % palletQuantity === 0
//                                   ) {
//                                     newUnits = currentUnits - palletQuantity;
//                                   }
//                                 }

//                                 setState((prev) => {
//                                   const updatedItemUnits = {
//                                     ...prev.itemUnits,
//                                     [item.id]: newUnits,
//                                   };
//                                   const newSelectedWeight =
//                                     calculateTotalWeightWithUnits(
//                                       updatedItemUnits
//                                     );
//                                   const totalWeight =
//                                     prev.cartWeight + newSelectedWeight;

//                                   // Update all variant pricing tiers based on new total weight
//                                   const newVariantPriceTypes = {
//                                     ...prev.variantPriceType,
//                                   };
//                                   const newSelectedTiers = {
//                                     ...prev.selectedTiers,
//                                   };
//                                   const newItemPrices = {
//                                     ...prev.itemPrices,
//                                   };
//                                   const newItemPackPrices = {
//                                     ...prev.itemPackPrices,
//                                   };

//                                   memoizedVariants.forEach((v) => {
//                                     if (!v?.id || !v.items) return;

//                                     const hasPalletPricing =
//                                       v.pricing_tiers?.some(
//                                         (t) => t.tier_type === "pallet"
//                                       );
//                                     const newPriceType =
//                                       totalWeight >= 750 && hasPalletPricing
//                                         ? "pallet"
//                                         : "pack";

//                                     newVariantPriceTypes[v.id] = newPriceType;

//                                     v.items.forEach((i) => {
//                                       const u = updatedItemUnits[i.id] || 0;
//                                       if (u > 0) {
//                                         let applicableTier = findApplicableTier(
//                                           v,
//                                           i,
//                                           u,
//                                           newPriceType
//                                         );
//                                         if (
//                                           !applicableTier &&
//                                           newPriceType === "pallet"
//                                         ) {
//                                           applicableTier = findApplicableTier(
//                                             v,
//                                             i,
//                                             u,
//                                             "pack"
//                                           );
//                                         }

//                                         if (applicableTier) {
//                                           const pricingData =
//                                             applicableTier.pricing_data?.find(
//                                               (pd) => pd.item === i.id
//                                             );
//                                           if (pricingData) {
//                                             const p = applyDiscount(
//                                               parseFloat(pricingData.price),
//                                               i.id
//                                             );
//                                             newItemPrices[i.id] = p * u;
//                                             newSelectedTiers[i.id] =
//                                               applicableTier.id;

//                                             const numberOfPacks = Math.ceil(
//                                               u / (i.units_per_pack || 1)
//                                             );
//                                             newItemPackPrices[i.id] =
//                                               p *
//                                               (i.units_per_pack || 1) *
//                                               numberOfPacks;
//                                           }
//                                         } else {
//                                           newItemPrices[i.id] = 0;
//                                           newItemPackPrices[i.id] = 0;
//                                           newSelectedTiers[i.id] = null;
//                                         }
//                                       } else {
//                                         newItemPrices[i.id] = 0;
//                                         newItemPackPrices[i.id] = 0;
//                                         newSelectedTiers[i.id] = null;
//                                       }
//                                     });
//                                   });

//                                   return {
//                                     ...prev,
//                                     inputValues: {
//                                       ...prev.inputValues,
//                                       [item.id]: newUnits.toString(),
//                                     },
//                                     itemUnits: updatedItemUnits,
//                                     variantPriceType: newVariantPriceTypes,
//                                     selectedTiers: newSelectedTiers,
//                                     itemPrices: newItemPrices,
//                                     itemPackPrices: newItemPackPrices,
//                                   };
//                                 });
//                               }}
//                               aria-label={`Decrement units for ${
//                                 item.sku || "item"
//                               }`}
//                             >
//                               <Minus className="icon-s" />
//                             </button>
//                             <input
//                               type="text"
//                               value={
//                                 state.inputValues[item.id] ??
//                                 state.itemUnits[item.id] ??
//                                 "0"
//                               }
//                               onChange={(e) => {
//                                 const value = e.target.value.replace(
//                                   /[^0-9]/g,
//                                   ""
//                                 );
//                                 setState((prev) => ({
//                                   ...prev,
//                                   inputValues: {
//                                     ...prev.inputValues,
//                                     [item.id]: value,
//                                   },
//                                 }));
//                               }}
//                               onBlur={(e) => {
//                                 const value = e.target.value.replace(
//                                   /[^0-9]/g,
//                                   ""
//                                 );
//                                 handleUnitChange(item.id, variant.id, value);
//                               }}
//                               onKeyPress={(e) => {
//                                 if (e.key === "Enter") {
//                                   const value = e.target.value.replace(
//                                     /[^0-9]/g,
//                                     ""
//                                   );
//                                   handleUnitChange(item.id, variant.id, value);
//                                   e.target.blur();
//                                 }
//                               }}
//                               className={TableStyles.unitInput}
//                               aria-label={`Enter units for ${
//                                 item.sku || "item"
//                               }`}
//                             />
//                             <button
//                               className={`${TableStyles.unitButton} ${TableStyles.unitButtonPlus}`}
//                               onClick={() => {
//                                 const variantObj = memoizedVariants.find(
//                                   (v) => v?.id === variant.id
//                                 );
//                                 if (!variantObj?.items) return;

//                                 const itemObj = variantObj.items.find(
//                                   (i) => i.id === item.id
//                                 );
//                                 if (!itemObj) return;

//                                 const packQuantity =
//                                   itemObj.units_per_pack || 1;
//                                 const palletQuantity =
//                                   variantObj.units_per_pallet || 0;
//                                 const currentUnits =
//                                   state.itemUnits[item.id] || 0;

//                                 let newUnits = currentUnits + packQuantity;

//                                 if (palletQuantity > 0 && currentUnits > 0) {
//                                   if (
//                                     currentUnits >= palletQuantity &&
//                                     currentUnits % palletQuantity === 0
//                                   ) {
//                                     newUnits = currentUnits + palletQuantity;
//                                   }
//                                 }

//                                 if (
//                                   itemObj.track_inventory &&
//                                   newUnits > itemObj.stock
//                                 ) {
//                                   newUnits =
//                                     Math.floor(itemObj.stock / packQuantity) *
//                                     packQuantity;
//                                   showNotification(
//                                     `Cannot exceed available stock of ${itemObj.stock} units for ${itemObj.title}.`,
//                                     "warning"
//                                   );
//                                 }

//                                 setState((prev) => {
//                                   const updatedItemUnits = {
//                                     ...prev.itemUnits,
//                                     [item.id]: newUnits,
//                                   };
//                                   const newSelectedWeight =
//                                     calculateTotalWeightWithUnits(
//                                       updatedItemUnits
//                                     );
//                                   const totalWeight =
//                                     prev.cartWeight + newSelectedWeight;

//                                   // Update all variant pricing tiers based on new total weight
//                                   const newVariantPriceTypes = {
//                                     ...prev.variantPriceType,
//                                   };
//                                   const newSelectedTiers = {
//                                     ...prev.selectedTiers,
//                                   };
//                                   const newItemPrices = {
//                                     ...prev.itemPrices,
//                                   };
//                                   const newItemPackPrices = {
//                                     ...prev.itemPackPrices,
//                                   };

//                                   memoizedVariants.forEach((v) => {
//                                     if (!v?.id || !v.items) return;

//                                     const hasPalletPricing =
//                                       v.pricing_tiers?.some(
//                                         (t) => t.tier_type === "pallet"
//                                       );
//                                     const newPriceType =
//                                       totalWeight >= 750 && hasPalletPricing
//                                         ? "pallet"
//                                         : "pack";

//                                     newVariantPriceTypes[v.id] = newPriceType;

//                                     v.items.forEach((i) => {
//                                       const u = updatedItemUnits[i.id] || 0;
//                                       if (u > 0) {
//                                         let applicableTier = findApplicableTier(
//                                           v,
//                                           i,
//                                           u,
//                                           newPriceType
//                                         );
//                                         if (
//                                           !applicableTier &&
//                                           newPriceType === "pallet"
//                                         ) {
//                                           applicableTier = findApplicableTier(
//                                             v,
//                                             i,
//                                             u,
//                                             "pack"
//                                           );
//                                         }

//                                         if (applicableTier) {
//                                           const pricingData =
//                                             applicableTier.pricing_data?.find(
//                                               (pd) => pd.item === i.id
//                                             );
//                                           if (pricingData) {
//                                             const p = applyDiscount(
//                                               parseFloat(pricingData.price),
//                                               i.id
//                                             );
//                                             newItemPrices[i.id] = p * u;
//                                             newSelectedTiers[i.id] =
//                                               applicableTier.id;

//                                             const numberOfPacks = Math.ceil(
//                                               u / (i.units_per_pack || 1)
//                                             );
//                                             newItemPackPrices[i.id] =
//                                               p *
//                                               (i.units_per_pack || 1) *
//                                               numberOfPacks;
//                                           }
//                                         } else {
//                                           newItemPrices[i.id] = 0;
//                                           newItemPackPrices[i.id] = 0;
//                                           newSelectedTiers[i.id] = null;
//                                         }
//                                       } else {
//                                         newItemPrices[i.id] = 0;
//                                         newItemPackPrices[i.id] = 0;
//                                         newSelectedTiers[i.id] = null;
//                                       }
//                                     });
//                                   });

//                                   return {
//                                     ...prev,
//                                     inputValues: {
//                                       ...prev.inputValues,
//                                       [item.id]: newUnits.toString(),
//                                     },
//                                     itemUnits: updatedItemUnits,
//                                     variantPriceType: newVariantPriceTypes,
//                                     selectedTiers: newSelectedTiers,
//                                     itemPrices: newItemPrices,
//                                     itemPackPrices: newItemPackPrices,
//                                   };
//                                 });
//                               }}
//                               aria-label={`Increment units for ${
//                                 item.sku || "item"
//                               }`}
//                             >
//                               <Plus className="icon-s" />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       );
//     });
//   }, [
//     memoizedVariants,
//     state,
//     handleUnitChange,
//     showNotification,
//     calculateTotalWeightWithUnits,
//     applyDiscount,
//     findApplicableTier,
//     openImagePreview,
//     handleImageError,
//   ]);

//   return (
//     <div className={TableStyles.tableContentWrapper}>
//       <Notification
//         message={state.notification.message}
//         type={state.notification.type}
//         visible={state.notification.visible}
//       />

//       {renderTable}

//       {state.selectedImages && (
//         <ImagePreview
//           images={state.selectedImages.images}
//           onClose={closeImagePreview}
//           variantName={state.selectedImages.variantName}
//           productName={state.selectedImages.productName}
//         />
//       )}

//       {state.showStickyBar && (
//         <div className={`${TableStyles.stickyBar} centered-layout-wrapper`}>
//           <div
//             className={`${TableStyles.stickyBarContent} centered-layout page-layout`}
//           >
//             <table className={TableStyles.productsSummaryTable}>
//               <thead>
//                 <tr>
//                   <th className="b6 clr-text">Description</th>
//                   <th className="b6 clr-text">Boxes</th>
//                   <th className="b6 clr-text">Units</th>
//                   <th className="b6 clr-text">Weight</th>
//                   <th className="b6 clr-text">Subtotal</th>
//                   <th className="b6 clr-text">Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {computeSelectedItems().items.map((item) => {
//                   const displaySubtotal =
//                     item.displayPriceType === "pack"
//                       ? item.packSubtotal
//                       : item.subtotal;
//                   const originalSubtotal =
//                     item.discountPercentage > 0
//                       ? displaySubtotal / (1 - item.discountPercentage / 100)
//                       : displaySubtotal;

//                   return (
//                     <tr key={item.id}>
//                       <td className="b6 clr-text">
//                         {item?.description?.slice(0, 18)}
//                         {item?.description?.length > 18 ? "..." : ""}
//                       </td>
//                       <td className="b6 clr-text">{item.packs}</td>
//                       <td className="b6 clr-text">{item.units}</td>
//                       <td className="b6 clr-text">
//                         {item.weight.toFixed(2)} kg
//                       </td>
//                       <td className="b6 clr-text">
//                         {item.discountPercentage > 0 ? (
//                           <span style={{ textDecoration: "line-through" }}>
//                             £{originalSubtotal.toFixed(2)}
//                           </span>
//                         ) : (
//                           <span>£{originalSubtotal.toFixed(2)}</span>
//                         )}
//                       </td>
//                       <td className="b6 clr-text">
//                         {item.discountPercentage > 0 ? (
//                           <>
//                             <span className={TableStyles.exclusivePrice}>
//                               £{displaySubtotal.toFixed(2)}{" "}
//                               {/* <div className={TableStyles.percentageTag}>
//                                 {item.discountPercentage}% Off
//                               </div> */}
//                             </span>
//                           </>
//                         ) : (
//                           <span>£{displaySubtotal.toFixed(2)}</span>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//             <div className={TableStyles.stickyBarActions}>
//               <div className={TableStyles.actionButtons}>
//                 <button
//                   className="primary-btn text-large"
//                   onClick={handleAddToCart}
//                   aria-label="Add selected items to cart"
//                 >
//                   Add to Cart
//                 </button>
//               </div>
//               <div className={TableStyles.totalPrice}>
//                 TOTAL £{computeSelectedItems().totalPrice.toFixed(2)}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// ProductsTable.propTypes = {
//   variantsWithData: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.number.isRequired,
//       items: PropTypes.arrayOf(
//         PropTypes.shape({
//           id: PropTypes.number.isRequired,
//           weight: PropTypes.number,
//           weight_unit: PropTypes.string,
//           units_per_pack: PropTypes.number,
//         })
//       ).isRequired,
//     })
//   ).isRequired,
// };

// ProductsTable.defaultProps = {
//   variantsWithData: [],
// };

// export default memo(ProductsTable);

import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import TableStyles from "assets/css/TableStyles.module.css";
import { Package, Archive, Plus, Minus } from "lucide-react";
import {
  getOrCreateCart,
  getUserExclusivePrice,
  addCartItem,
  getCartItems,
} from "utils/api/ecommerce";
import Notification from "components/Notification";
import ImagePreview from "components/ImagePreview";
import axios from "axios";
import { BASE_URL } from "utils/global";

const ProductsTable = ({ variantsWithData }) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  // State management
  const [state, setState] = useState({
    itemUnits: {},
    inputValues: {},
    variantPriceType: {},
    itemPrices: {},
    itemPackPrices: {},
    selectedTiers: {},
    variantDisplayPriceType: {},
    showStickyBar: false,
    exclusiveDiscounts: {},
    notification: { message: "", type: "", visible: false },
    selectedImages: null,
    imageLoadFailed: {},
    unitsDisplayType: {},
    cartWeight: 0,
    cartItems: [], // Initialize as empty array
    dimensionDisplayType: {},
    isAddingToCart: false,
  });

  // Memoized variants data
  const memoizedVariants = useMemo(
    () => variantsWithData || [],
    [variantsWithData]
  );

  // Notification helper
  const showNotification = useCallback((message, type) => {
    setState((prev) => ({
      ...prev,
      notification: { message, type, visible: true },
    }));
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        notification: { ...prev.notification, visible: false },
      }));
    }, 3000);
  }, []);

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCartData = async () => {
      if (!isLoggedIn) return;

      try {
        const cart = await getOrCreateCart();
        const cartUrl = `${BASE_URL}ecommerce/carts/${cart.id}/`;
        const cartResponse = await axios.get(cartUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const weight = parseFloat(cartResponse.data.total_weight) || 0;

        // Fetch cart items - ensure we always get an array
        const itemsResponse = await getCartItems(cart.id);
        const cartItems = Array.isArray(itemsResponse) ? itemsResponse : [];

        setState((prev) => ({
          ...prev,
          cartWeight: weight,
          cartItems,
        }));
      } catch (error) {
        console.error("Failed to fetch cart data:", error.message);
        setState((prev) => ({
          ...prev,
          cartWeight: 0,
          cartItems: [], // Fallback to empty array
        }));
      }
    };

    fetchCartData();
  }, [isLoggedIn]);

useEffect(() => {
  const initialUnits = {};
  const initialInputValues = {};
  const initialPriceType = {};
  const initialSelectedTiers = {};
  const initialDisplayPriceType = {};
  const initialUnitsDisplayType = {};
  const initialDimensionDisplayType = {};
const cartItemUnits = {};
const cartItemTiers = {};
const cartItems = Array.isArray(state.cartItems) ? state.cartItems : [];
cartItems.forEach((cartItem) => {
  const itemId = cartItem.item;
  const packQuantity = cartItem.pack_quantity || 1;
  const unitsPerPack =
    memoizedVariants.flatMap((v) => v.items).find((i) => i.id === itemId)
      ?.units_per_pack || 1;
  const units = packQuantity * unitsPerPack;
  cartItemUnits[itemId] = (cartItemUnits[itemId] || 0) + units;
  cartItemTiers[itemId] = cartItem.pricing_tier;
});

  memoizedVariants.forEach((variant) => {
    if (!variant?.id || !Array.isArray(variant.items)) return;

    const supportsPallets = variant.units_per_pallet > 0;
    initialPriceType[variant.id] =
      (supportsPallets && state.cartWeight >= 750) ||
      (supportsPallets && variant.show_units_per === "pallet")
        ? "pallet"
        : "pack";

    initialDisplayPriceType[variant.id] = "pack";
    initialUnitsDisplayType[variant.id] = "pack";
    initialDimensionDisplayType[variant.id] = "in"; // Default to inches for dimension display

    variant.items.forEach((item) => {
      if (!item?.id) return;

      const cartUnits = cartItemUnits[item.id] || 0;
      initialUnits[item.id] = cartUnits;
      initialInputValues[item.id] = cartUnits.toString();
      initialSelectedTiers[item.id] = cartItemTiers[item.id] || null;
    });
  });

  setState((prev) => ({
    ...prev,
    itemUnits: initialUnits,
    inputValues: initialInputValues,
    variantPriceType: initialPriceType,
    selectedTiers: initialSelectedTiers,
    variantDisplayPriceType: initialDisplayPriceType,
    unitsDisplayType: initialUnitsDisplayType,
    dimensionDisplayType: initialDimensionDisplayType,
    showStickyBar: Object.values(initialUnits).some((units) => units > 0),
  }));
}, [memoizedVariants, state.cartWeight, state.cartItems]);  // Show sticky bar when items are selected
  useEffect(() => {
    const hasSelectedItems = Object.values(state.itemUnits).some(
      (units) => units > 0
    );
    if (hasSelectedItems !== state.showStickyBar) {
      setState((prev) => ({ ...prev, showStickyBar: hasSelectedItems }));
    }
  }, [state.itemUnits, state.showStickyBar]);

  // Fetch exclusive prices for logged in users
  useEffect(() => {
    if (!isLoggedIn || !memoizedVariants.length) return;

    const abortController = new AbortController();
    let isMounted = true;

    const fetchExclusivePrices = async () => {
      const discounts = {};
      try {
        for (const variant of memoizedVariants) {
          if (!variant?.items) continue;
          for (const item of variant.items) {
            if (!item?.id) continue;
            const exclusivePrices = await getUserExclusivePrice(
              item.id,
              abortController.signal
            );
            discounts[item.id] =
              Array.isArray(exclusivePrices) && exclusivePrices.length > 0
                ? {
                    id: exclusivePrices,
                    discount_percentage:
                      Number(exclusivePrices[0].discount_percentage) || 0,
                  }
                : { id: null, discount_percentage: 0 };
          }
        }
        if (isMounted) {
          setState((prev) => ({ ...prev, exclusiveDiscounts: discounts }));
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
  }, [isLoggedIn, memoizedVariants]);

  // Memoized helper functions
  const findApplicableTier = useCallback((variant, item, units, priceType) => {
    const pricingTiers =
      variant?.pricing_tiers?.filter((tier) => tier.tier_type === priceType) ||
      [];
    if (!pricingTiers.length) return null;

    const unitsPerPack = item.units_per_pack || 1;
    const quantity =
      priceType === "pack"
        ? Math.ceil(units / unitsPerPack)
        : Math.ceil(units / (variant.units_per_pallet || 1));

    return (
      pricingTiers.find((tier) =>
        tier.no_end_range
          ? quantity >= tier.range_start
          : quantity >= tier.range_start &&
            (tier.range_end === null || quantity <= tier.range_end)
      ) || pricingTiers.sort((a, b) => b.range_start - a.range_start)[0]
    );
  }, []);

  const applyDiscount = useCallback(
    (price, itemId) => {
      const discountPercentage =
        state.exclusiveDiscounts[itemId]?.discount_percentage || 0;
      return price * (1 - discountPercentage / 100);
    },
    [state.exclusiveDiscounts]
  );

  const calculateTotalPrice = useCallback(
    (itemId, variantId, units, tier, price) => {
      const variant = memoizedVariants.find((v) => v?.id === variantId);
      const item = variant?.items.find((i) => i.id === itemId);
      if (!variant || !item || !tier || units <= 0 || !isFinite(price)) {
        setState((prev) => ({
          ...prev,
          itemPrices: { ...prev.itemPrices, [itemId]: 0 },
          itemPackPrices: { ...prev.itemPackPrices, [itemId]: 0 },
        }));
        return 0;
      }

      const unitsPerPack = item.units_per_pack || 1;
      const numberOfPacks = Math.ceil(units / unitsPerPack);
      const packPrice = price * unitsPerPack;
      const totalPrice = price * units;
      const totalPackPrice = packPrice * numberOfPacks;

      setState((prev) => ({
        ...prev,
        itemPrices: { ...prev.itemPrices, [itemId]: totalPrice },
        itemPackPrices: { ...prev.itemPackPrices, [itemId]: totalPackPrice },
      }));
      return totalPrice;
    },
    [memoizedVariants]
  );

  const calculateTotalWeightWithUnits = useCallback(
    (unitsToCalculate) => {
      let newWeight = 0;
      memoizedVariants.forEach((variant) => {
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
    [memoizedVariants]
  );

  // Updated function to determine pricing tier for all variants based on total weight
  const updateAllVariantPricingTiers = useCallback(
    (currentItemUnits, newCartWeight = state.cartWeight) => {
      const selectedItemsWeight =
        calculateTotalWeightWithUnits(currentItemUnits);
      const totalWeight = newCartWeight + selectedItemsWeight;
      const usePalletPricing = totalWeight >= 750;

      const newVariantPriceTypes = {};
      const newSelectedTiers = { ...state.selectedTiers };
      const newItemPrices = { ...state.itemPrices };
      const newItemPackPrices = { ...state.itemPackPrices }; // Fixed: changed from prev to state

      memoizedVariants.forEach((variant) => {
        if (!variant?.id || !variant.items) return;

        const hasPalletPricing = variant.pricing_tiers?.some(
          (tier) => tier.tier_type === "pallet"
        );

        // Determine new price type based on total weight and pallet availability
        let newPriceType = "pack";
        if (usePalletPricing && hasPalletPricing) {
          newPriceType = "pallet";
        }

        newVariantPriceTypes[variant.id] = newPriceType;

        variant.items.forEach((item) => {
          const units = currentItemUnits[item.id] || 0;
          if (units > 0) {
            // First try to find a tier in the new price type
            let applicableTier = findApplicableTier(
              variant,
              item,
              units,
              newPriceType
            );

            // If no tier found in new price type and we're switching to pallet,
            // try to find an equivalent pack tier
            if (!applicableTier && newPriceType === "pallet") {
              applicableTier = findApplicableTier(variant, item, units, "pack");
            }

            if (applicableTier) {
              const pricingData = applicableTier.pricing_data?.find(
                (pd) => pd.item === item.id
              );
              if (pricingData) {
                const price = applyDiscount(
                  parseFloat(pricingData.price),
                  item.id
                );
                const totalPrice = price * units;
                newItemPrices[item.id] = totalPrice;
                newSelectedTiers[item.id] = applicableTier.id;

                // Calculate pack price if needed
                const unitsPerPack = item.units_per_pack || 1;
                const numberOfPacks = Math.ceil(units / unitsPerPack);
                newItemPackPrices[item.id] =
                  price * unitsPerPack * numberOfPacks;
              }
            } else {
              newItemPrices[item.id] = 0;
              newItemPackPrices[item.id] = 0;
              newSelectedTiers[item.id] = null;
            }
          } else {
            newItemPrices[item.id] = 0;
            newItemPackPrices[item.id] = 0;
            newSelectedTiers[item.id] = null;
          }
        });
      });

      setState((prev) => ({
        ...prev,
        variantPriceType: newVariantPriceTypes,
        selectedTiers: newSelectedTiers,
        itemPrices: newItemPrices,
        itemPackPrices: newItemPackPrices,
      }));
    },
    [
      state.cartWeight,
      state.selectedTiers,
      state.itemPrices,
      state.itemPackPrices,
      memoizedVariants,
      calculateTotalWeightWithUnits,
      findApplicableTier,
      applyDiscount,
    ]
  );

  // Event handlers
  const handleUnitChange = useCallback(
    (itemId, variantId, value) => {
      const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10) || 0;

      setState((prev) => {
        // 1. Update the changed item's quantity first
        const variant = memoizedVariants.find((v) => v?.id === variantId);
        if (!variant?.items) return prev;

        const item = variant.items.find((i) => i.id === itemId);
        if (!item) return prev;

        const packQuantity = item.units_per_pack || 1;
        let adjustedUnits =
          Math.round(numericValue / packQuantity) * packQuantity;
        adjustedUnits = Math.max(0, adjustedUnits);

        // Check stock before allowing changes
        if (item.track_inventory) {
          const currentCartQuantity = prev.itemUnits[item.id] || 0;
          const availableStock = item.stock || 0;

          if (adjustedUnits > availableStock) {
            showNotification(
              `Cannot exceed available stock of ${availableStock} units for ${item.title}`,
              "warning"
            );
            adjustedUnits = Math.min(adjustedUnits, availableStock);
          }
        }

        // Create updated units map
        const updatedItemUnits = { ...prev.itemUnits, [itemId]: adjustedUnits };

        // 2. Calculate new total weight (cart + all selected items)
        const newSelectedWeight =
          calculateTotalWeightWithUnits(updatedItemUnits);
        const totalWeight = prev.cartWeight + newSelectedWeight;

        // 3. Update input values
        const updatedState = {
          ...prev,
          itemUnits: updatedItemUnits,
          inputValues: {
            ...prev.inputValues,
            [itemId]: adjustedUnits.toString(),
          },
          showStickyBar: Object.values(updatedItemUnits).some((u) => u > 0),
        };

        // 4. Update pricing for all variants based on new total weight
        updateAllVariantPricingTiers(updatedItemUnits, prev.cartWeight);

        return updatedState;
      });
    },
    [
      memoizedVariants,
      showNotification,
      calculateTotalWeightWithUnits,
      updateAllVariantPricingTiers,
    ]
  );

  // Compute selected items for sticky bar
  const computeSelectedItems = useCallback(() => {
    const items = [];
    let totalPrice = 0;

    memoizedVariants.forEach((variant) => {
      if (!variant?.items) return;
      const currentDisplayPriceType =
        state.variantDisplayPriceType[variant.id] || "pack";
      const currentPriceType = state.variantPriceType[variant.id] || "pack";

      variant.items.forEach((item) => {
        const units = state.itemUnits[item.id] || 0;
        if (units <= 0) return;

        const unitsPerPack = item.units_per_pack || 1;
        const numberOfPacks = Math.ceil(units / unitsPerPack);
        const activeTier = findApplicableTier(
          variant,
          item,
          units,
          currentPriceType
        );
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

        items.push({
          id: item.id,
          sku: item.sku || "-",
          packs: numberOfPacks,
          units,
          subtotal,
          packSubtotal,
          displayPriceType: currentDisplayPriceType,
          variantId: variant.id,
          image: item.images?.[0]?.image || "",
          discountPercentage:
            state.exclusiveDiscounts[item.id]?.discount_percentage || 0,
          activeTierId: activeTier?.id || null,
          weight: totalWeight,
        });
      });
    });

    return { items, totalPrice };
  }, [memoizedVariants, state, findApplicableTier, applyDiscount]);

  // Handle add to cart
  const handleAddToCart = useCallback(async () => {
    setState((prev) => ({ ...prev, isAddingToCart: true }));

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

      // In the handleAddToCart function, modify the cartItems mapping to include unit_type based on pricing tier
      const cartItems = items
        .map((item) => {
          const variant = memoizedVariants.find((v) => v.id === item.variantId);
          if (!variant) return null;

          const tier = variant.pricing_tiers?.find(
            (t) => t.id === item.activeTierId
          );
          if (!tier) {
            showNotification(
              `Invalid pricing tier for item ${item.sku}.`,
              "error"
            );
            return null;
          }

          const itemObj = variant.items.find((i) => i.id === item.id);
          const unitsPerPack = itemObj?.units_per_pack || 1;

          // Fix: Get just the ID from exclusiveDiscounts
          const exclusivePrice = state.exclusiveDiscounts[item.id];
          const userExclusivePriceId = exclusivePrice?.id?.[0]?.id || null;

          // Determine unit_type based on tier type
          const unitType = tier.tier_type === "pallet" ? "pallet" : "pack";

          return {
            cart: cart.id,
            item: item.id,
            pricing_tier: tier.id,
            pack_quantity: Math.ceil(item.units / unitsPerPack),
            unit_type: unitType, // This will be "pallet" or "pack" based on tier type
            user_exclusive_price: userExclusivePriceId,
          };
        })
        .filter(Boolean);

      if (!cartItems.length) return;

      await addCartItem(cartItems);
      showNotification(
        `Added ${cartItems.length} item(s) to cart successfully!`,
        "success"
      );

      // Reset states
      setState((prev) => ({
        ...prev,
        itemUnits: {},
        inputValues: {},
        selectedTiers: {},
        itemPrices: {},
        itemPackPrices: {},
        showStickyBar: false,
        isAddingToCart: false,
      }));

      // Update cart weight and items
      const updatedCart = await getOrCreateCart();
      const cartResponse = await axios.get(
        `${BASE_URL}ecommerce/carts/${updatedCart.id}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const itemsResponse = await getCartItems(updatedCart.id);

      setState((prev) => ({
        ...prev,
        cartWeight: parseFloat(cartResponse.data.total_weight) || 0,
        cartItems: itemsResponse || [],
      }));

      navigate("/cart");
    } catch (error) {
      console.error("Add to cart error:", error);

      let errorMessage = "Failed to add items to cart. Please try again.";

      if (error.response?.data) {
        if (error.response.data.detail) {
          try {
            const detail = JSON.parse(error.response.data.detail);
            if (detail.pack_quantity) {
              errorMessage = Array.isArray(detail.pack_quantity)
                ? detail.pack_quantity.join(" ")
                : detail.pack_quantity;
            }
          } catch (e) {
            errorMessage = error.response.data.detail;
          }
        } else if (error.response.data.pack_quantity) {
          errorMessage = Array.isArray(error.response.data.pack_quantity)
            ? error.response.data.pack_quantity.join(" ")
            : error.response.data.pack_quantity;
        } else if (typeof error.response.data === "object") {
          errorMessage = Object.entries(error.response.data)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(" ") : messages
                }`
            )
            .join("\n");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      errorMessage = errorMessage
        .replace(/^{.*['"]/, "")
        .replace(/['"].*}$/, "");
      showNotification(errorMessage, "error");
      setState((prev) => ({ ...prev, isAddingToCart: false }));

      if (error.response?.data?.pack_quantity) {
        setState((prev) => {
          const newItemUnits = { ...prev.itemUnits };
          const newInputValues = { ...prev.inputValues };

          computeSelectedItems().items.forEach((item) => {
            const variant = memoizedVariants.find(
              (v) => v.id === item.variantId
            );
            if (variant) {
              const itemObj = variant.items.find((i) => i.id === item.id);
              const unitsPerPack = itemObj?.units_per_pack || 1;
              const packQuantity = Math.ceil(item.units / unitsPerPack);

              if (
                errorMessage.includes(`Requested: ${item.units}`) ||
                errorMessage.includes(`Available: ${itemObj?.stock}`)
              ) {
                newItemUnits[item.id] = 0;
                newInputValues[item.id] = "0";
              }
            }
          });

          return {
            ...prev,
            itemUnits: newItemUnits,
            inputValues: newInputValues,
          };
        });
      }
    }
  }, [
    isLoggedIn,
    navigate,
    showNotification,
    computeSelectedItems,
    memoizedVariants,
    state.exclusiveDiscounts,
  ]);

  // Image handling functions
  const openImagePreview = useCallback((images, variantName, productName) => {
    setState((prev) => ({
      ...prev,
      selectedImages: { images, variantName, productName },
    }));
  }, []);

  const closeImagePreview = useCallback(() => {
    setState((prev) => ({ ...prev, selectedImages: null }));
  }, []);

  const handleImageError = useCallback((itemId) => {
    setState((prev) => ({
      ...prev,
      imageLoadFailed: { ...prev.imageLoadFailed, [itemId]: true },
    }));
  }, []);

const convertDimensions = useCallback((item, unit) => {
  const width = Number(item.width_in_inches) || 0;
  const height = Number(item.height_in_inches) || 0;
  const length = Number(item.length_in_inches) || 0;

  if (unit === "cm") {
    return {
      width: (width * 2.54).toFixed(2),
      height: (height * 2.54).toFixed(2),
      length: (length * 2.54).toFixed(2),
    };
  } else if (unit === "mm") {
    return {
      width: (width * 25.4).toFixed(2),
      height: (height * 25.4).toFixed(2),
      length: (length * 25.4).toFixed(2),
    };
  }
  return {
    width: width.toFixed(2),
    height: height.toFixed(2),
    length: length.toFixed(2),
  };
}, []);

  // Memoized table rendering
const renderTable = useMemo(() => {
  if (!memoizedVariants.length) {
    return (
      <div className={`${TableStyles.noVariants} b6 clr-text`}>
        No product variants available.
      </div>
    );
  }

  return memoizedVariants.map((variant) => {
    if (!variant?.id || !variant.items) return null;

    const pricingTiers = (variant.pricing_tiers || []).sort((a, b) =>
      a.tier_type === b.tier_type
        ? a.range_start - b.range_start
        : a.tier_type === "pack"
        ? -1
        : 1
    );

    const currentPriceType = state.variantPriceType[variant.id] || "pack";
    const currentDisplayPriceType =
      state.variantDisplayPriceType[variant.id] || "pack";
    const currentUnitsDisplayType =
      state.unitsDisplayType[variant.id] || "pack";
    const currentDimensionDisplayType =
      state.dimensionDisplayType[variant.id] || "in";

    const isBagsCategory = variant.product.category.slug === "bags";

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
                  <th className={`${TableStyles.defaultHeader} b6 clr-text`}>
                    Image
                  </th>
                  <th className={`${TableStyles.defaultHeader} b6 clr-text`}>
                    SKU
                  </th>
                  {variant.tableFields?.map((field) => (
                    <th
                      key={field.id}
                      className={`${TableStyles.defaultHeader} b6 clr-text ${
                        field.long_field ? TableStyles.longField : ""
                      }`}
                    >
                      {field.name}
                    </th>
                  ))}
                  {isBagsCategory && (
                    <th className={`${TableStyles.defaultHeader} b6 clr-text`}>
                      <div className={TableStyles.thWithButtons}>
                        Dimension
                        <span className={TableStyles.thButtonsWrapper}>
                          <button
                            className={`${TableStyles.thButton} b6 clr-text ${
                              currentDimensionDisplayType === "in"
                                ? TableStyles.active
                                : ""
                            }`}
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                dimensionDisplayType: {
                                  ...prev.dimensionDisplayType,
                                  [variant.id]: "in",
                                },
                              }))
                            }
                            aria-label="Show dimensions in inches"
                          >
                            in
                          </button>
                          <button
                            className={`${TableStyles.thButton} b6 clr-text ${
                              currentDimensionDisplayType === "cm"
                                ? TableStyles.active
                                : ""
                            }`}
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                dimensionDisplayType: {
                                  ...prev.dimensionDisplayType,
                                  [variant.id]: "cm",
                                },
                              }))
                            }
                            aria-label="Show dimensions in centimeters"
                          >
                            cm
                          </button>
                          <button
                            className={`${TableStyles.thButton} b6 clr-text ${
                              currentDimensionDisplayType === "mm"
                                ? TableStyles.active
                                : ""
                            }`}
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                dimensionDisplayType: {
                                  ...prev.dimensionDisplayType,
                                  [variant.id]: "mm",
                                },
                              }))
                            }
                            aria-label="Show dimensions in millimeters"
                          >
                            mm
                          </button>
                        </span>
                      </div>
                    </th>
                  )}
                  {pricingTiers.map((tier) => (
                    <th
                      key={tier.id}
                      className={`${TableStyles.pricingTierHeader} b6 clr-text`}
                    >
                      {tier.range_start === tier.range_end
                        ? `Single ${tier.tier_type === "pack" ? "Box" : "Pallet"}`
                        : `${tier.tier_type === "pack" ? "Boxes" : "Pallets"} ${
                            tier.range_start
                          }${tier.no_end_range ? "+" : `-${tier.range_end}`}`}
                    </th>
                  ))}
                  <th className={`${TableStyles.unitsPerHeader} b6 clr-text`}>
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
                            setState((prev) => ({
                              ...prev,
                              unitsDisplayType: {
                                ...prev.unitsDisplayType,
                                [variant.id]: "pack",
                              },
                            }))
                          }
                          aria-label="Show units per pack"
                        >
                          <Package className="icon-xms" /> Box
                        </button>
                        {variant.show_units_per !== "pack" &&
                          variant.units_per_pallet && (
                            <button
                              className={`${TableStyles.thButton} b6 clr-text ${
                                currentUnitsDisplayType === "pallet"
                                  ? TableStyles.active
                                  : ""
                              }`}
                              onClick={() =>
                                setState((prev) => ({
                                  ...prev,
                                  unitsDisplayType: {
                                    ...prev.unitsDisplayType,
                                    [variant.id]: "pallet",
                                  },
                                }))
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
                {variant.items
                  .sort((a, b) => a.id - b.id)
                  .map((item) => {
                    const images = item.images?.map((img) => img.image) || [];
                    const primaryImage =
                      state.imageLoadFailed[item.id] || !images.length
                        ? ""
                        : images[0];
                    const unitsToShow =
                      currentUnitsDisplayType === "pack"
                        ? item.units_per_pack || 1
                        : variant.units_per_pallet || 1;
                    const dimensions = convertDimensions(item, currentDimensionDisplayType);
                    const hasValidDimensions =
                      item.length_in_inches != null &&
                      item.height_in_inches != null &&
                      item.width_in_inches != null &&
                      (item.length_in_inches > 0 ||
                        item.height_in_inches > 0 ||
                        item.width_in_inches > 0);

                    return (
                      <tr
                        key={item.id}
                        className={
                          state.itemUnits[item.id] > 0
                            ? TableStyles.selectedRow
                            : ""
                        }
                      >
                        <td
                          className={`${TableStyles.imageColTd} b6 clr-text`}
                        >
                          {state.imageLoadFailed[item.id] ||
                          !images.length ? (
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
                          if (!itemData)
                            return (
                              <td key={field.id} className="b6 clr-text">
                                -
                              </td>
                            );

                          return (
                            <td key={field.id} className="b6 clr-text">
                              {field.field_type === "image" &&
                              itemData.value_image ? (
                                state.imageLoadFailed[item.id] ? (
                                  <span className="b6 clr-gray">
                                    Image Not Available
                                  </span>
                                ) : (
                                  <img
                                    src={itemData.value_image}
                                    alt={field.name}
                                    className={TableStyles.colImageContainer}
                                    onError={() => handleImageError(item.id)}
                                    loading="lazy"
                                  />
                                )
                              ) : field.field_type === "price" &&
                                itemData.value_number != null ? (
                                `£${Number(itemData.value_number).toFixed(2)}`
                              ) : field.field_type === "number" &&
                                itemData.value_number != null ? (
                                itemData.value_number
                              ) : itemData.value_text ? (
                                itemData.value_text.replace(/\r\n/g, " ")
                              ) : (
                                "-"
                              )}
                            </td>
                          );
                        })}
                        {isBagsCategory && (
                          <td className="b6 clr-text">
                            {hasValidDimensions
  ? `${
      dimensions.width !== "0.00" ? dimensions.width : ""
    }${
      dimensions.width !== "0.00" && dimensions.height !== "0.00" ? "x" : ""
    }${
      dimensions.height !== "0.00" ? dimensions.height : ""
    }${
      (dimensions.width !== "0.00" || dimensions.height !== "0.00") &&
      dimensions.length !== "0.00"
        ? "x"
        : ""
    }${
      dimensions.length !== "0.00" ? dimensions.length : ""
    } ${currentDimensionDisplayType}`.trim()
  : "-"}

                          </td>
                        )}
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
                            state.exclusiveDiscounts[item.id]
                              ?.discount_percentage > 0;
                          const exclusivePrice = hasDiscount
                            ? applyDiscount(price, item.id)
                            : null;
                          const unitsPerPack = item.units_per_pack || 1;
                          const packPrice = price * unitsPerPack;
                          const exclusivePackPrice = hasDiscount
                            ? exclusivePrice * unitsPerPack
                            : null;

                          const displayPrice = hasDiscount ? (
                            <>
                              <span
                                style={{ textDecoration: "line-through" }}
                              >
                                £{packPrice.toFixed(2)}
                              </span>
                              <span className={TableStyles.exclusivePrice}>
                                £{exclusivePackPrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span>£{packPrice.toFixed(2)}</span>
                          );

                          return (
                            <td key={tier.id} className="b6 clr-text">
                              <button
                                className={`${TableStyles.priceButton} ${
                                  state.selectedTiers[item.id] === tier.id
                                    ? TableStyles.selectedTier
                                    : ""
                                } b6`}
                                onClick={() => {
                                  const variantObj = memoizedVariants.find(
                                    (v) => v?.id === variant.id
                                  );
                                  const itemObj = variantObj?.items.find(
                                    (i) => i.id === item.id
                                  );
                                  if (!variantObj || !itemObj) return;

                                  const unitsPerPack =
                                    itemObj.units_per_pack || 1;
                                  const unitsPerPallet =
                                    variantObj.units_per_pallet || 0;
                                  let newUnits =
                                    tier.range_start *
                                    (tier.tier_type === "pack"
                                      ? unitsPerPack
                                      : unitsPerPallet);

                                  if (tier.tier_type === "pallet") {
                                    if (newUnits % unitsPerPack !== 0) {
                                      newUnits =
                                        Math.ceil(newUnits / unitsPerPack) *
                                        unitsPerPack;
                                    }

                                    const itemWeight = itemObj.weight || 0;
                                    const itemWeightUnit =
                                      itemObj.weight_unit || "kg";
                                    const conversionFactor =
                                      itemWeightUnit === "lb"
                                        ? 0.453592
                                        : itemWeightUnit === "oz"
                                        ? 0.0283495
                                        : itemWeightUnit === "g"
                                        ? 0.001
                                        : 1;
                                    const weightPerUnit =
                                      itemWeight * conversionFactor;

                                    if (weightPerUnit > 0) {
                                      const requiredUnits = Math.ceil(
                                        750 / weightPerUnit
                                      );
                                      newUnits = Math.max(
                                        newUnits,
                                        requiredUnits
                                      );
                                      if (newUnits % unitsPerPack !== 0) {
                                        newUnits =
                                          Math.ceil(newUnits / unitsPerPack) *
                                          unitsPerPack;
                                      }
                                    }
                                  }

                                  if (
                                    itemObj.track_inventory &&
                                    newUnits > (itemObj.stock || 0)
                                  ) {
                                    newUnits =
                                      Math.floor(
                                        (itemObj.stock || 0) / unitsPerPack
                                      ) * unitsPerPack;
                                    showNotification(
                                      `Cannot exceed available stock of ${
                                        itemObj.stock || 0
                                      } units for ${itemObj.title || "item"}.`,
                                      "warning"
                                    );
                                  }

                                  setState((prev) => {
                                    const updatedItemUnits = {
                                      ...prev.itemUnits,
                                      [item.id]: newUnits,
                                    };
                                    const newSelectedWeight =
                                      calculateTotalWeightWithUnits(
                                        updatedItemUnits
                                      );
                                    const totalWeight =
                                      prev.cartWeight + newSelectedWeight;

                                    const newVariantPriceTypes = {
                                      ...prev.variantPriceType,
                                    };
                                    const newSelectedTiers = {
                                      ...prev.selectedTiers,
                                    };
                                    const newItemPrices = {
                                      ...prev.itemPrices,
                                    };
                                    const newItemPackPrices = {
                                      ...prev.itemPackPrices,
                                    };

                                    memoizedVariants.forEach((v) => {
                                      if (!v?.id || !v.items) return;

                                      const hasPalletPricing =
                                        v.pricing_tiers?.some(
                                          (t) => t.tier_type === "pallet"
                                        );
                                      const newPriceType =
                                        totalWeight >= 750 && hasPalletPricing
                                          ? "pallet"
                                          : "pack";

                                      newVariantPriceTypes[v.id] =
                                        newPriceType;

                                      v.items.forEach((i) => {
                                        const u = updatedItemUnits[i.id] || 0;
                                        if (u > 0) {
                                          let applicableTier =
                                            findApplicableTier(
                                              v,
                                              i,
                                              u,
                                              newPriceType
                                            );
                                          if (
                                            !applicableTier &&
                                            newPriceType === "pallet"
                                          ) {
                                            applicableTier =
                                              findApplicableTier(
                                                v,
                                                i,
                                                u,
                                                "pack"
                                              );
                                          }

                                          if (applicableTier) {
                                            const pricingData =
                                              applicableTier.pricing_data?.find(
                                                (pd) => pd.item === i.id
                                              );
                                            if (pricingData) {
                                              const p = applyDiscount(
                                                parseFloat(pricingData.price),
                                                i.id
                                              );
                                              newItemPrices[i.id] = p * u;
                                              newSelectedTiers[i.id] =
                                                applicableTier.id;

                                              const numberOfPacks = Math.ceil(
                                                u / (i.units_per_pack || 1)
                                              );
                                              newItemPackPrices[i.id] =
                                                p *
                                                (i.units_per_pack || 1) *
                                                numberOfPacks;
                                            }
                                          } else {
                                            newItemPrices[i.id] = 0;
                                            newItemPackPrices[i.id] = 0;
                                            newSelectedTiers[i.id] = null;
                                          }
                                        } else {
                                          newItemPrices[i.id] = 0;
                                          newItemPackPrices[i.id] = 0;
                                          newSelectedTiers[i.id] = null;
                                        }
                                      });
                                    });

                                    return {
                                      ...prev,
                                      itemUnits: updatedItemUnits,
                                      inputValues: {
                                        ...prev.inputValues,
                                        [item.id]: newUnits.toString(),
                                      },
                                      variantPriceType: newVariantPriceTypes,
                                      selectedTiers: newSelectedTiers,
                                      itemPrices: newItemPrices,
                                      itemPackPrices: newItemPackPrices,
                                      showStickyBar: true,
                                    };
                                  });
                                }}
                                aria-current={
                                  state.selectedTiers[item.id] === tier.id
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
                              onClick={() => {
                                const variantObj = memoizedVariants.find(
                                  (v) => v?.id === variant.id
                                );
                                if (!variantObj?.items) return;

                                const itemObj = variantObj.items.find(
                                  (i) => i.id === item.id
                                );
                                if (!itemObj) return;

                                const packQuantity =
                                  itemObj.units_per_pack || 1;
                                const palletQuantity =
                                  variantObj.units_per_pallet || 0;
                                const currentUnits =
                                  state.itemUnits[item.id] || 0;

                                let newUnits = Math.max(
                                  0,
                                  currentUnits - packQuantity
                                );

                                if (palletQuantity > 0) {
                                  if (currentUnits === palletQuantity) {
                                    newUnits = currentUnits - packQuantity;
                                  } else if (
                                    currentUnits > palletQuantity &&
                                    currentUnits % palletQuantity === 0
                                  ) {
                                    newUnits = currentUnits - palletQuantity;
                                  }
                                }

                                setState((prev) => {
                                  const updatedItemUnits = {
                                    ...prev.itemUnits,
                                    [item.id]: newUnits,
                                  };
                                  const newSelectedWeight =
                                    calculateTotalWeightWithUnits(
                                      updatedItemUnits
                                    );
                                  const totalWeight =
                                    prev.cartWeight + newSelectedWeight;

                                  const newVariantPriceTypes = {
                                    ...prev.variantPriceType,
                                  };
                                  const newSelectedTiers = {
                                    ...prev.selectedTiers,
                                  };
                                  const newItemPrices = {
                                    ...prev.itemPrices,
                                  };
                                  const newItemPackPrices = {
                                    ...prev.itemPackPrices,
                                  };

                                  memoizedVariants.forEach((v) => {
                                    if (!v?.id || !v.items) return;

                                    const hasPalletPricing =
                                      v.pricing_tiers?.some(
                                        (t) => t.tier_type === "pallet"
                                      );
                                    const newPriceType =
                                      totalWeight >= 750 && hasPalletPricing
                                        ? "pallet"
                                        : "pack";

                                    newVariantPriceTypes[v.id] = newPriceType;

                                    v.items.forEach((i) => {
                                      const u = updatedItemUnits[i.id] || 0;
                                      if (u > 0) {
                                        let applicableTier = findApplicableTier(
                                          v,
                                          i,
                                          u,
                                          newPriceType
                                        );
                                        if (
                                          !applicableTier &&
                                          newPriceType === "pallet"
                                        ) {
                                          applicableTier = findApplicableTier(
                                            v,
                                            i,
                                            u,
                                            "pack"
                                          );
                                        }

                                        if (applicableTier) {
                                          const pricingData =
                                            applicableTier.pricing_data?.find(
                                              (pd) => pd.item === i.id
                                            );
                                          if (pricingData) {
                                            const p = applyDiscount(
                                              parseFloat(pricingData.price),
                                              i.id
                                            );
                                            newItemPrices[i.id] = p * u;
                                            newSelectedTiers[i.id] =
                                              applicableTier.id;

                                            const numberOfPacks = Math.ceil(
                                              u / (i.units_per_pack || 1)
                                            );
                                            newItemPackPrices[i.id] =
                                              p *
                                              (i.units_per_pack || 1) *
                                              numberOfPacks;
                                          }
                                        } else {
                                          newItemPrices[i.id] = 0;
                                          newItemPackPrices[i.id] = 0;
                                          newSelectedTiers[i.id] = null;
                                        }
                                      } else {
                                        newItemPrices[i.id] = 0;
                                        newItemPackPrices[i.id] = 0;
                                        newSelectedTiers[i.id] = null;
                                      }
                                    });
                                  });

                                  return {
                                    ...prev,
                                    inputValues: {
                                      ...prev.inputValues,
                                      [item.id]: newUnits.toString(),
                                    },
                                    itemUnits: updatedItemUnits,
                                    variantPriceType: newVariantPriceTypes,
                                    selectedTiers: newSelectedTiers,
                                    itemPrices: newItemPrices,
                                    itemPackPrices: newItemPackPrices,
                                  };
                                });
                              }}
                              aria-label={`Decrement units for ${
                                item.sku || "item"
                              }`}
                            >
                              <Minus className="icon-s" />
                            </button>
                            <input
                              type="text"
                              value={
                                state.inputValues[item.id] ??
                                state.itemUnits[item.id] ??
                                "0"
                              }
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /[^0-9]/g,
                                  ""
                                );
                                setState((prev) => ({
                                  ...prev,
                                  inputValues: {
                                    ...prev.inputValues,
                                    [item.id]: value,
                                  },
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
                              onClick={() => {
                                const variantObj = memoizedVariants.find(
                                  (v) => v?.id === variant.id
                                );
                                if (!variantObj?.items) return;

                                const itemObj = variantObj.items.find(
                                  (i) => i.id === item.id
                                );
                                if (!itemObj) return;

                                const packQuantity =
                                  itemObj.units_per_pack || 1;
                                const palletQuantity =
                                  variantObj.units_per_pallet || 0;
                                const currentUnits =
                                  state.itemUnits[item.id] || 0;

                                let newUnits = currentUnits + packQuantity;

                                if (palletQuantity > 0 && currentUnits > 0) {
                                  if (
                                    currentUnits >= palletQuantity &&
                                    currentUnits % palletQuantity === 0
                                  ) {
                                    newUnits = currentUnits + palletQuantity;
                                  }
                                }

                                if (
                                  itemObj.track_inventory &&
                                  newUnits > (itemObj.stock || 0)
                                ) {
                                  newUnits =
                                    Math.floor(
                                      (itemObj.stock || 0) / packQuantity
                                    ) * packQuantity;
                                  showNotification(
                                    `Cannot exceed available stock of ${
                                      itemObj.stock || 0
                                    } units for ${itemObj.title || "item"}.`,
                                    "warning"
                                  );
                                }

                                setState((prev) => {
                                  const updatedItemUnits = {
                                    ...prev.itemUnits,
                                    [item.id]: newUnits,
                                  };
                                  const newSelectedWeight =
                                    calculateTotalWeightWithUnits(
                                      updatedItemUnits
                                    );
                                  const totalWeight =
                                    prev.cartWeight + newSelectedWeight;

                                  const newVariantPriceTypes = {
                                    ...prev.variantPriceType,
                                  };
                                  const newSelectedTiers = {
                                    ...prev.selectedTiers,
                                  };
                                  const newItemPrices = {
                                    ...prev.itemPrices,
                                  };
                                  const newItemPackPrices = {
                                    ...prev.itemPackPrices,
                                  };

                                  memoizedVariants.forEach((v) => {
                                    if (!v?.id || !v.items) return;

                                    const hasPalletPricing =
                                      v.pricing_tiers?.some(
                                        (t) => t.tier_type === "pallet"
                                      );
                                    const newPriceType =
                                      totalWeight >= 750 && hasPalletPricing
                                        ? "pallet"
                                        : "pack";

                                    newVariantPriceTypes[v.id] = newPriceType;

                                    v.items.forEach((i) => {
                                      const u = updatedItemUnits[i.id] || 0;
                                      if (u > 0) {
                                        let applicableTier = findApplicableTier(
                                          v,
                                          i,
                                          u,
                                          newPriceType
                                        );
                                        if (
                                          !applicableTier &&
                                          newPriceType === "pallet"
                                        ) {
                                          applicableTier = findApplicableTier(
                                            v,
                                            i,
                                            u,
                                            "pack"
                                          );
                                        }

                                        if (applicableTier) {
                                          const pricingData =
                                            applicableTier.pricing_data?.find(
                                              (pd) => pd.item === i.id
                                            );
                                          if (pricingData) {
                                            const p = applyDiscount(
                                              parseFloat(pricingData.price),
                                              i.id
                                            );
                                            newItemPrices[i.id] = p * u;
                                            newSelectedTiers[i.id] =
                                              applicableTier.id;

                                            const numberOfPacks = Math.ceil(
                                              u / (i.units_per_pack || 1)
                                            );
                                            newItemPackPrices[i.id] =
                                              p *
                                              (i.units_per_pack || 1) *
                                              numberOfPacks;
                                          }
                                        } else {
                                          newItemPrices[i.id] = 0;
                                          newItemPackPrices[i.id] = 0;
                                          newSelectedTiers[i.id] = null;
                                        }
                                      } else {
                                        newItemPrices[i.id] = 0;
                                        newItemPackPrices[i.id] = 0;
                                        newSelectedTiers[i.id] = null;
                                      }
                                    });
                                  });

                                  return {
                                    ...prev,
                                    inputValues: {
                                      ...prev.inputValues,
                                      [item.id]: newUnits.toString(),
                                    },
                                    itemUnits: updatedItemUnits,
                                    variantPriceType: newVariantPriceTypes,
                                    selectedTiers: newSelectedTiers,
                                    itemPrices: newItemPrices,
                                    itemPackPrices: newItemPackPrices,
                                  };
                                });
                              }}
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
  });
}, [
  memoizedVariants,
  state,
  handleUnitChange,
  showNotification,
  calculateTotalWeightWithUnits,
  applyDiscount,
  findApplicableTier,
  openImagePreview,
  handleImageError,
  convertDimensions,
]);

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification
        message={state.notification.message}
        type={state.notification.type}
        visible={state.notification.visible}
      />

      {renderTable}

      {state.selectedImages && (
        <ImagePreview
          images={state.selectedImages.images}
          onClose={closeImagePreview}
          variantName={state.selectedImages.variantName}
          productName={state.selectedImages.productName}
        />
      )}

      {state.showStickyBar && (
        <div className={`${TableStyles.stickyBar} centered-layout-wrapper`}>
          <div
            className={`${TableStyles.stickyBarContent} centered-layout page-layout`}
          >
            <table className={TableStyles.productsSummaryTable}>
              <thead>
                <tr>
                  <th className="b6 clr-text">SKU</th>
                  <th className="b6 clr-text">Boxes</th>
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
                        {item?.sku?.slice(0, 18)}
                        {item?.sku?.length > 18 ? "..." : ""}
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
                              {/* <div className={TableStyles.percentageTag}>
                                {item.discountPercentage}% Off
                              </div> */}
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
    className={`primary-btn text-large`}
    onClick={handleAddToCart}
    disabled={state.isAddingToCart}
    aria-busy={state.isAddingToCart}
    aria-label="Add selected items to cart"
  >
    {state.isAddingToCart ? "Cart Upadting..." : "Add to Cart"}
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
      category_type: PropTypes.string,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          weight: PropTypes.number,
          weight_unit: PropTypes.string,
          units_per_pack: PropTypes.number,
          width_in_inches: PropTypes.number, // Added
          height_in_inches: PropTypes.number, // Added
          length_in_inches: PropTypes.number, // Added
        })
      ).isRequired,
    })
  ).isRequired,
};

ProductsTable.defaultProps = {
  variantsWithData: [],
};

export default memo(ProductsTable);
