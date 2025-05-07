import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import TableStyles from "assets/css/TableStyles.module.css";
import { Truck, Minus, Plus, AlertCircle } from "lucide-react";
import DOMPurify from "dompurify";
import AccentNotifier from "./AccentNotifier";
import Notification from "components/Notification";
import { updateCartItemUnits, setCartItems } from "utils/cartSlice";
import { getOrCreateCart } from "utils/api/ecommerce";
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
    "total",
    "displayPriceType",
    "variantId",
    "image",
    "sku",
    "productSlug",
    "categorySlug",
    "perUnitPrice",
    "perPackPrice",
    "unitsPerPack",
    "trackInventory",
    "stock",
  ];
  return (
    item &&
    requiredFields.every((field) => field in item) &&
    typeof item.id === "string" &&
    typeof item.description === "string" &&
    typeof item.packs === "number" &&
    typeof item.units === "number" &&
    typeof item.subtotal === "number" &&
    typeof item.total === "number" &&
    ["pack"].includes(item.displayPriceType) &&
    typeof item.variantId === "string" &&
    typeof item.image === "string" &&
    typeof item.sku === "string" &&
    typeof item.productSlug === "string" &&
    typeof item.categorySlug === "string" &&
    typeof item.perUnitPrice === "number" &&
    typeof item.perPackPrice === "number" &&
    typeof item.unitsPerPack === "number" &&
    typeof item.trackInventory === "boolean" &&
    typeof item.stock === "number"
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
  const [cartData, setCartData] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [editPacks, setEditPacks] = useState({});
  const [exclusiveDiscounts, setExclusiveDiscounts] = useState({});
  const [updatingRows, setUpdatingRows] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });

  // Show notification with timeout
  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), 3000);
  };

  // Fetch cart data on mount
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cart = await getOrCreateCart();
        const cartId = cart.id;

        const cartUrl = normalizeUrl(BASE_URL, `carts/${cartId}/`);
        const cartResponse = await axios.get(cartUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const cartData = cartResponse.data;
        setCartData(cartData);

        const discounts = {};
        if (isLoggedIn) {
          const abortController = new AbortController();
          try {
            for (const item of cartData.items) {
              if (!item.user_exclusive_price) {
                discounts[item.id] = { id: null, discount_percentage: 0 };
                continue;
              }
              const exclusivePriceUrl = normalizeUrl(BASE_URL, `user-exclusive-prices/${item.user_exclusive_price.id}/`);
              const exclusivePriceResponse = await axios.get(exclusivePriceUrl, {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
                signal: abortController.signal,
              });
              const exclusivePrice = exclusivePriceResponse.data;
              discounts[item.id] = {
                id: exclusivePrice.id,
                discount_percentage: parseFloat(exclusivePrice.discount_percentage) || 0,
              };
            }
            setExclusiveDiscounts(discounts);
          } catch (error) {
            if (error.name !== "AbortError") {
              console.error("Failed to fetch exclusive prices:", error.message);
            }
          }
          abortController.abort();
        }

        const mappedItems = await Promise.all(
          cartData.items.map(async (item) => {
            try {
              const itemDetails = item.item;
              const productVariant = itemDetails.product_variant || {};
              const product = productVariant.product || {};
              const category = product.category || {};
              const productSlug = product.slug || "unknown";
              const categorySlug = category.slug || "unknown";
              const unitsPerPack = productVariant.units_per_pack || 1;
              const itemImages = itemDetails.images || [];
              const firstImage = itemImages.length > 0 ? itemImages[0].image : "";

              const discountPercentage = discounts[item.id]?.discount_percentage || 0;
              const description = itemDetails.title || productVariant.name || `Item ${item.item.id}`;

              return {
                id: item.id.toString(),
                description,
                packs: item.pack_quantity,
                units: item.pack_quantity * unitsPerPack,
                subtotal: parseFloat(item.subtotal) || 0,
                total: parseFloat(item.total) || 0,
                displayPriceType: item.unit_type,
                variantId: productVariant.id?.toString() || "unknown",
                image: firstImage,
                sku: itemDetails.sku || `SKU-${item.item.id}`,
                productSlug,
                categorySlug,
                perUnitPrice: parseFloat(item.price_per_unit) || 0,
                perPackPrice: parseFloat(item.price_per_pack) || 0,
                pricingTierId: item.pricing_tier.id,
                discountPercentage,
                unitsPerPack,
                trackInventory: itemDetails.track_inventory || false,
                stock: itemDetails.stock || 0,
              };
            } catch (itemErr) {
              console.warn(`Failed to map item ${item.item.id}:`, itemErr.message);
              return {
                id: item.id.toString(),
                description: `Item ${item.item.id} (Details unavailable)`,
                packs: item.pack_quantity,
                units: item.pack_quantity,
                subtotal: parseFloat(item.subtotal) || 0,
                total: parseFloat(item.total) || 0,
                displayPriceType: item.unit_type,
                variantId: "unknown",
                image: "",
                sku: `SKU-${item.item.id}`,
                productSlug: "unknown",
                categorySlug: "unknown",
                perUnitPrice: parseFloat(item.price_per_unit) || 0,
                perPackPrice: parseFloat(item.price_per_pack) || 0,
                pricingTierId: item.pricing_tier.id,
                discountPercentage: discounts[item.id]?.discount_percentage || 0,
                unitsPerPack: 1,
                trackInventory: false,
                stock: 0,
              };
            }
          })
        );

        const validatedItems = mappedItems.filter(validateCartItem);
        if (validatedItems.length !== mappedItems.length) {
          console.warn("Invalid cart items detected. Filtering invalid entries.");
        }

        const stockAdjustedItems = validatedItems.map((item) => {
          if (item.trackInventory && item.units > item.stock) {
            const maxPacks = Math.floor(item.stock / item.unitsPerPack);
            showNotification(
              `Stock for ${item.sku} adjusted. Available: ${item.stock} units (Max ${item.stock} units). Set to ${maxPacks} packs.`,
              "warning"
            );
            return {
              ...item,
              packs: maxPacks,
              units: maxPacks * item.unitsPerPack,
            };
          }
          return item;
        });

        dispatch(setCartItems(stockAdjustedItems));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart data:", err.message);
        setError("Failed to load cart. Please try again.");
        setLoading(false);
      }
    };

    fetchCartData();
  }, [dispatch, isLoggedIn]);

  const handlePackChange = async (itemId, newPacks) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item || !validateCartItem(item)) {
      console.warn(`Invalid cart item: ${itemId}`);
      setError("Invalid cart item. Please refresh the cart.");
      return;
    }

    const backendItem = cartData?.items.find((backendItem) => backendItem.id.toString() === itemId);
    if (!backendItem) {
      console.warn(`Backend item not found for ${itemId}`);
      setError("Item not found in cart. Please refresh.");
      return;
    }

    setUpdatingRows((prev) => ({ ...prev, [itemId]: true }));

    try {
      const cartItemUrl = normalizeUrl(BASE_URL, `cart-items/${itemId}/`);
      const cartItemResponse = await axios.get(cartItemUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const currentCartItem = cartItemResponse.data;

      const itemDetails = backendItem.item;
      const unitsPerPack = item.unitsPerPack;
      const productVariantId = itemDetails.product_variant?.id;

      if (!productVariantId) {
        console.error(`No product variant found for item ${itemId}`);
        setError("Unable to update item due to missing product variant. Please refresh the cart.");
        return;
      }

      let roundedPacks = Math.max(0, Math.round(newPacks));
      const newUnits = roundedPacks * unitsPerPack;

      if (item.trackInventory && newUnits > item.stock) {
        const maxPacks = Math.floor(item.stock / unitsPerPack);
        roundedPacks = maxPacks;
        showNotification(
          `Insufficient stock for ${item.sku}. Available: ${item.stock} units (Max ${item.stock} units). Adjusted to ${maxPacks} packs.`,
          "warning"
        );
      }

      let pricingTierId = currentCartItem.pricing_tier.id;

      if (roundedPacks > 0) {
        const pricingTiersUrl = normalizeUrl(BASE_URL, `pricing-tiers/?product_variant=${productVariantId}`);
        const pricingTiersResponse = await axios.get(pricingTiersUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const pricingTiers = pricingTiersResponse.data.results || [];

        if (!pricingTiers.length) {
          console.error(`No pricing tiers found for product variant ${productVariantId}`);
          setError("No pricing tiers available for this item. Please contact support.");
          return;
        }

        let selectedTier = null;
        for (const tier of pricingTiers) {
          const withinRange =
            roundedPacks >= tier.range_start &&
            (tier.no_end_range || roundedPacks <= tier.range_end);
          if (withinRange && tier.tier_type === "pack") {
            selectedTier = tier;
            break;
          }
        }

        if (!selectedTier) {
          console.warn(`No valid pricing tier found for quantity ${roundedPacks}`);
          setError(`No pricing tier available for quantity ${roundedPacks}. Please adjust the quantity.`);
          return;
        }

        pricingTierId = selectedTier.id;
      }

      if (roundedPacks === 0) {
        const deleteUrl = normalizeUrl(BASE_URL, `cart-items/${itemId}/`);
        await axios.delete(deleteUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        });

        dispatch(setCartItems(cartItems.filter((i) => i.id !== itemId)));

        setCartData((prev) => ({
          ...prev,
          items: prev.items.filter((i) => i.id.toString() !== itemId),
          subtotal: prev.subtotal - item.subtotal,
          total: prev.total - item.total,
          total_units: prev.total_units - item.units,
          total_packs: prev.total_packs - roundedPacks,
          total_weight: prev.total_weight - backendItem.weight,
        }));
      } else {
        const patchUrl = normalizeUrl(BASE_URL, `cart-items/${itemId}/`);
        const patchResponse = await axios.patch(
          patchUrl,
          {
            pack_quantity: roundedPacks,
            pricing_tier: pricingTierId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (patchResponse.status === 200) {
          const cartUrl = normalizeUrl(BASE_URL, `carts/${cartData.id}/`);
          const updatedCartResponse = await axios.get(cartUrl, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });
          const updatedCartData = updatedCartResponse.data;
          setCartData(updatedCartData);

          const updatedItem = updatedCartData.items.find((i) => i.id.toString() === itemId);
          if (!updatedItem) {
            console.warn(`Updated item ${itemId} not found in cart after update`);
            dispatch(setCartItems(cartItems.filter((i) => i.id !== itemId)));
            setCartData((prev) => ({
              ...prev,
              items: prev.items.filter((i) => i.id.toString() !== itemId),
            }));
            return;
          }

          const discountPercentage = exclusiveDiscounts[itemId]?.discount_percentage || 0;
          const description = updatedItem.item.title || updatedItem.item.product_variant?.name || `Item ${updatedItem.item.id}`;

          const updatedCartItem = {
            ...item,
            units: roundedPacks * unitsPerPack,
            packs: updatedItem.pack_quantity,
            subtotal: parseFloat(updatedItem.subtotal) || 0,
            total: parseFloat(updatedItem.total) || 0,
            discountPercentage,
            perUnitPrice: parseFloat(updatedItem.price_per_unit) || 0,
            perPackPrice: parseFloat(updatedItem.price_per_pack) || 0,
            description,
            pricingTierId: updatedItem.pricing_tier.id,
          };

          const updatedCartItems = cartItems.map((cartItem) =>
            cartItem.id === itemId ? updatedCartItem : cartItem
          );
          dispatch(setCartItems(updatedCartItems));
        } else if (patchResponse.status === 400) {
          const errorDetail = patchResponse.data.detail;
          const stockErrorMatch = errorDetail.match(/Insufficient stock for ([^\.]+)\. Available: (\d+) units, Required: (\d+) units\./);
          if (stockErrorMatch) {
            const [, sku, available] = stockErrorMatch;
            const availableUnits = parseInt(available);
            const maxPacks = Math.floor(availableUnits / unitsPerPack);
            setError(`Insufficient stock for ${sku}. Available: ${availableUnits} units (Max ${availableUnits} units). Adjusted to ${maxPacks} packs.`);
            showNotification(
              `Insufficient stock for ${sku}. Available: ${availableUnits} units (Max ${availableUnits} units). Adjusted to ${maxPacks} packs.`,
              "warning"
            );
            await handlePackChange(itemId, maxPacks);
            return;
          } else {
            setError("Failed to update pack quantity. Please try again.");
          }
        }
      }

      setEditPacks((prev) => ({ ...prev, [itemId]: roundedPacks }));
    } catch (err) {
      console.error("Error updating pack quantity:", err.message);
      const errorMessage = err.response?.data?.detail || "Failed to update pack quantity. Please try again.";
      setError(errorMessage);
    } finally {
      setUpdatingRows((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handlePackIncrement = (itemId) => {
    if (updatingRows[itemId]) return;
    const currentPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
    const newPacks = currentPacks + 1;
    setEditPacks((prev) => ({ ...prev, [itemId]: newPacks }));
    handlePackChange(itemId, newPacks);
  };

  const handlePackDecrement = (itemId) => {
    if (updatingRows[itemId]) return;
    const currentPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
    const newPacks = Math.max(0, currentPacks - 1);
    setEditPacks((prev) => ({ ...prev, [itemId]: newPacks }));
    handlePackChange(itemId, newPacks);
  };

  const handlePackInputChange = (itemId, e) => {
    if (updatingRows[itemId]) return;
    const newValue = parseInt(e.target.value, 10) || 0;
    setEditPacks((prev) => ({ ...prev, [itemId]: newValue }));
  };

  const handlePackInputBlur = (itemId) => {
    if (updatingRows[itemId]) return;
    const newPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
    handlePackChange(itemId, newPacks);
  };

  const handlePackInputKeyPress = (itemId, e) => {
    if (updatingRows[itemId]) return;
    if (e.key === "Enter") {
      const newPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
      handlePackChange(itemId, newPacks);
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const calculateSummary = () => {
    if (!cartData) {
      return { totalItems: 0, totalPacks: 0, subtotal: 0, total: 0, weight: 0, vat: 0, discount: 0, vat_amount: 0, discount_amount: 0 };
    }

    const subtotal = parseFloat(cartData.subtotal) || 0;
    const discount = parseFloat(cartData.discount) || 0;
    const vat = parseFloat(cartData.vat) || 0;

    const discount_amount = (subtotal * discount) / 100;
    const discounted_subtotal = subtotal - discount_amount;
    const vat_amount = (discounted_subtotal * vat) / 100;

    return {
      totalItems: parseInt(cartData.total_units) || 0,
      totalPacks: parseInt(cartData.total_packs) || 0,
      subtotal: subtotal,
      total: parseFloat(cartData.total) || 0,
      weight: parseFloat(cartData.total_weight) || 0,
      vat: vat,
      discount: discount,
      vat_amount: Number(vat_amount.toFixed(2)),
      discount_amount: Number(discount_amount.toFixed(2)),
    };
  };

  const { totalItems, totalPacks, subtotal, total, weight, vat, discount, vat_amount, discount_amount } = calculateSummary();

  if (loading) {
    return (
      <div className={TableStyles.tableContentWrapper}>
        <div className={TableStyles.tableContainer}>
          <p className="c3 text-center">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification message={notification.message} type={notification.type} visible={notification.visible} />
      {error && (
        <AccentNotifier
          icon={AlertCircle}
          text={error}
          className="clr-danger"
        />
      )}
      <div className={TableStyles.tableContainer}>
        <table className={TableStyles.table} role="grid">
          <thead>
            <tr>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Image</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>SKU</th>
              <th className={`${TableStyles.defaultHeader} ${TableStyles.longField} b3 clr-text`}>Item</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Packs</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Units</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Pack Price</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Subtotal</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.length === 0 ? (
              <tr>
                <td colSpan={8} className="c3 text-center">
                  Your cart is empty.
                </td>
              </tr>
            ) : (
              cartItems.map((cartElement) => {
                const sanitizedDescription = DOMPurify.sanitize(cartElement.description);
                const hasImageError = imageErrors[cartElement.id] || !cartElement.image;
                const currentPacks = editPacks[cartElement.id] !== undefined ? editPacks[cartElement.id] : cartElement.packs;
                const isUpdating = updatingRows[cartElement.id] || false;
                const discountTag = cartElement.discountPercentage > 0 ? ` (${cartElement.discountPercentage}%)` : "";

                return (
                  <tr key={cartElement.id} className={cartElement.units > 0 ? TableStyles.selectedRow : ""}>
                    <td className={`${TableStyles.imageColTd} b3 clr-text`}>
                      <div className={TableStyles.colImageContainer}>
                        {hasImageError ? (
                          <span className="b3 clr-gray">Image Not Available</span>
                        ) : (
                          <img
                            src={cartElement.image}
                            alt={`Image of ${sanitizedDescription}`}
                            className={TableStyles.colImageContainer}
                            onError={() => handleImageError(cartElement.id)}
                            loading="lazy"
                          />
                        )}
                      </div>
                    </td>
                    <td className="b3 clr-text">{cartElement.sku || "N/A"}</td>
                    <td className={`${TableStyles.longField} b3 clr-text`}>
                      <Link
                        to={`/details/${cartElement.categorySlug}/${cartElement.productSlug}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                        aria-label={`View product ${sanitizedDescription}`}
                      >
                        <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
                      </Link>
                    </td>
                    <td className="b3 clr-text">
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
                    <td className="b3 clr-text">{cartElement.units}</td>
                    <td className="b3 clr-text">
                      £{cartElement.perPackPrice.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="b3 clr-text">
                      £{cartElement.subtotal.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="b3 clr-text">
                      £{cartElement.total.toLocaleString("en-GB", {
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
      <table className={TableStyles.summaryTable}>
        <tbody>
          <tr>
            <th className="b3 clr-text">Total Items</th>
            <td className="b3 clr-text">{totalItems}</td>
          </tr>
          <tr>
            <th className="b3 clr-text">Total Packs</th>
            <td className="b3 clr-text">{totalPacks}</td>
          </tr>
          <tr>
            <th className="b3 clr-text">Subtotal</th>
            <td className="b3 clr-text">
              £{subtotal.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <th className="b3 clr-text">Discount ({discount}%)</th>
            <td className="b3 clr-text">
              £{discount_amount.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <th className="b3 clr-text">VAT ({vat}%)</th>
            <td className="b3 clr-text">
              £{vat_amount.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <th className="b3 clr-text">Total</th>
            <td className="b3 clr-text">
              £{total.toLocaleString("en-GB", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </td>
          </tr>
          <tr>
            <th className="b3 clr-text">Weight</th>
            <td className="b3 clr-text">{weight.toFixed(1)}kg</td>
          </tr>
        </tbody>
      </table>

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