import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FormStyles from "assets/css/FormStyles.module.css";
import { AreaChart, Code2, MapPin, MapPinCheck, Home, CreditCard, User } from "lucide-react";
import { createOrder, getOrCreateCart, getCartItems, getShippingAddresses, getBillingAddresses, createShippingAddress, createBillingAddress } from "utils/api/ecommerce";
import { setCartItems } from "utils/cartSlice";

const CheckoutForm = () => {
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [billingAddresses, setBillingAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState("");
  const [selectedBillingAddress, setSelectedBillingAddress] = useState("");
  const [newShippingAddress, setNewShippingAddress] = useState({
    first_name: "",
    last_name: "",
    telephone_number: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United Kingdom"
  });
  const [newBillingAddress, setNewBillingAddress] = useState({
    first_name: "",
    last_name: "",
    telephone_number: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United Kingdom"
  });
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [showNewBillingForm, setShowNewBillingForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [shippingCost, setShippingCost] = useState("10.00");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortController = new AbortController();

  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const paymentMethodOptions = [
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "paypal", label: "PayPal" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "manual_payment", label: "Manual Payment" },
  ];

  // Validate address objects to ensure they have required fields
  const validateAddresses = (addresses) => {
    return (addresses || []).filter((addr) =>
      addr &&
      typeof addr === 'object' &&
      addr.id &&
      addr.first_name &&
      addr.last_name &&
      addr.telephone_number &&
      addr.street &&
      addr.city &&
      addr.postal_code &&
      addr.country
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch cart
        const cart = await getOrCreateCart().catch((err) => {
          throw new Error(`Failed to fetch cart: ${err.message || "Unknown error"}`);
        });
        const cartId = cart.id;
        // Fetch cart items
        const cartItemsResponse = await getCartItems(cartId).catch((err) => {
          throw new Error(`Failed to fetch cart items: ${err.message || "Unknown error"}`);
        });
        const mappedItems = (cartItemsResponse.results || []).map((item) => ({
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

        // Fetch addresses
        const shippingAddressesResponse = await getShippingAddresses().catch((err) => {
          throw new Error(`Failed to fetch shipping addresses: ${err.message || "Unknown error"}`);
        });
        const billingAddressesResponse = await getBillingAddresses().catch((err) => {
          throw new Error(`Failed to fetch billing addresses: ${err.message || "Unknown error"}`);
        });
        const validShippingAddresses = validateAddresses(shippingAddressesResponse);
        const validBillingAddresses = validateAddresses(billingAddressesResponse);
        setShippingAddresses(validShippingAddresses);
        setBillingAddresses(validBillingAddresses);
        if (!validShippingAddresses.length && !validBillingAddresses.length) {
          setApiError("No valid addresses found. Please add a shipping and billing address.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setApiError(error.message || "Failed to load checkout data. Please try again or contact support.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

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
    if (!selectedShippingAddress && !showNewShippingForm) {
      newErrors.shipping_address = "Please select or create a shipping address.";
    }
    if (!selectedBillingAddress && !showNewBillingForm) {
      newErrors.billing_address = "Please select or create a billing address.";
    }
    if (showNewShippingForm) {
      if (!newShippingAddress.first_name) newErrors.shipping_first_name = "First name is required.";
      if (!newShippingAddress.last_name) newErrors.shipping_last_name = "Last name is required.";
      if (!newShippingAddress.telephone_number) {
        newErrors.shipping_telephone_number = "Telephone number is required.";
      } else if (!/^\+?\d{8,15}$/.test(newShippingAddress.telephone_number)) {
        newErrors.shipping_telephone_number = "Invalid telephone number (8-15 digits, optional +).";
      }
      if (!newShippingAddress.street) newErrors.shipping_street = "Street is required.";
      if (!newShippingAddress.city) newErrors.shipping_city = "City is required.";
      if (!newShippingAddress.postal_code) newErrors.shipping_postal_code = "Postal code is required.";
      if (newShippingAddress.postal_code && !/^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/.test(newShippingAddress.postal_code)) {
        newErrors.shipping_postal_code = "Invalid UK postal code format.";
      }
    }
    if (showNewBillingForm) {
      if (!newBillingAddress.first_name) newErrors.billing_first_name = "First name is required.";
      if (!newBillingAddress.last_name) newErrors.billing_last_name = "Last name is required.";
      if (!newBillingAddress.telephone_number) {
        newErrors.billing_telephone_number = "Telephone number is required.";
      } else if (!/^\+?\d{8,15}$/.test(newBillingAddress.telephone_number)) {
        newErrors.billing_telephone_number = "Invalid telephone number (8-15 digits, optional +).";
      }
      if (!newBillingAddress.street) newErrors.billing_street = "Street is required.";
      if (!newBillingAddress.city) newErrors.billing_city = "City is required.";
      if (!newBillingAddress.postal_code) newErrors.billing_postal_code = "Postal code is required.";
      if (newBillingAddress.postal_code && !/^[A-Z]{1,2}[0-9R][0-9A-Z]? ?[0-9][A-Z]{2}$/.test(newBillingAddress.postal_code)) {
        newErrors.billing_postal_code = "Invalid UK postal code format.";
      }
    }
    if (!paymentMethod) {
      newErrors.payment_method = "Payment method is required.";
    }
    if (!shippingCost || parseFloat(shippingCost) < 0) {
      newErrors.shipping_cost = "Shipping cost must be a non-negative number.";
    }
    if (!cartItems.length) {
      newErrors.cart = "Cart is empty. Add items to proceed.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAddress = async (type) => {
    try {
      setIsLoading(true);
      setErrors({});
      const addressData = type === 'shipping' ? newShippingAddress : newBillingAddress;
      const createFn = type === 'shipping' ? createShippingAddress : createBillingAddress;
      const response = await createFn(addressData, { signal: abortController.signal });
      if (type === 'shipping') {
        setShippingAddresses([...shippingAddresses, response]);
        setSelectedShippingAddress(response.id);
        setNewShippingAddress({
          first_name: "",
          last_name: "",
          telephone_number: "",
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "United Kingdom"
        });
        setShowNewShippingForm(false);
      } else {
        setBillingAddresses([...billingAddresses, response]);
        setSelectedBillingAddress(response.id);
        setNewBillingAddress({
          first_name: "",
          last_name: "",
          telephone_number: "",
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "United Kingdom"
        });
        setShowNewBillingForm(false);
      }
    } catch (error) {
      console.error(`Error creating ${type} address:`, error);
      setErrors((prev) => ({
        ...prev,
        ...error.fieldErrors,
        [`${type}_first_name`]: error.fieldErrors.first_name || prev[`${type}_first_name`],
        [`${type}_last_name`]: error.fieldErrors.last_name || prev[`${type}_last_name`],
        [`${type}_telephone_number`]: error.fieldErrors.telephone_number || prev[`${type}_telephone_number`],
        [`${type}_street`]: error.fieldErrors.street || prev[`${type}_street`],
        [`${type}_city`]: error.fieldErrors.city || prev[`${type}_city`],
        [`${type}_state`]: error.fieldErrors.state || prev[`${type}_state`],
        [`${type}_postal_code`]: error.fieldErrors.postal_code || prev[`${type}_postal_code`],
      }));
      setApiError(error.message || `Failed to create ${type} address. Please check the form.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");
    setErrors({});

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let shippingAddressId = selectedShippingAddress;
      let billingAddressId = selectedBillingAddress;

      if (showNewShippingForm) {
        const response = await createShippingAddress(newShippingAddress, { signal: abortController.signal });
        shippingAddressId = response.id;
        setShippingAddresses([...shippingAddresses, response]);
        setNewShippingAddress({
          first_name: "",
          last_name: "",
          telephone_number: "",
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "United Kingdom"
        });
        setShowNewShippingForm(false);
      }
      if (showNewBillingForm) {
        const response = await createBillingAddress(newBillingAddress, { signal: abortController.signal });
        billingAddressId = response.id;
        setBillingAddresses([...billingAddresses, response]);
        setNewBillingAddress({
          first_name: "",
          last_name: "",
          telephone_number: "",
          street: "",
          state: "",
          postal_code: "",
          country: "United Kingdom"
        });
        setShowNewBillingForm(false);
      }

      const orderData = {
        shipping_address: parseInt(shippingAddressId),
        billing_address: parseInt(billingAddressId),
        shipping_cost: parseFloat(shippingCost).toFixed(2),
        vat: 20.00,
        discount: 0.00,
        status: "pending",
        payment_status: "pending",
        payment_method: paymentMethod,
      };

      await createOrder(orderData, { signal: abortController.signal });

      dispatch(setCartItems([]));
      setSuccessMessage("Order placed successfully! Cart has been cleared.");
      setSelectedShippingAddress("");
      setSelectedBillingAddress("");
      setPaymentMethod("");
      setShippingCost("10.00");
      setErrors({});
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        setErrors((prev) => ({
          ...prev,
          ...error.fieldErrors,
          shipping_address: error.fieldErrors.shipping_address || prev.shipping_address,
          billing_address: error.fieldErrors.billing_address || prev.billing_address,
          shipping_cost: error.fieldErrors.shipping_cost || prev.shipping_cost,
          payment_method: error.fieldErrors.payment_method || prev.payment_method,
          cart: error.fieldErrors.cart || prev.cart,
        }));
      }
      setApiError(error.message || "Failed to place order. Please check the form.");
    } finally {
      setIsLoading(false);
    }
  };

  const addressFields = [
    { label: "First Name", name: "first_name", type: "text", icon: <User /> },
    { label: "Last Name", name: "last_name", type: "text", icon: <User /> },
    { label: "Telephone Number", name: "telephone_number", type: "tel", icon: <User /> },
    { label: "Street", name: "street", type: "text", icon: <MapPinCheck /> },
    { label: "City", name: "city", type: "text", icon: <AreaChart /> },
    { label: "State", name: "state", type: "text", icon: <Home /> },
    { label: "Postal Code", name: "postal_code", type: "text", icon: <Code2 /> },
    { label: "Country", name: "country", type: "text", icon: <MapPin />, disabled: true },
  ];

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

        <div className={FormStyles.formSection}>
          <h5>Shipping Address</h5>
          <div className={FormStyles.inputGroup}>
            <label className="dark l2" htmlFor="shipping_address">
              Select Shipping Address
            </label>
            <select
              className={`b2 ${errors.shipping_address ? FormStyles.inputError : ""}`}
              id="shipping_address"
              value={selectedShippingAddress}
              onChange={(e) => setSelectedShippingAddress(e.target.value)}
              disabled={isLoading || showNewShippingForm}
            >
              <option value="">Select an address</option>
              {shippingAddresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}
                </option>
              ))}
            </select>
            {errors.shipping_address && (
              <span className={FormStyles.errorText}>{errors.shipping_address}</span>
            )}
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowNewShippingForm(!showNewShippingForm)}
            disabled={isLoading}
          >
            {showNewShippingForm ? "Cancel" : "Add New Shipping Address"}
          </button>
          {showNewShippingForm && (
            <div className={FormStyles.formSection}>
              {addressFields.map((field) => (
                <div className={FormStyles.inputGroup} key={field.name}>
                  <label className="dark l2" htmlFor={`shipping_${field.name}`}>
                    {field.label}
                  </label>
                  <div className={FormStyles.inputWrapper}>
                    <span className={FormStyles.inputIcon}>{field.icon}</span>
                    <input
                      className={`b2 ${errors[`shipping_${field.name}`] ? FormStyles.inputError : ""}`}
                      type={field.type}
                      id={`shipping_${field.name}`}
                      value={newShippingAddress[field.name] || ""}
                      onChange={(e) => setNewShippingAddress({ ...newShippingAddress, [field.name]: e.target.value })}
                      disabled={isLoading || field.disabled}
                    />
                  </div>
                  {errors[`shipping_${field.name}`] && (
                    <span className={FormStyles.errorText}>{errors[`shipping_${field.name}`]}</span>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="primary-btn"
                onClick={() => handleCreateAddress('shipping')}
                disabled={isLoading}
              >
                Save Shipping Address
              </button>
            </div>
          )}
        </div>

        <div className={FormStyles.formSection}>
          <h5>Billing Address</h5>
          <div className={FormStyles.inputGroup}>
            <label className="dark l2" htmlFor="billing_address">
              Select Billing Address
            </label>
            <select
              className={`b2 ${errors.billing_address ? FormStyles.inputError : ""}`}
              id="billing_address"
              value={selectedBillingAddress}
              onChange={(e) => setSelectedBillingAddress(e.target.value)}
              disabled={isLoading || showNewBillingForm}
            >
              <option value="">Select an address</option>
              {billingAddresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}
                </option>
              ))}
            </select>
            {errors.billing_address && (
              <span className={FormStyles.errorText}>{errors.billing_address}</span>
            )}
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowNewBillingForm(!showNewBillingForm)}
            disabled={isLoading}
          >
            {showNewBillingForm ? "Cancel" : "Add New Billing Address"}
          </button>
          {showNewBillingForm && (
            <div className={FormStyles.formSection}>
              {addressFields.map((field) => (
                <div className={FormStyles.inputGroup} key={field.name}>
                  <label className="dark l2" htmlFor={`billing_${field.name}`}>
                    {field.label}
                  </label>
                  <div className={FormStyles.inputWrapper}>
                    <span className={FormStyles.inputIcon}>{field.icon}</span>
                    <input
                      className={`b2 ${errors[`billing_${field.name}`] ? FormStyles.inputError : ""}`}
                      type={field.type}
                      id={`billing_${field.name}`}
                      value={newBillingAddress[field.name] || ""}
                      onChange={(e) => setNewBillingAddress({ ...newBillingAddress, [field.name]: e.target.value })}
                      disabled={isLoading || field.disabled}
                    />
                  </div>
                  {errors[`billing_${field.name}`] && (
                    <span className={FormStyles.errorText}>{errors[`billing_${field.name}`]}</span>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="primary-btn"
                onClick={() => handleCreateAddress('billing')}
                disabled={isLoading}
              >
                Save Billing Address
              </button>
            </div>
          )}
        </div>

        <div className={FormStyles.formSection}>
          <h5>Payment Details</h5>
          <div className={FormStyles.inputGroup}>
            <label className="dark l2" htmlFor="payment_method">
              Payment Method
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}><CreditCard /></span>
              <select
                className={`b2 ${errors.payment_method ? FormStyles.inputError : ""}`}
                id="payment_method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select a payment method</option>
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.payment_method && (
              <span className={FormStyles.errorText}>{errors.payment_method}</span>
            )}
          </div>
          <div className={FormStyles.inputGroup}>
            <label className="dark l2" htmlFor="shipping_cost">
              Shipping Cost (€)
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}><MapPin /></span>
              <input
                className={`b2 ${errors.shipping_cost ? FormStyles.inputError : ""}`}
                type="number"
                id="shipping_cost"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            {errors.shipping_cost && (
              <span className={FormStyles.errorText}>{errors.shipping_cost}</span>
            )}
          </div>
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