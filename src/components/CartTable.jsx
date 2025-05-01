import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Truck } from "lucide-react";
import DOMPurify from "dompurify";
import AccentNotifier from "./AccentNotifier";
import { updateCartItemUnits } from "utils/cartSlice";

// Cart item schema validation
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
    typeof item.sku === "string"
  );
};

const CartTable = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate cart items on mount
  useEffect(() => {
    try {
      const validatedItems = cartItems.filter(validateCartItem);
      if (validatedItems.length !== cartItems.length) {
        console.warn("Invalid cart items detected. Filtering invalid entries.");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error validating cart items:", err.message);
      setError("Failed to load cart. Please try again.");
      setLoading(false);
    }
  }, [cartItems]);

  // Handle unit decrease
  const handleUnitChange = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item || !validateCartItem(item)) {
      console.warn(`Invalid cart item: ${itemId}`);
      return;
    }
    const newUnits = Math.max(0, item.units - 1);
    dispatch(updateCartItemUnits({ itemId, units: newUnits }));
  };

  // Calculate order summary
  const calculateSummary = () => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.units, 0);
    const subtotal = cartItems.reduce(
      (sum, item) =>
        sum + (item.displayPriceType === "unit" ? item.subtotal : item.packSubtotal),
      0
    );
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
                <th
                  className={`${TableStyles.colLongWidth} l3 clr-accent-dark-blue`}
                  scope="col"
                >
                  Item
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Units
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Price
                </th>
                <th className="l3 clr-accent-dark-blue" scope="col">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {cartItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="c3 text-center">
                    Your cart is empty.
                  </td>
                </tr>
              ) : (
                cartItems.map((cartElement) => {
                  const sanitizedDescription = DOMPurify.sanitize(cartElement.description);
                  const unitPrice =
                    cartElement.units > 0
                      ? (cartElement.displayPriceType === "unit"
                          ? cartElement.subtotal
                          : cartElement.packSubtotal) / cartElement.units
                      : 0;
                  const totalPrice =
                    cartElement.displayPriceType === "unit"
                      ? cartElement.subtotal
                      : cartElement.packSubtotal;

                  return (
                    <tr key={cartElement.id}>
                      <td className="c3">
                        <div className={TableStyles.colImageWrapper}>
                          <div className={TableStyles.colImageContainer}>
                            <img
                              src={cartElement.image || "/fallback-image.jpg"}
                              alt={`Image of ${sanitizedDescription}`}
                              loading="lazy"
                              onError={(e) => (e.target.src = "/fallback-image.jpg")}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={`${TableStyles.colLongWidth} c3`}>
                        <div
                          dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                          aria-label={`Item: ${sanitizedDescription}`}
                        />
                        <div className="b3 clr-gray">
                          SKU: {cartElement.sku || "N/A"} | Variant ID: {cartElement.variantId}
                        </div>
                      </td>
                      <td className="c3">
                        <span
                          className={TableStyles.cartUnitsColWrapper}
                          role="group"
                          aria-label={`Adjust units for ${sanitizedDescription}`}
                        >
                          <button
                            className={TableStyles.cartButton}
                            onClick={() => handleUnitChange(cartElement.id)}
                            aria-label={`Decrease units for ${sanitizedDescription}`}
                            disabled={cartElement.units <= 0}
                          >
                            <Minus className="icon-xms" />
                          </button>
                          <span aria-live="polite">{cartElement.units}</span>
                        </span>
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
                        {totalPrice.toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
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

      {subtotal > 0 && (
        <AccentNotifier
          icon={Truck}
          text="Your order meets the requirements for free standard shipping."
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