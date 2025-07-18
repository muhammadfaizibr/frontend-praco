import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import FormStyles from "assets/css/FormStyles.module.css";
import CheckoutFormStyles from "assets/css/CheckoutFormStyles.module.css";
import { Building2, MapPin, MapPinCheck, Home, CreditCard, User, Phone, Trash2 } from "lucide-react";
import { createOrder, getOrCreateCart, getCartItems, getShippingAddresses, getBillingAddresses, createShippingAddress, createBillingAddress, deleteShippingAddress, deleteBillingAddress } from "utils/api/ecommerce";
import { setCartItems } from "utils/cartSlice";

const CheckoutForm = () => {
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [billingAddresses, setBillingAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState("");
  const [selectedBillingAddress, setSelectedBillingAddress] = useState("");
  const [newShippingAddress, setNewShippingAddress] = useState({
    first_name: "",
    last_name: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United Kingdom",
    telephone_number: "",
  });
  const [newBillingAddress, setNewBillingAddress] = useState({
    first_name: "",
    last_name: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "United Kingdom",
    telephone_number: "",
  });
  const [showNewShippingForm, setShowNewShippingForm] = useState(false);
  const [showNewBillingForm, setShowNewBillingForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("manual_payment");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortController = new AbortController();
  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const paymentMethodOptions = [
    { value: "manual_payment", label: "Direct Payment" }
  ];

  const validateAddresses = (addresses) => {
    return (addresses || []).filter((addr) =>
      addr &&
      typeof addr === 'object' &&
      addr.id &&
      addr.first_name &&
      addr.last_name &&
      addr.street &&
      addr.city &&
      addr.postal_code &&
      addr.country &&
      addr.telephone_number
    );
  };

  const validateAddress = (address, type) => {
    const errors = {};
    if (!address.first_name) errors[`${type}_first_name`] = "First name is required.";
    if (!address.last_name) errors[`${type}_last_name`] = "Last name is required.";
    if (!address.street) errors[`${type}_street`] = "Street is required.";
    if (!address.city) errors[`${type}_city`] = "City is required.";
    if (!address.postal_code) errors[`${type}_postal_code`] = "Postal code is required.";
    if (!address.telephone_number) errors[`${type}_telephone_number`] = "Telephone number is required.";
    if (address.telephone_number && !/^\+?\d{10,14}$/.test(address.telephone_number)) {
      errors[`${type}_telephone_number`] = "Invalid telephone number format.";
    }
    return errors;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const cart = await getOrCreateCart();
        const cartId = cart.id;
        const cartItemsResponse = await getCartItems(cartId);
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

        const shippingAddressesResponse = await getShippingAddresses();
        const billingAddressesResponse = await getBillingAddresses();
        const validShippingAddresses = validateAddresses(shippingAddressesResponse);
        const validBillingAddresses = validateAddresses(billingAddressesResponse);
        setShippingAddresses(validShippingAddresses);
        setBillingAddresses(validBillingAddresses);
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
      const timer = setTimeout(() => {
        setSuccessMessage("");
        navigate("/track-order");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedShippingAddress && !showNewShippingForm) {
      newErrors.shipping_address = "Please select or create a shipping address.";
    }
    if (!selectedBillingAddress && !showNewBillingForm) {
      newErrors.billing_address = "Please select or create a billing address.";
    }
    if (showNewShippingForm) {
      Object.assign(newErrors, validateAddress(newShippingAddress, "shipping"));
    }
    if (showNewBillingForm) {
      Object.assign(newErrors, validateAddress(newBillingAddress, "billing"));
    }
    if (!paymentMethod) {
      newErrors.payment_method = "Payment method is required.";
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
    setApiError("");
    const addressData = type === 'shipping' ? newShippingAddress : newBillingAddress;
    const addressErrors = validateAddress(addressData, type);
    
    if (Object.keys(addressErrors).length > 0) {
      setErrors(addressErrors);
      setApiError(`Please correct the errors in the ${type} address form.`);
      return;
    }

    const createFn = type === 'shipping' ? createShippingAddress : createBillingAddress;
    const response = await createFn(addressData, { signal: abortController.signal });
    
    if (type === 'shipping') {
      setShippingAddresses([...shippingAddresses, response]);
      setSelectedShippingAddress(response.id);
      setNewShippingAddress({
        first_name: "",
        last_name: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "United Kingdom",
        telephone_number: "",
      });
      setShowNewShippingForm(false);
    } else {
      setBillingAddresses([...billingAddresses, response]);
      setSelectedBillingAddress(response.id);
      setNewBillingAddress({
        first_name: "",
        last_name: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "United Kingdom",
        telephone_number: "",
      });
      setShowNewBillingForm(false);
    }
  } catch (error) {
    console.error(`Error creating ${type} address:`, error);
    if (error.errors) {
      const formattedErrors = {};
      Object.entries(error.errors).forEach(([key, messages]) => {
        // Handle both array and single message formats
        const message = Array.isArray(messages) ? messages[0] : messages;
        formattedErrors[`${type}_${key}`] = message;
      });
      setErrors(formattedErrors);
      setApiError(`Please correct the errors in the ${type} address form.`);
    } else {
      setApiError(error.message || `Failed to create ${type} address. Please check the form.`);
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleDeleteAddress = async (type, addressId) => {
    try {
      setIsLoading(true);
      const deleteFn = type === 'shipping' ? deleteShippingAddress : deleteBillingAddress;
      await deleteFn(addressId, { signal: abortController.signal });
      if (type === 'shipping') {
        setShippingAddresses(shippingAddresses.filter((addr) => addr.id !== addressId));
        if (selectedShippingAddress === addressId) setSelectedShippingAddress("");
      } else {
        setBillingAddresses(billingAddresses.filter((addr) => addr.id !== addressId));
        if (selectedBillingAddress === addressId) setSelectedBillingAddress("");
      }
    } catch (error) {
      console.error(`Error deleting ${type} address:`, error);
      setApiError(error.message || `Failed to delete ${type} address. Please try again.`);
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
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "United Kingdom",
          telephone_number: "",
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
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "United Kingdom",
          telephone_number: "",
        });
        setShowNewBillingForm(false);
      }

      const orderData = {
        shipping_address: parseInt(shippingAddressId),
        billing_address: parseInt(billingAddressId),
        shipping_cost: 0.00,
        vat: 20.00,
        discount: 0.00,
        status: "PENDING",
        payment_status: "PENDING",
        payment_method: paymentMethod,
      };

      await createOrder(orderData, { signal: abortController.signal });

      dispatch(setCartItems([]));
      setSuccessMessage("Order placed successfully! Redirecting to order tracking...");
      setSelectedShippingAddress("");
      setSelectedBillingAddress("");
      setPaymentMethod("manual_payment");
      setErrors({});
    } catch (error) {
      console.error("Checkout error:", error);
      if (error.errors) {
        const formattedErrors = {};

        // Format error messages (handle both array and string responses)
        const formatErrorMessages = (messages) => {
          if (Array.isArray(messages)) {
            return messages[0]; // Take the first error message if it's an array
          }
          return messages;
        };

        // Handle shipping address errors
        if (showNewShippingForm) {
          Object.entries(error.errors).forEach(([key, messages]) => {
            if (key in newShippingAddress) {
              formattedErrors[`shipping_${key}`] = formatErrorMessages(messages);
            }
          });
        }

        // Handle billing address errors
        if (showNewBillingForm) {
          Object.entries(error.errors).forEach(([key, messages]) => {
            if (key in newBillingAddress) {
              formattedErrors[`billing_${key}`] = formatErrorMessages(messages);
            }
          });
        }

        // Handle general order errors
        if (!showNewShippingForm && !showNewBillingForm) {
          Object.entries(error.errors).forEach(([key, messages]) => {
            if (key === 'shipping_address' || key === 'billing_address' || key === 'payment_method' || key === 'cart') {
              formattedErrors[key] = formatErrorMessages(messages);
            }
          });
        }

        setErrors(formattedErrors);
      } else {
        setApiError(error.message || "Failed to place order. Please check the form.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addressFields = [
    { label: "First Name", name: "first_name", type: "text", icon: <User /> },
    { label: "Last Name", name: "last_name", type: "text", icon: <User /> },
    { label: "Street", name: "street", type: "text", icon: <MapPinCheck /> },
    { label: "City", name: "city", type: "text", icon: <Building2 /> },
    { label: "State", name: "state", type: "text", icon: <Home /> },
    { label: "Postal Code", name: "postal_code", type: "text", icon: <Building2 /> },
    { label: "Telephone Number", name: "telephone_number", type: "tel", icon: <Phone /> },
    { label: "Country", name: "country", type: "text", icon: <MapPin />, disabled: true },
  ];

  return (
    <div className={CheckoutFormStyles.container}>
      <form className={CheckoutFormStyles.container} onSubmit={handleCheckout}>
        <h4 className={FormStyles.title}>
          Place your <span className={FormStyles.accent}>Order</span>
        </h4>

        {apiError && <div className={FormStyles.errorMessage}>{apiError}</div>}
        {successMessage && <div className={FormStyles.successMessage}>{successMessage}</div>}

        <div className={FormStyles.formSection}>
          <h5 className={FormStyles.sectionTitle}>Shipping Address</h5>
          <div className={FormStyles.inputGroup}>
            <label className={FormStyles.label} htmlFor="shipping_address">
              Select Shipping Address
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
              <select
                className={`${FormStyles.input} ${errors.shipping_address ? FormStyles.inputError : ""}`}
                id="shipping_address"
                value={selectedShippingAddress}
                onChange={(e) => setSelectedShippingAddress(e.target.value)}
                disabled={isLoading || showNewShippingForm}
              >
                <option value="">Select an address</option>
                {shippingAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
                  </option>
                ))}
              </select>
            </div>
            {errors.shipping_address && <span className={FormStyles.errorText}>{errors.shipping_address}</span>}
            {shippingAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                className='secodary-btn'
                onClick={() => handleDeleteAddress('shipping', addr.id)}
                disabled={isLoading}
                data-loading={isLoading}
              >
                <Trash2 size={16} /> Delete {addr.first_name}'s Address
              </button>
            ))}
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowNewShippingForm(!showNewShippingForm)}
            disabled={isLoading}
            data-loading={isLoading}
          >
            {showNewShippingForm ? "Cancel" : "Add New Shipping Address"}
          </button>
          {showNewShippingForm && (
            <div className={FormStyles.formSection}>
              {addressFields.map((field) => (
                <div className={FormStyles.inputGroup} key={field.name}>
                  <label className={FormStyles.label} htmlFor={`shipping_${field.name}`}>
                    {field.label}
                  </label>
                  <div className={FormStyles.inputWrapper}>
                    <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
                    <input
                      className={`${FormStyles.input} ${errors[`shipping_${field.name}`] ? FormStyles.inputError : ""}`}
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
                className={'primary-btn'}
                onClick={() => handleCreateAddress('shipping')}
                disabled={isLoading}
                data-loading={isLoading}
              >
                Save Shipping Address
              </button>
            </div>
          )}
        </div>

        <div className={FormStyles.formSection}>
          <h5 className={FormStyles.sectionTitle}>Billing Address</h5>
          <div className={FormStyles.inputGroup}>
            <label className={FormStyles.label} htmlFor="billing_address">
              Select Billing Address
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
              <select
                className={`${FormStyles.input} ${errors.billing_address ? FormStyles.inputError : ""}`}
                id="billing_address"
                value={selectedBillingAddress}
                onChange={(e) => setSelectedBillingAddress(e.target.value)}
                disabled={isLoading || showNewBillingForm}
              >
                <option value="">Select an address</option>
                {billingAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
                  </option>
                ))}
              </select>
            </div>
            {errors.billing_address && <span className={FormStyles.errorText}>{errors.billing_address}</span>}
            {billingAddresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                className='secodary-btn'
                onClick={() => handleDeleteAddress('billing', addr.id)}
                disabled={isLoading}
                data-loading={isLoading}
              >
                <Trash2 size={16} /> Delete {addr.first_name}'s Address
              </button>
            ))}
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowNewBillingForm(!showNewBillingForm)}
            disabled={isLoading}
            data-loading={isLoading}
          >
            {showNewBillingForm ? "Cancel" : "Add New Billing Address"}
          </button>
          {showNewBillingForm && (
            <div className={FormStyles.formSection}>
              {addressFields.map((field) => (
                <div className={FormStyles.inputGroup} key={field.name}>
                  <label className={FormStyles.label} htmlFor={`billing_${field.name}`}>
                    {field.label}
                  </label>
                  <div className={FormStyles.inputWrapper}>
                    <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
                    <input
                      className={`${FormStyles.input} ${errors[`billing_${field.name}`] ? FormStyles.inputError : ""}`}
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
                className={'primary-btn'}
                onClick={() => handleCreateAddress('billing')}
                disabled={isLoading}
                data-loading={isLoading}
              >
                Save Billing Address
              </button>
            </div>
          )}
        </div>

        <div className={FormStyles.formSection}>
          <h5 className={FormStyles.sectionTitle}>Payment Details</h5>
          <div className={FormStyles.inputGroup}>
            <label className={FormStyles.label} htmlFor="payment_method">
              Payment Method
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}><CreditCard size={20} /></span>
              <select
                className={`${FormStyles.input} ${errors.payment_method ? FormStyles.inputError : ""}`}
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
            {errors.payment_method && <span className={FormStyles.errorText}>{errors.payment_method}</span>}
          </div>
        </div>

        <div className={FormStyles.formSection}>
          <div className={FormStyles.inputGroup}>
            <h5 className={FormStyles.sectionTitle}>Cart Items</h5>
            {cartItems.length > 0 ? (
              <ul className={FormStyles.cartList}>
                {cartItems.map((item) => (
                  <li key={item.id} className={FormStyles.cartItem}>
                    {item.description} - {item.packs} pack{item.packs > 1 ? "s" : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={FormStyles.emptyCart}>No items in cart.</p>
            )}
            {errors.cart && <span className={FormStyles.errorText}>{errors.cart}</span>}
          </div>
        </div>
        <button
          className={`primary-btn full-width text-giant ${isLoading ? FormStyles.loading : ""}`}
          type="submit"
          disabled={isLoading}
          data-loading={isLoading}
        >
          {isLoading ? "Processing..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

export default CheckoutForm;