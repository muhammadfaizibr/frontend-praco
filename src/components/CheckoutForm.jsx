import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FormStyles from "assets/css/FormStyles.module.css";
import { AreaChart, Code2, MapPin, MapPinCheck, NotebookText } from "lucide-react";
import { createOrder, getOrCreateCart, getCartItems } from "utils/api/ecommerce";
import { setCartItems } from "utils/cartSlice";

const CheckoutForm = () => {
  const [countryValue] = useState("United Kingdom");
  const [addressValue, setAddressValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [postalCodeValue, setPostalCodeValue] = useState("");
  const [notesValue, setNotesValue] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortController = new AbortController();

  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const formInputs = [
    {
      label: "Country",
      name: "country",
      type: "text",
      icon: <MapPin />,
      value: countryValue,
      onchange: () => {},
      disabled: true,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      icon: <MapPinCheck />,
      value: addressValue,
      onchange: (e) => setAddressValue(e.target.value),
    },
    {
      label: "City",
      name: "city",
      type: "text",
      icon: <AreaChart />,
      value: cityValue,
      onchange: (e) => setCityValue(e.target.value),
    },
    {
      label: "Postal Code",
      name: "postal_code",
      type: "text",
      icon: <Code2 />,
      value: postalCodeValue,
      onchange: (e) => setPostalCodeValue(e.target.value),
    },
  ];

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setIsLoading(true);
        const cart = await getOrCreateCart();
        const cartId = cart.id;
        const cartItemsResponse = await getCartItems(cartId);
        const mappedItems = cartItemsResponse.results.map((item) => ({
          id: item.id.toString(),
          description: item.item.title || item.item.product_variant?.name || `Item ${item.item.id}`,
          packs: item.pack_quantity,
          units: item.pack_quantity * (item.item.product_variant?.units_per_pack || 1),
          subtotal: parseFloat(item.subtotal) || 0,
          total: parseFloat(item.total) || 0,
          displayPriceType: item.unit_type,
          variantId: item.item.product_variant?.id?.toString() || "unknown",
          image: item.item.images?.[0]?.image || "",
          sku: item.item.sku || `SKU-${item.item.id}`,
          perPackPrice: parseFloat(item.price_per_pack) || 0,
          pricingTierId: item.pricing_tier.id,
          weight: parseFloat(item.weight) || 0,
          itemId: item.item.id,
        }));
        dispatch(setCartItems(mappedItems));
      } catch (error) {
        console.error("Error fetching cart data:", error.message);
        setApiError(error.message || "Failed to load cart. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartData();

    return () => {
      abortController.abort();
    };
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validateForm = () => {
    const newErrors = {};
    if (!addressValue) newErrors.address = "Address is required";
    if (!cityValue) newErrors.city = "City is required";
    if (!postalCodeValue) newErrors.postal_code = "Postal code is required";
    if (!cartItems.length) newErrors.cart = "Cart is empty. Add items to proceed.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const orderData = {
        country: countryValue,
        address: addressValue,
        city: cityValue,
        postal_code: postalCodeValue,
        notes: notesValue,
        vat: 20.00,
        discount: 0.00,
      };

      await createOrder(orderData, {
        signal: abortController.signal,
      });

      dispatch(setCartItems([]));
      setSuccessMessage("Order placed successfully! Cart has been cleared.");
      setAddressValue("");
      setCityValue("");
      setPostalCodeValue("");
      setNotesValue("");
      setErrors({});
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        setErrors((prev) => ({
          ...prev,
          ...error.fieldErrors,
          address: error.fieldErrors.address || prev.address,
          city: error.fieldErrors.city || prev.city,
          postal_code: error.fieldErrors.postal_code || prev.postal_code,
          cart: error.fieldErrors.cart || prev.cart,
        }));
      }
      setApiError(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={FormStyles.formWrapper}>
      <form className={FormStyles.container} onSubmit={handleCheckout}>
        <h4 className="dark">
          Place your <span className="clr-orange">Order</span>
        </h4>

        {apiError && <div className={FormStyles.errorMessage}>{apiError}</div>}
        {successMessage && (
          <div className={FormStyles.successMessage}>{successMessage}</div>
        )}

        {formInputs.map((inputElement) => (
          <div className={FormStyles.inputGroup} key={inputElement.name}>
            <label className="dark l2" htmlFor={inputElement.name}>
              {inputElement.label}
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}>{inputElement.icon}</span>
              <input
                className={`b2 ${errors[inputElement.name] ? FormStyles.inputError : ""}`}
                type={inputElement.type}
                name={inputElement.name}
                id={inputElement.name}
                value={inputElement.value}
                onChange={inputElement.onchange}
                disabled={isLoading || inputElement.disabled}
              />
            </div>
            {errors[inputElement.name] && (
              <span className={FormStyles.errorText}>{errors[inputElement.name]}</span>
            )}
          </div>
        ))}

        <div className={FormStyles.inputGroup}>
          <label className="dark l2" htmlFor="notes">
            Order Notes (Optional)
          </label>
          <div className={FormStyles.inputWrapper}>
            <span
              className={FormStyles.inputIcon}
              style={{ height: "auto", paddingTop: "var(--padding-xs)" }}
            >
              <NotebookText />
            </span>
            <textarea
              style={{ width: '100%', paddingLeft: '40px' }}
              className={`b2 ${errors.notes ? FormStyles.inputError : ""}`}
              name="notes"
              id="notes"
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
          {errors.notes && (
            <span className={FormStyles.errorText}>{errors.notes}</span>
          )}
        </div>

        <div className={FormStyles.inputGroup}>
          <label className="dark l2">Cart Items</label>
          {cartItems.length > 0 ? (
            <ul className={FormStyles.cartList}>
              {cartItems.map((item) => (
                <li key={item.id} className="b2">
                  {item.description} - {item.packs} pack{item.packs > 1 ? "s" : ""}
                </li>
              ))}
            </ul>
          ) : (
            <p className="b2">No items in cart.</p>
          )}
          {errors.cart && (
            <span className={FormStyles.errorText}>{errors.cart}</span>
          )}
        </div>

        <button
          className={`primary-btn large-btn full-width text-large ${
            isLoading ? FormStyles.loading : errors.cart ? FormStyles.errorButton : ""
          }`}
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;