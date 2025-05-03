import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import TableStyles from "assets/css/TableStyles.module.css";
import { Truck, Minus, Plus } from "lucide-react";
import DOMPurify from "dompurify";
import AccentNotifier from "./AccentNotifier";
import { updateCartItemUnits, setCartItems } from "utils/cartSlice";
import { getOrCreateCart, getCartItems, getUserExclusivePrice } from "utils/api/ecommerce";
import axios from "axios";
import { BASE_URL } from "utils/global";

// Cart item schema validation with fallbacks
const validateCartItem = (item) => {
  const requiredFields = [
    "id",
    "description",
    "packs",
    "units",
    "subtotal",
    "packSubtotal",
    "displayPriceType",
    "variantId",
    "image",
    "sku",
    "productSlug",
    "categorySlug",
    "perUnitPrice",
  ];
  return (
    item &&
    requiredFields.every((field) => field in item) &&
    typeof item.id === "string" &&
    typeof item.description === "string" &&
    typeof item.packs === "number" &&
    typeof item.units === "number" &&
    typeof item.subtotal === "number" &&
    typeof item.packSubtotal === "number" &&
    ["unit", "pack"].includes(item.displayPriceType) &&
    typeof item.variantId === "string" &&
    typeof item.image === "string" &&
    typeof item.sku === "string" &&
    typeof item.productSlug === "string" &&
    typeof item.categorySlug === "string" &&
    typeof item.perUnitPrice === "number"
  );
};

// Function to normalize URL by removing double slashes
const normalizeUrl = (baseUrl, path) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
};

