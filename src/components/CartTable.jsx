import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Plus, AlertCircle } from "lucide-react";
import DOMPurify from "dompurify";
import AccentNotifier from "components/AccentNotifier";
import Notification from "components/Notification";
import { setCartItems } from "utils/cartSlice";
import { getOrCreateCart } from "utils/api/ecommerce";
import axios from "axios";
import { BASE_URL } from "utils/global";
import CustomLoading from "components/CustomLoading";

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
    "discountPercentage",
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
    typeof item.variantId === "string" &&
    typeof item.image === "string" &&
    typeof item.sku === "string" &&
    typeof item.productSlug === "string" &&
    typeof item.categorySlug === "string" &&
    typeof item.perUnitPrice === "number" &&
    typeof item.perPackPrice === "number" &&
    typeof item.unitsPerPack === "number" &&
    typeof item.trackInventory === "boolean" &&
    typeof item.stock === "number" &&
    typeof item.discountPercentage === "number"
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
  const [updatingRows, setUpdatingRows] = useState({});
  const [notification, setNotification] = useState({ message: "", type: "", visible: false });

  // Show notification with timeout
  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), 3000);
  };

  // Fetch cart data
  const fetchCartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const cart = await getOrCreateCart();
      console.log(cart)
      const cartId = cart.id;

      const cartUrl = normalizeUrl(BASE_URL, `ecommerce/carts/${cartId}/`);
      const cartResponse = await axios.get(cartUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const cartData = cartResponse.data;
      setCartData(cartData);

      const mappedItems = await Promise.all(
        cartData.items.map(async (item) => {
          try {
            const itemDetails = item.item;
            const productVariant = itemDetails.product_variant || {};
            const product = productVariant.product || {};
            const category = product.category || {};
            const productSlug = product.slug || "unknown";
            const categorySlug = category.slug || "unknown";
            const unitsPerPack = itemDetails.units_per_pack || 1;
            const itemImages = itemDetails.images || [];
            const firstImage = itemImages.length > 0 ? itemImages[0].image : "";
            const discountPercentage = parseFloat(item.discount_percentage) || 0;
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
              discountPercentage: parseFloat(item.discount_percentage) || 0,
              unitsPerPack: 1,
              trackInventory: false,
              stock: 0,
            };
          }
        })
      );

      // Sort items by id to ensure consistent order
      const sortedItems = mappedItems.sort((a, b) => a.id.localeCompare(b.id));

      const validatedItems = sortedItems.filter(validateCartItem);
      if (validatedItems.length !== sortedItems.length) {
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
      setError("Please login to see your items in the cart.");
      setLoading(false);
    }
  };

  // Fetch cart data on mount
  useEffect(() => {
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
      const cartItemUrl = normalizeUrl(BASE_URL, `ecommerce/cart-items/${itemId}/`);
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
      let unitType = currentCartItem.unit_type;

      if (roundedPacks > 0) {
        const pricingTiersUrl = normalizeUrl(BASE_URL, `ecommerce/pricing-tiers/?product_variant=${productVariantId}`);
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

        // Check if we should use pallet pricing
        if (unitType === 'pallet') {
          const palletTier = pricingTiers.find(t => t.tier_type === 'pallet');
          if (palletTier) {
            pricingTierId = palletTier.id;
          }
        } else {
          // Find appropriate pack tier
          let selectedTier = null;
          for (const tier of pricingTiers) {
            const withinRange =
              roundedPacks >= tier.range_start &&
              (tier.no_end_range || roundedPacks <= tier.range_end);
            if (withinRange && tier.tier_type === 'pack') {
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
      }

      if (roundedPacks === 0) {
        const deleteUrl = normalizeUrl(BASE_URL, `ecommerce/cart-items/${itemId}/`);
        await axios.delete(deleteUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        const patchUrl = normalizeUrl(BASE_URL, `ecommerce/cart-items/${itemId}/`);
        const patchResponse = await axios.patch(
          patchUrl,
          {
            pack_quantity: roundedPacks,
            pricing_tier: pricingTierId,
            unit_type: unitType
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (patchResponse.status !== 200) {
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
            return;
          }
        }
      }

      // Refresh the entire cart data to update all rows
      await fetchCartData();

      // Update editPacks state to reflect the new quantity
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
    const currentPacks = cartItems.find((item) => item.id === itemId)?.packs || 0;
    
    if (newPacks !== currentPacks) {
      handlePackChange(itemId, newPacks);
    }
  };
  
  const handlePackInputKeyPress = (itemId, e) => {
    if (updatingRows[itemId]) return;
    if (e.key === "Enter") {
      const newPacks = editPacks[itemId] !== undefined ? editPacks[itemId] : cartItems.find((item) => item.id === itemId)?.packs || 0;
      const currentPacks = cartItems.find((item) => item.id === itemId)?.packs || 0;
      
      if (newPacks !== currentPacks) {
        handlePackChange(itemId, newPacks);
      }
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

const calculateSummary = () => {
  if (!cartData) {
    return { 
      totalItems: 0, 
      totalPacks: 0, 
      subtotal: 0, 
      total: 0, 
      weight: 0, 
      vat: 0, 
      discount: 0, 
      vat_amount: 0, 
      discount_amount: 0 
    };
  }

  const subtotal = parseFloat(cartData.subtotal) || 0;
  const discount = parseFloat(cartData.discount) || 0;
  const vat = parseFloat(cartData.vat) || 0;

  // Calculate discount amount (if any)
  const discount_amount = (subtotal * discount) / 100;
  
  // Calculate VAT on the discounted subtotal (standard UK VAT practice)
  const vat_amount = ((subtotal - discount_amount) * vat) / 100;
  
  // Calculate total as: (subtotal - discount) + VAT
  const total = (subtotal - discount_amount) + vat_amount;

  return {
    totalItems: parseInt(cartData.total_units) || 0,
    totalPacks: parseInt(cartData.total_packs) || 0,
    subtotal: subtotal,
    total: Number(total.toFixed(2)), // Explicitly calculated total
    weight: parseFloat(cartData.total_weight) || 0,
    vat: vat,
    discount: discount,
    vat_amount: Number(vat_amount.toFixed(2)),
    discount_amount: Number(discount_amount.toFixed(2)),
  };
};

  const { totalItems, totalPacks, subtotal, total, weight, vat, discount, vat_amount, discount_amount } = calculateSummary();

  if (loading) {
    return <CustomLoading />;
  }

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification message={notification.message} type={notification.type} visible={notification.visible} />
      {error && (
        <AccentNotifier type="accent"
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
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Boxes</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Units</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Box Price</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Subtotal</th>
              <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Total</th>
            </tr>
          </thead>
          {cartItems.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan="8" className="b3 text-center">You have no items.</td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              {cartItems.map((cartElement) => {
                const sanitizedDescription = DOMPurify.sanitize(cartElement.description);
                const hasImageError = imageErrors[cartElement.id] || !cartElement.image;
                const currentPacks = editPacks[cartElement.id] !== undefined ? editPacks[cartElement.id] : cartElement.packs;
                const isUpdating = updatingRows[cartElement.id] || false;
                const discountTag = cartElement.discountPercentage > 0 ? ` ${Number(cartElement.discountPercentage).toFixed(2)}%` : "";
                const priceToShow = cartElement.displayPriceType === 'pallet' ? 
                  cartElement.perPackPrice : 
                  cartElement.perPackPrice;

                return (
                  <tr key={cartElement.id} className={cartElement.units > 0 ? TableStyles.selectedRow : ""}>
                    <td className={`${TableStyles.imageColTd} b3 clr-text`}>
                      <div className={TableStyles.colImageContainer}>
                        {hasImageError ? (
                          <span className="b3 clr-gray">Image Not Available</span>
                        ) : (
                          <img
                            src={cartElement.image}
                            alt={`${sanitizedDescription}`}
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
                      £{priceToShow.toLocaleString("en-GB", {
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
                      <span className={TableStyles.exclusivePrice}>
                        <span>
                          £{cartElement.total.toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                        {/* {discountTag && (
                          <span className={`${TableStyles.percentageTag} b3 clr-success`} style={{ marginLeft: "8px" }}>
                            {discountTag}
                          </span>
                        )} */}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>
      {cartItems.length > 0 && (
        <table className={TableStyles.cartSummaryTable}>
          <tbody>
            <tr>
              <th className="b3 clr-text">Total Items</th>
              <td className="b3 clr-text">{totalItems}</td>
            </tr>
            <tr>
              <th className="b3 clr-text">Total Boxes</th>
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
              <th className="b3 clr-text">VAT ({vat.toFixed(2)}%)</th>
              <td className="b3 clr-text">
                £{vat_amount.toLocaleString("en-GB", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            </tr>
            <tr className={TableStyles.totalRow}>
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