const CartTable = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawItems, setRawItems] = useState([]); // Store raw API-fetched cart items
  const [imageErrors, setImageErrors] = useState({}); // Track image load failures
  const [editPacks, setEditPacks] = useState({}); // Track pack input values
  const [exclusiveDiscounts, setExclusiveDiscounts] = useState({}); // Store discount percentages
  const [updatingRows, setUpdatingRows] = useState({}); // Track which rows are being updated
  const [cartId, setCartId] = useState(null); // Store cartId for fetching updated items

  // Fetch cart items and exclusive discounts on mount
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get or create the user's cart
        const cart = await getOrCreateCart();
        const cartId = cart.id;
        setCartId(cartId); // Store cartId for later use

        // Step 2: Fetch cart items
        const cartResponse = await getCartItems(cartId);
        const items = cartResponse.results || [];

        // Step 3: Fetch exclusive prices for logged-in users
        const discounts = {};
        if (isLoggedIn) {
          const abortController = new AbortController();
          try {
            for (const item of items) {
              if (!item?.item?.id) continue;
              const exclusivePrices = await getUserExclusivePrice(item.item.id, abortController.signal);
              if (Array.isArray(exclusivePrices) && exclusivePrices.length > 0) {
                discounts[item.id] = {
                  id: exclusivePrices[0].id,
                  discount_percentage: Number(exclusivePrices[0].discount_percentage) || 0,
                  per_unit_price: Number(exclusivePrices[0].per_unit_price) || 0,
                  per_pack_price: Number(exclusivePrices[0].per_pack_price) || 0,
                };
              } else {
                discounts[item.id] = { id: null, discount_percentage: 0, per_unit_price: 0, per_pack_price: 0 };
              }
            }
            setExclusiveDiscounts(discounts);
          } catch (error) {
            if (error.name !== "AbortError") {
              console.error("Failed to fetch exclusive prices:", error.message);
            }
          }
          abortController.abort();
        }

        // Step 4: Fetch item details for each cart item
        const mappedItems = await Promise.all(
          items.map(async (item) => {
            try {
              const itemUrl = normalizeUrl(BASE_URL, `items/${item.item.id}/`);
              const itemResponse = await axios.get(itemUrl, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              });
              const itemDetails = itemResponse.data;

              const productVariant = itemDetails.product_variant || {};
              const product = productVariant.product || {};
              const category = product.category || {};
              const productSlug = product.slug || "unknown";
              const categorySlug = category.slug || "unknown";
              const unitsPerPack = productVariant.units_per_pack || 1;
              const unitsPerPallet = productVariant.units_per_pallet || 1;

              let totalCost = parseFloat(item.total_cost) || 0;
              let perUnitPrice = parseFloat(item.per_unit_price) || 0;
              let perPackPrice = parseFloat(item.per_pack_price) || 0;
              let discountPercentage = 0;

              if (item.user_exclusive_price && discounts[item.id]) {
                discountPercentage = discounts[item.id].discount_percentage || 0;
                perUnitPrice = discounts[item.id].per_unit_price || perUnitPrice;
                perPackPrice = discounts[item.id].per_pack_price || perPackPrice;
                if (discountPercentage > 0) {
                  totalCost = totalCost * (1 - discountPercentage / 100); // Apply discount to total
                }
              }

              return {
                id: item.id.toString(),
                description: itemDetails.title || productVariant.name || `Item ${item.item.id}${discountPercentage > 0 ? ` (Exclusive: ${discountPercentage}% off)` : ""}`,
                packs: item.unit_type === "pack" ? item.quantity : Math.floor((item.quantity * unitsPerPallet) / unitsPerPack),
                units: item.unit_type === "pack" ? item.quantity * unitsPerPack : item.quantity * unitsPerPallet,
                subtotal: parseFloat(item.total_cost) || 0, // Original subtotal before discount
                packSubtotal: item.unit_type === "pack" ? totalCost : (totalCost / item.quantity) * unitsPerPack,
                displayPriceType: item.unit_type,
                variantId: productVariant.id?.toString() || "unknown",
                image: (itemDetails.images && itemDetails.images.length > 0) ? itemDetails.images[0].image : "",
                sku: itemDetails.sku || `SKU-${item.item.id}`,
                productSlug: productSlug,
                categorySlug: categorySlug,
                perUnitPrice: item.unit_type === "pack" ? perPackPrice : perUnitPrice,
                pricingTierId: item.pricing_tier?.id,
                discountPercentage: discountPercentage,
                discountedTotal: totalCost, // Store discounted total
              };
            } catch (itemErr) {
              console.warn(`Failed to fetch details for item ${item.item.id}:`, itemErr.message);
              return {
                id: item.id.toString(),
                description: `Item ${item.item.id} (Details unavailable)`,
                packs: item.unit_type === "pack" ? item.quantity : 0,
                units: item.unit_type === "pack" ? item.quantity : 0,
                subtotal: parseFloat(item.total_cost) || 0,
                packSubtotal: parseFloat(item.total_cost) || 0,
                displayPriceType: item.unit_type,
                variantId: "unknown",
                image: "",
                sku: `SKU-${item.item.id}`,
                productSlug: "unknown",
                categorySlug: "unknown",
                perUnitPrice: parseFloat(item.per_unit_price) || 0,
                pricingTierId: item.pricing_tier?.id || null,
                discountPercentage: 0,
                discountedTotal: parseFloat(item.total_cost) || 0,
              };
            }
          })
        );

        // Step 5: Validate and dispatch to Redux store
        const validatedItems = mappedItems.filter(validateCartItem);
        console.log("Initial Mapped Items:", mappedItems);
        console.log("Initial Validated Items:", validatedItems);
        if (validatedItems.length !== mappedItems.length) {
          console.warn("Invalid cart items detected. Filtering invalid entries.");
        }
        dispatch(setCartItems(validatedItems));
        setRawItems(items);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart items:", err.message);
        setError("Failed to load cart. Please try again.");
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [dispatch, isLoggedIn]);

  // Handle pack quantity update
  const handlePackChange = async (itemId, newPacks) => {
    console.log(`handlePackChange called for itemId: ${itemId}, newPacks: ${newPacks}`);
    const item = cartItems.find((item) => item.id === itemId);
    if (!item || !validateCartItem(item)) {
      console.warn(`Invalid cart item: ${itemId}`);
      setError("Invalid cart item. Please refresh the cart.");
      return;
    }

    const backendItem = rawItems.find((backendItem) => backendItem.id.toString() === itemId);
    if (!backendItem) {
      console.warn(`Backend item not found for ${itemId}`);
      setError("Item not found in cart. Please refresh.");
      return;
    }

    // Set the row as updating (disables input)
    setUpdatingRows((prev) => ({ ...prev, [itemId]: true }));

    try {
      // Fetch current cart item details to ensure pricing_tier is up-to-date
      const cartItemUrl = normalizeUrl(BASE_URL, `cart-items/${itemId}/`);
      const cartItemResponse = await axios.get(cartItemUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const currentCartItem = cartItemResponse.data;
      const pricingTierId = currentCartItem.pricing_tier?.id;

      if (!pricingTierId) {
        console.error(`No pricing tier found for cart item ${itemId}`);
        setError("Unable to update item due to missing pricing tier. Please refresh the cart.");
        return;
      }

      // Fetch item details to get units_per_pack and units_per_pallet
      const itemUrl = normalizeUrl(BASE_URL, `items/${backendItem.item.id}/`);
      const itemResponse = await axios.get(itemUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const itemDetails = itemResponse.data;
      const unitsPerPack = itemDetails.product_variant?.units_per_pack || 1;
      const unitsPerPallet = itemDetails.product_variant?.units_per_pallet || 1;

      // Round newPacks to the nearest whole number
      const roundedPacks = Math.max(0, Math.round(newPacks));
      const newUnits = item.displayPriceType === "pack" ? roundedPacks * unitsPerPack : roundedPacks * unitsPerPallet;
      console.log(`Calculated: roundedPacks=${roundedPacks}, newUnits=${newUnits}`);

      if (roundedPacks === 0) {
        // Delete the cart item if quantity is 0
        console.log(`Deleting cart item ${itemId}`);
        const deleteUrl = normalizeUrl(BASE_URL, `cart-items/${itemId}/`);
        await axios.delete(deleteUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        });
        dispatch(updateCartItemUnits({ 
          itemId, 
          units: 0, 
          packs: 0, 
          subtotal: 0, 
          total: 0, 
          discountPercentage: 0, 
          packSubtotal: 0, 
          perUnitPrice: 0 
        }));
        // Update rawItems by removing the deleted item
        setRawItems((prev) => prev.filter((rawItem) => rawItem.id.toString() !== itemId));
      } else {
        // Update the cart item quantity
        console.log(`Patching cart item ${itemId} with quantity ${roundedPacks}`);
        const patchUrl = normalizeUrl(BASE_URL, `cart-items/${itemId}/`);
        await axios.patch(
          patchUrl,
          {
            quantity: roundedPacks,
            pricing_tier: pricingTierId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Fetch updated cart to ensure consistency
        console.log(`Fetching updated cart for cartId: ${cartId}`);
        const updatedCartResponse = await getCartItems(cartId);
        const updatedItems = updatedCartResponse.results || [];
        const updatedItem = updatedItems.find((i) => i.id.toString() === itemId);

        if (!updatedItem) {
          console.warn(`Updated item ${itemId} not found in cart after update`);
          dispatch(updateCartItemUnits({ 
            itemId, 
            units: 0, 
            packs: 0, 
            subtotal: 0, 
            total: 0, 
            discountPercentage: 0, 
            packSubtotal: 0, 
            perUnitPrice: 0 
          }));
          setRawItems((prev) => prev.filter((rawItem) => rawItem.id.toString() !== itemId));
          return;
        }

        // Update rawItems with the latest cart items
        setRawItems(updatedItems);

        // Initialize pricing variables
        let subtotal = parseFloat(updatedItem.total_cost) || 0;
        let perUnitPrice = parseFloat(updatedItem.per_unit_price) || 0;
        let perPackPrice = parseFloat(updatedItem.per_pack_price) || 0;
        let discountPercentage = 0;
        let discountedTotal = subtotal;

        // Fetch updated exclusive price if applicable
        if (isLoggedIn && updatedItem.user_exclusive_price) {
          console.log(`Fetching exclusive price for item ${itemId}`);
          const exclusivePriceUrl = normalizeUrl(BASE_URL, `user-exclusive-prices/${updatedItem.user_exclusive_price.id}/`);
          const exclusivePriceResponse = await axios.get(exclusivePriceUrl, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          const exclusivePrice = exclusivePriceResponse.data;
          discountPercentage = parseFloat(exclusivePrice.discount_percentage) || 0;
          perUnitPrice = parseFloat(exclusivePrice.per_unit_price) || perUnitPrice;
          perPackPrice = parseFloat(exclusivePrice.per_pack_price) || perPackPrice;

          if (discountPercentage > 0) {
            discountedTotal = subtotal * (1 - discountPercentage / 100); // Apply discount to total
          }
        }

        // Calculate packs and packSubtotal based on the unit type
        const updatedPacks = updatedItem.unit_type === "pack" ? updatedItem.quantity : Math.floor((updatedItem.quantity * unitsPerPallet) / unitsPerPack);
        const packSubtotal = updatedItem.unit_type === "pack" ? discountedTotal : (discountedTotal / updatedItem.quantity) * unitsPerPack;

        // Update perUnitPrice based on unit type
        const updatedPerUnitPrice = updatedItem.unit_type === "pack" ? perPackPrice : perUnitPrice;

        // Update description to reflect updated discount
        const updatedDescription = itemDetails.title || itemDetails.product_variant?.name || `Item ${updatedItem.item.id}${discountPercentage > 0 ? ` (Exclusive: ${discountPercentage}% off)` : ""}`;

        // Update Redux for the specific item
        console.log(`Dispatching updateCartItemUnits for itemId: ${itemId}`);
        dispatch(updateCartItemUnits({
          itemId,
          units: newUnits,
          packs: updatedPacks,
          subtotal: subtotal,
          total: discountedTotal,
          discountPercentage,
          packSubtotal,
          perUnitPrice: updatedPerUnitPrice,
          description: updatedDescription,
        }));

        // Update the entire cart in Redux while preserving item order
        const currentItemIds = cartItems.map((item) => item.id);
        console.log("Current item order:", currentItemIds);
        const mappedItems = await Promise.all(
          currentItemIds.map(async (currentItemId) => {
            const item = updatedItems.find((i) => i.id.toString() === currentItemId) || cartItems.find((i) => i.id === currentItemId);
            if (!item) {
              console.warn(`Item ${currentItemId} not found in updated items or current items`);
              return null;
            }

            try {
              const itemUrl = normalizeUrl(BASE_URL, `items/${item.item.id}/`);
              const itemResponse = await axios.get(itemUrl, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
              });
              const itemDetails = itemResponse.data;

              const productVariant = itemDetails.product_variant || {};
              const product = productVariant.product || {};
              const category = product.category || {};
              const productSlug = product.slug || "unknown";
              const categorySlug = category.slug || "unknown";
              const unitsPerPack = productVariant.units_per_pack || 1;
              const unitsPerPallet = productVariant.units_per_pallet || 1;

              let totalCost = parseFloat(item.total_cost) || 0;
              let perUnitPrice = parseFloat(item.per_unit_price) || 0;
              let perPackPrice = parseFloat(item.per_pack_price) || 0;
              let discountPercentage = exclusiveDiscounts[item.id]?.discount_percentage || 0;

              if (item.user_exclusive_price && exclusiveDiscounts[item.id]) {
                perUnitPrice = exclusiveDiscounts[item.id].per_unit_price || perUnitPrice;
                perPackPrice = exclusiveDiscounts[item.id].per_pack_price || perPackPrice;
                if (discountPercentage > 0) {
                  totalCost = totalCost * (1 - discountPercentage / 100);
                }
              }

              return {
                id: item.id.toString(),
                description: itemDetails.title || productVariant.name || `Item ${item.item.id}${discountPercentage > 0 ? ` (Exclusive: ${discountPercentage}% off)` : ""}`,
                packs: item.unit_type === "pack" ? item.quantity : Math.floor((item.quantity * unitsPerPallet) / unitsPerPack),
                units: item.unit_type === "pack" ? item.quantity * unitsPerPack : item.quantity * unitsPerPallet,
                subtotal: parseFloat(item.total_cost) || 0,
                packSubtotal: item.unit_type === "pack" ? totalCost : (totalCost / item.quantity) * unitsPerPack,
                displayPriceType: item.unit_type,
                variantId: productVariant.id?.toString() || "unknown",
                image: (itemDetails.images && itemDetails.images.length > 0) ? itemDetails.images[0].image : "",
                sku: itemDetails.sku || `SKU-${item.item.id}`,
                productSlug: productSlug,
                categorySlug: categorySlug,
                perUnitPrice: item.unit_type === "pack" ? perPackPrice : perUnitPrice,
                pricingTierId: item.pricing_tier?.id,
                discountPercentage: discountPercentage,
                discountedTotal: totalCost,
              };
            } catch (err) {
              console.warn(`Failed to fetch details for item ${item.item.id}:`, err.message);
              return {
                id: item.id.toString(),
                description: `Item ${item.item.id} (Details unavailable)`,
                packs: item.unit_type === "pack" ? item.quantity : 0,
                units: item.unit_type === "pack" ? item.quantity : 0,
                subtotal: parseFloat(item.total_cost) || 0,
                packSubtotal: parseFloat(item.total_cost) || 0,
                displayPriceType: item.unit_type,
                variantId: "unknown",
                image: "",
                sku: `SKU-${item.item.id}`,
                productSlug: "unknown",
                categorySlug: "unknown",
                perUnitPrice: parseFloat(item.per_unit_price) || 0,
                pricingTierId: item.pricing_tier?.id || null,
                discountPercentage: 0,
                discountedTotal: parseFloat(item.total_cost) || 0,
              };
            }
          })
        );
        const validatedItems = mappedItems.filter((item) => item !== null && validateCartItem(item));
        console.log("Updated item order:", validatedItems.map((item) => item.id));
        console.log("Updated Mapped Items:", mappedItems);
        console.log("Updated Validated Items:", validatedItems);
        dispatch(setCartItems(validatedItems));
      }

      // Update editPacks to reflect the new value
      console.log(`Updating editPacks for itemId: ${itemId} to ${roundedPacks}`);
      setEditPacks((prev) => ({ ...prev, [itemId]: roundedPacks }));
    } catch (err) {
      console.error("Error updating pack quantity:", err.message);
      setError("Failed to update pack quantity. Please try again.");
    } finally {
      // Re-enable the input for this row after the update
      setUpdatingRows((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Handle pack increment
  const handlePackIncrement = (itemId) => {
    if (updatingRows[itemId]) return; // Prevent action if row is updating
    const currentPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
    const newPacks = currentPacks + 1;
    console.log(`Incrementing packs for itemId: ${itemId} from ${currentPacks} to ${newPacks}`);
    setEditPacks((prev) => ({ ...prev, [itemId]: newPacks }));
    handlePackChange(itemId, newPacks);
  };

  // Handle pack decrement
  const handlePackDecrement = (itemId) => {
    if (updatingRows[itemId]) return; // Prevent action if row is updating
    const currentPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
    const newPacks = Math.max(0, currentPacks - 1);
    console.log(`Decrementing packs for itemId: ${itemId} from ${currentPacks} to ${newPacks}`);
    setEditPacks((prev) => ({ ...prev, [itemId]: newPacks }));
    handlePackChange(itemId, newPacks);
  };

  // Handle input change and blur/enter
  const handlePackInputChange = (itemId, e) => {
    if (updatingRows[itemId]) return; // Prevent changes if row is updating
    const newValue = parseInt(e.target.value, 10) || 0;
    console.log(`Input change for itemId: ${itemId}, newValue: ${newValue}`);
    setEditPacks((prev) => ({ ...prev, [itemId]: newValue }));
  };

  const handlePackInputBlur = (itemId) => {
    if (updatingRows[itemId]) return; // Prevent action if row is updating
    const newPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
    console.log(`Input blur for itemId: ${itemId}, triggering update with packs: ${newPacks}`);
    handlePackChange(itemId, newPacks);
  };

  const handlePackInputKeyPress = (itemId, e) => {
    if (updatingRows[itemId]) return; // Prevent action if row is updating
    if (e.key === "Enter") {
      const newPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
      console.log(`Enter key pressed for itemId: ${itemId}, triggering update with packs: ${newPacks}`);
      handlePackChange(itemId, newPacks);
    }
  };

  // Handle image load error
  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  // Calculate order summary
  const calculateSummary = () => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.units, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0); // Use backend subtotal
    const vat = subtotal * 0.2; // 20% VAT
    const weight = cartItems.reduce((sum, item) => sum + item.units * 0.2, 0); // 0.2kg per unit
    return { totalItems, subtotal, vat, weight };
  };

  const { totalItems, subtotal, vat, weight } = calculateSummary();

  if (loading) {
    return (
      <div className={TableStyles.container}>
        <div className={TableStyles.tableContentWrapper}>
          <p className="c3 text-center">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={TableStyles.container}>
        <div className={TableStyles.tableContentWrapper}>
          <p className="c3 text-center clr-danger">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={TableStyles.container}>
      <div className={TableStyles.tableContentWrapper}>
        <div className={TableStyles.tableContainer}>
          <table className={TableStyles.table} role="grid">
            <thead>
              <tr>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Image
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  SKU
                </th>
                <th
                  className={`${TableStyles.colLongWidth} l3 clr-accent-dark-blue`}
                  scope="col"
                >
                  Title
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Packs
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Price
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Subtotal
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="c3 text-center">
                    Your cart is empty.
                  </td>
                </tr>
              ) : (
                cartItems.map((cartElement) => {
                  const sanitizedDescription = DOMPurify.sanitize(cartElement.description);
                  const unitPrice = cartElement.perUnitPrice || 0;
                  const subtotalPrice = cartElement.subtotal; // Original subtotal from backend
                  const hasImageError = imageErrors[cartElement.id] || !cartElement.image;
                  const currentPacks = editPacks[cartElement.id] !== undefined ? editPacks[cartElement.id] : cartElement.packs;
                  const isUpdating = updatingRows[cartElement.id] || false;

                  // Use the pre-calculated discounted total if available
                  const displayTotal = cartElement.discountPercentage > 0 ? cartElement.discountedTotal : cartElement.subtotal;
                  const discountTag = cartElement.discountPercentage > 0 ? ` (${cartElement.discountPercentage}%)` : "";

                  return (
                    <tr key={cartElement.id}>
                      <td className="c3">
                        <div className={TableStyles.colImageWrapper}>
                          <div className={TableStyles.colImageContainer}>
                            {hasImageError ? (
                              <span className="c3">Image is not available</span>
                            ) : (
                              <img
                                src={cartElement.image}
                                alt={`Image of ${sanitizedDescription}`}
                                loading="lazy"
                                onError={() => handleImageError(cartElement.id)}
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="c3">{cartElement.sku || "N/A"}</td>
                      <td className={`${TableStyles.colLongWidth} c3`}>
                        <Link
                          to={`/details/${cartElement.categorySlug}/${cartElement.productSlug}`}
                          style={{ textDecoration: "none", color: "inherit" }}
                          aria-label={`View product ${sanitizedDescription}`}
                        >
                          <div
                            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                          />
                        </Link>
                      </td>
                      <td className="c3">
                        <div className={TableStyles.unitInputGroup}>
                          <button
                            className={`${TableStyles.unitButton} ${TableStyles.unitButtonMinus}`}
                            onClick={() => handlePackDecrement(cartElement.id)}
                            aria-label={`Decrement packs for ${cartElement.sku || "item"}`}
                            disabled={isUpdating}
                          >
                            <Minus className="icon-s" />
                          </button>
                          <input
                            type="text"
                            value={currentPacks || 0}
                            onChange={(e) => handlePackInputChange(cartElement.id, e)}
                            onBlur={() => handlePackInputBlur(cartElement.id)}
                            onKeyPress={(e) => handlePackInputKeyPress(cartElement.id, e)}
                            className={TableStyles.unitInput}
                            aria-label={`Enter packs for ${cartElement.sku || "item"}`}
                            disabled={isUpdating}
                          />
                          <button
                            className={`${TableStyles.unitButton} ${TableStyles.unitButtonPlus}`}
                            onClick={() => handlePackIncrement(cartElement.id)}
                            aria-label={`Increment packs for ${cartElement.sku || "item"}`}
                            disabled={isUpdating}
                          >
                            <Plus className="icon-s" />
                          </button>
                        </div>
                      </td>
                      <td className="c3">
                        £
                        {unitPrice.toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="c3">
                        £
                        {subtotalPrice.toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="c3">
                        £
                        {displayTotal.toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        {discountTag && <span className={TableStyles.discountTag}>{discountTag}</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className={TableStyles.orderSummary}>
          <div className={TableStyles.orderSummaryInfo}>
            <div className={TableStyles.orderSummaryRow}>
              <div className={TableStyles.orderDataWrapper}>
                <div className={TableStyles.orderSummaryData}>Total Items</div>
                <div className={TableStyles.orderSummaryData}>{totalItems}</div>
              </div>
              <div className={TableStyles.orderDataWrapper}>
                <div className={TableStyles.orderSummaryData}>Sub Total</div>
                <div className={TableStyles.orderSummaryData}>
                  £
                  {subtotal.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
            <div className={TableStyles.orderSummaryRow}>
              <div className={TableStyles.orderDataWrapper}>
                <div className={TableStyles.orderSummaryData}>Weight</div>
                <div className={TableStyles.orderSummaryData}>{weight.toFixed(1)}kg</div>
              </div>
              <div className={TableStyles.orderDataWrapper}>
                <div className={TableStyles.orderSummaryData}>VAT</div>
                <div className={TableStyles.orderSummaryData}>
                  £
                  {vat.toLocaleString("en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {subtotal >= 600 && (
        <AccentNotifier
          icon={Truck}
          text="SHOP WORTH 600£ AND GET 10% DISCOUNT ON ALL"
        />
      )}

      <div className="row-content justify-content-flex-end gap-xs">
        <Link
          to="/"
          className="secondary-btn large-btn text-large hover-primary"
          aria-label="Continue shopping"
        >
          Continue Shopping
        </Link>
        <Link
          to="/checkout"
          className="primary-btn large-btn text-large hover-primary"
          aria-label="Proceed to checkout"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartTable;