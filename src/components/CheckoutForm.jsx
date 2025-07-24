// // import React, { useEffect, useState } from "react";
// // import { useSelector, useDispatch } from "react-redux";
// // import { useNavigate } from "react-router-dom";
// // import FormStyles from "assets/css/FormStyles.module.css";
// // import CheckoutFormStyles from "assets/css/CheckoutFormStyles.module.css";
// // import { Building2, MapPin, MapPinCheck, Home, CreditCard, User, Phone, Trash2 } from "lucide-react";
// // import { createOrder, getOrCreateCart, getCartItems, getAddresses, getAddresses, createAddress, createAddress, deleteAddress, deleteAddress } from "utils/api/ecommerce";
// // import { setCartItems } from "utils/cartSlice";

// // const CheckoutForm = () => {
// //   const [shippingAddresses, setShippingAddresses] = useState([]);
// //   const [billingAddresses, setBillingAddresses] = useState([]);
// //   const [selectedShippingAddress, setSelectedShippingAddress] = useState("");
// //   const [selectedBillingAddress, setSelectedBillingAddress] = useState("");
// //   const [newShippingAddress, setNewShippingAddress] = useState({
// //     first_name: "",
// //     last_name: "",
// //     street: "",
// //     city: "",
// //     state: "",
// //     postal_code: "",
// //     country: "UK",
// //     telephone_number: "",
// //   });
// //   const [newBillingAddress, setNewBillingAddress] = useState({
// //     first_name: "",
// //     last_name: "",
// //     street: "",
// //     city: "",
// //     state: "",
// //     postal_code: "",
// //     country: "UK",
// //     telephone_number: "",
// //   });
// //   const [showNewShippingForm, setShowNewShippingForm] = useState(false);
// //   const [showNewBillingForm, setShowNewBillingForm] = useState(false);
// //   const [paymentMethod, setPaymentMethod] = useState("manual_payment");
// //   const [errors, setErrors] = useState({});
// //   const [apiError, setApiError] = useState("");
// //   const [successMessage, setSuccessMessage] = useState("");
// //   const [isLoading, setIsLoading] = useState(false);
// //   const abortController = new AbortController();
// //   const navigate = useNavigate();

// //   const cartItems = useSelector((state) => state.cart.items);
// //   const dispatch = useDispatch();

// //   const paymentMethodOptions = [
// //     { value: "manual_payment", label: "Direct Payment" }
// //   ];

// //   const validateAddresses = (addresses) => {
// //     return (addresses || []).filter((addr) =>
// //       addr &&
// //       typeof addr === 'object' &&
// //       addr.id &&
// //       addr.first_name &&
// //       addr.last_name &&
// //       addr.street &&
// //       addr.city &&
// //       addr.postal_code &&
// //       addr.country &&
// //       addr.telephone_number
// //     );
// //   };

// //   const validateAddress = (address, type) => {
// //     const errors = {};
// //     if (!address.first_name) errors[`${type}_first_name`] = "First name is required.";
// //     if (!address.last_name) errors[`${type}_last_name`] = "Last name is required.";
// //     if (!address.street) errors[`${type}_street`] = "Street is required.";
// //     if (!address.city) errors[`${type}_city`] = "City is required.";
// //     if (!address.postal_code) errors[`${type}_postal_code`] = "Postal code is required.";
// //     if (!address.telephone_number) errors[`${type}_telephone_number`] = "Telephone number is required.";
// //     if (address.telephone_number && !/^\+?\d{10,14}$/.test(address.telephone_number)) {
// //       errors[`${type}_telephone_number`] = "Invalid telephone number format.";
// //     }
// //     return errors;
// //   };

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         setIsLoading(true);
// //         const cart = await getOrCreateCart();
// //         const cartId = cart.id;
// //         const cartItemsResponse = await getCartItems(cartId);
// //         const mappedItems = (cartItemsResponse.results || []).map((item) => ({
// //           id: item.id.toString(),
// //           description: item.item.title || item.item.product_variant?.name || `Item ${item.item.id}`,
// //           packs: item.pack_quantity,
// //           units: item.pack_quantity * (item.item.product_variant?.units_per_pack || 1),
// //           subtotal: parseFloat(item.subtotal) || 0,
// //           total: parseFloat(item.total) || 0,
// //           displayPriceType: item.unit_type,
// //           variantId: item.item.product_variant?.id?.toString() || "unknown",
// //           image: item.item.images?.[0]?.image || "",
// //           sku: item.item.sku || `SKU-${item.item.id}`,
// //           perPackPrice: parseFloat(item.price_per_pack) || 0,
// //           pricingTierId: item.pricing_tier.id,
// //           weight: parseFloat(item.weight) || 0,
// //           itemId: item.item.id,
// //         }));
// //         dispatch(setCartItems(mappedItems));

// //         const shippingAddressesResponse = await getAddresses();
// //         const billingAddressesResponse = await getAddresses();
// //         const validShippingAddresses = validateAddresses(shippingAddressesResponse);
// //         const validBillingAddresses = validateAddresses(billingAddressesResponse);
// //         setShippingAddresses(validShippingAddresses);
// //         setBillingAddresses(validBillingAddresses);
// //       } catch (error) {
// //         console.error("Error fetching data:", error);
// //         setApiError(error.message || "Failed to load checkout data. Please try again or contact support.");
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };
// //     fetchData();

// //     return () => {
// //       abortController.abort();
// //     };
// //   }, [dispatch]);

// //   useEffect(() => {
// //     if (successMessage) {
// //       const timer = setTimeout(() => {
// //         setSuccessMessage("");
// //         navigate("/track-order");
// //       }, 2000);
// //       return () => clearTimeout(timer);
// //     }
// //   }, [successMessage, navigate]);

// //   const validateForm = () => {
// //     const newErrors = {};
// //     if (!selectedShippingAddress && !showNewShippingForm) {
// //       newErrors.shipping_address = "Please select or create a shipping address.";
// //     }
// //     if (!selectedBillingAddress && !showNewBillingForm) {
// //       newErrors.billing_address = "Please select or create a billing address.";
// //     }
// //     if (showNewShippingForm) {
// //       Object.assign(newErrors, validateAddress(newShippingAddress, "shipping"));
// //     }
// //     if (showNewBillingForm) {
// //       Object.assign(newErrors, validateAddress(newBillingAddress, "billing"));
// //     }
// //     if (!paymentMethod) {
// //       newErrors.payment_method = "Payment method is required.";
// //     }
// //     if (!cartItems.length) {
// //       newErrors.cart = "Cart is empty. Add items to proceed.";
// //     }
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleCreateAddress = async (type) => {
// //   try {
// //     setIsLoading(true);
// //     setErrors({});
// //     setApiError("");
// //     const addressData = type === 'shipping' ? newShippingAddress : newBillingAddress;
// //     const addressErrors = validateAddress(addressData, type);
    
// //     if (Object.keys(addressErrors).length > 0) {
// //       setErrors(addressErrors);
// //       setApiError(`Please correct the errors in the ${type} address form.`);
// //       return;
// //     }

// //     const createFn = type === 'shipping' ? createAddress : createAddress;
// //     const response = await createFn(addressData, { signal: abortController.signal });
    
// //     if (type === 'shipping') {
// //       setShippingAddresses([...shippingAddresses, response]);
// //       setSelectedShippingAddress(response.id);
// //       setNewShippingAddress({
// //         first_name: "",
// //         last_name: "",
// //         street: "",
// //         city: "",
// //         state: "",
// //         postal_code: "",
// //         country: "UK",
// //         telephone_number: "",
// //       });
// //       setShowNewShippingForm(false);
// //     } else {
// //       setBillingAddresses([...billingAddresses, response]);
// //       setSelectedBillingAddress(response.id);
// //       setNewBillingAddress({
// //         first_name: "",
// //         last_name: "",
// //         street: "",
// //         city: "",
// //         state: "",
// //         postal_code: "",
// //         country: "UK",
// //         telephone_number: "",
// //       });
// //       setShowNewBillingForm(false);
// //     }
// //   } catch (error) {
// //     console.error(`Error creating ${type} address:`, error);
// //     if (error.errors) {
// //       const formattedErrors = {};
// //       Object.entries(error.errors).forEach(([key, messages]) => {
// //         // Handle both array and single message formats
// //         const message = Array.isArray(messages) ? messages[0] : messages;
// //         formattedErrors[`${type}_${key}`] = message;
// //       });
// //       setErrors(formattedErrors);
// //       setApiError(`Please correct the errors in the ${type} address form.`);
// //     } else {
// //       setApiError(error.message || `Failed to create ${type} address. Please check the form.`);
// //     }
// //   } finally {
// //     setIsLoading(false);
// //   }
// // };

// //   const handleDeleteAddress = async (type, addressId) => {
// //     try {
// //       setIsLoading(true);
// //       const deleteFn = type === 'shipping' ? deleteAddress : deleteAddress;
// //       await deleteFn(addressId, { signal: abortController.signal });
// //       if (type === 'shipping') {
// //         setShippingAddresses(shippingAddresses.filter((addr) => addr.id !== addressId));
// //         if (selectedShippingAddress === addressId) setSelectedShippingAddress("");
// //       } else {
// //         setBillingAddresses(billingAddresses.filter((addr) => addr.id !== addressId));
// //         if (selectedBillingAddress === addressId) setSelectedBillingAddress("");
// //       }
// //     } catch (error) {
// //       console.error(`Error deleting ${type} address:`, error);
// //       setApiError(error.message || `Failed to delete ${type} address. Please try again.`);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleCheckout = async (e) => {
// //     e.preventDefault();
// //     setApiError("");
// //     setSuccessMessage("");
// //     setErrors({});

// //     if (!validateForm()) return;

// //     setIsLoading(true);
// //     try {
// //       let shippingAddressId = selectedShippingAddress;
// //       let billingAddressId = selectedBillingAddress;

// //       if (showNewShippingForm) {
// //         const response = await createAddress(newShippingAddress, { signal: abortController.signal });
// //         shippingAddressId = response.id;
// //         setShippingAddresses([...shippingAddresses, response]);
// //         setNewShippingAddress({
// //           first_name: "",
// //           last_name: "",
// //           street: "",
// //           city: "",
// //           state: "",
// //           postal_code: "",
// //           country: "UK",
// //           telephone_number: "",
// //         });
// //         setShowNewShippingForm(false);
// //       }

// //       if (showNewBillingForm) {
// //         const response = await createAddress(newBillingAddress, { signal: abortController.signal });
// //         billingAddressId = response.id;
// //         setBillingAddresses([...billingAddresses, response]);
// //         setNewBillingAddress({
// //           first_name: "",
// //           last_name: "",
// //           street: "",
// //           city: "",
// //           state: "",
// //           postal_code: "",
// //           country: "UK",
// //           telephone_number: "",
// //         });
// //         setShowNewBillingForm(false);
// //       }

// //       const orderData = {
// //         shipping_address: parseInt(shippingAddressId),
// //         billing_address: parseInt(billingAddressId),
// //         shipping_cost: 0.00,
// //         vat: 20.00,
// //         discount: 0.00,
// //         status: "PENDING",
// //         payment_status: "PENDING",
// //         payment_method: paymentMethod,
// //       };

// //       await createOrder(orderData, { signal: abortController.signal });

// //       dispatch(setCartItems([]));
// //       setSuccessMessage("Order placed successfully! Redirecting to order tracking...");
// //       setSelectedShippingAddress("");
// //       setSelectedBillingAddress("");
// //       setPaymentMethod("manual_payment");
// //       setErrors({});
// //     } catch (error) {
// //       console.error("Checkout error:", error);
// //       if (error.errors) {
// //         const formattedErrors = {};

// //         // Format error messages (handle both array and string responses)
// //         const formatErrorMessages = (messages) => {
// //           if (Array.isArray(messages)) {
// //             return messages[0]; // Take the first error message if it's an array
// //           }
// //           return messages;
// //         };

// //         // Handle shipping address errors
// //         if (showNewShippingForm) {
// //           Object.entries(error.errors).forEach(([key, messages]) => {
// //             if (key in newShippingAddress) {
// //               formattedErrors[`shipping_${key}`] = formatErrorMessages(messages);
// //             }
// //           });
// //         }

// //         // Handle billing address errors
// //         if (showNewBillingForm) {
// //           Object.entries(error.errors).forEach(([key, messages]) => {
// //             if (key in newBillingAddress) {
// //               formattedErrors[`billing_${key}`] = formatErrorMessages(messages);
// //             }
// //           });
// //         }

// //         // Handle general order errors
// //         if (!showNewShippingForm && !showNewBillingForm) {
// //           Object.entries(error.errors).forEach(([key, messages]) => {
// //             if (key === 'shipping_address' || key === 'billing_address' || key === 'payment_method' || key === 'cart') {
// //               formattedErrors[key] = formatErrorMessages(messages);
// //             }
// //           });
// //         }

// //         setErrors(formattedErrors);
// //       } else {
// //         setApiError(error.message || "Failed to place order. Please check the form.");
// //       }
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const addressFields = [
// //     { label: "First Name", name: "first_name", type: "text", icon: <User /> },
// //     { label: "Last Name", name: "last_name", type: "text", icon: <User /> },
// //     { label: "Street", name: "street", type: "text", icon: <MapPinCheck /> },
// //     { label: "City", name: "city", type: "text", icon: <Building2 /> },
// //     { label: "State", name: "state", type: "text", icon: <Home /> },
// //     { label: "Postal Code", name: "postal_code", type: "text", icon: <Building2 /> },
// //     { label: "Telephone Number", name: "telephone_number", type: "tel", icon: <Phone /> },
// //     { label: "Country", name: "country", type: "text", icon: <MapPin />, disabled: true },
// //   ];

// //   return (
// //     <div className={CheckoutFormStyles.container}>
// //       <form className={CheckoutFormStyles.container} onSubmit={handleCheckout}>
// //         <h4 className={FormStyles.title}>
// //           Place your <span className={FormStyles.accent}>Order</span>
// //         </h4>

// //         {apiError && <div className={FormStyles.errorMessage}>{apiError}</div>}
// //         {successMessage && <div className={FormStyles.successMessage}>{successMessage}</div>}

// //         <div className={FormStyles.formSection}>
// //           <h5 className={FormStyles.sectionTitle}>Shipping Address</h5>
// //           <div className={FormStyles.inputGroup}>
// //             <label className={FormStyles.label} htmlFor="shipping_address">
// //               Select Shipping Address
// //             </label>
// //             <div className={FormStyles.inputWrapper}>
// //               <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
// //               <select
// //                 className={`${FormStyles.input} ${errors.shipping_address ? FormStyles.inputError : ""}`}
// //                 id="shipping_address"
// //                 value={selectedShippingAddress}
// //                 onChange={(e) => setSelectedShippingAddress(e.target.value)}
// //                 disabled={isLoading || showNewShippingForm}
// //               >
// //                 <option value="">Select an address</option>
// //                 {shippingAddresses.map((addr) => (
// //                   <option key={addr.id} value={addr.id}>
// //                     {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             {errors.shipping_address && <span className={FormStyles.errorText}>{errors.shipping_address}</span>}
// //             {shippingAddresses.map((addr) => (
// //               <button
// //                 key={addr.id}
// //                 type="button"
// //                 className='secodary-btn'
// //                 onClick={() => handleDeleteAddress('shipping', addr.id)}
// //                 disabled={isLoading}
// //                 data-loading={isLoading}
// //               >
// //                 <Trash2 size={16} /> Delete {addr.first_name}'s Address
// //               </button>
// //             ))}
// //           </div>
// //           <button
// //             type="button"
// //             className="secondary-btn"
// //             onClick={() => setShowNewShippingForm(!showNewShippingForm)}
// //             disabled={isLoading}
// //             data-loading={isLoading}
// //           >
// //             {showNewShippingForm ? "Cancel" : "Add New Shipping Address"}
// //           </button>
// //           {showNewShippingForm && (
// //             <div className={FormStyles.formSection}>
// //               {addressFields.map((field) => (
// //                 <div className={FormStyles.inputGroup} key={field.name}>
// //                   <label className={FormStyles.label} htmlFor={`shipping_${field.name}`}>
// //                     {field.label}
// //                   </label>
// //                   <div className={FormStyles.inputWrapper}>
// //                     <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
// //                     <input
// //                       className={`${FormStyles.input} ${errors[`shipping_${field.name}`] ? FormStyles.inputError : ""}`}
// //                       type={field.type}
// //                       id={`shipping_${field.name}`}
// //                       value={newShippingAddress[field.name] || ""}
// //                       onChange={(e) => setNewShippingAddress({ ...newShippingAddress, [field.name]: e.target.value })}
// //                       disabled={isLoading || field.disabled}
// //                     />
// //                   </div>
// //                   {errors[`shipping_${field.name}`] && (
// //                     <span className={FormStyles.errorText}>{errors[`shipping_${field.name}`]}</span>
// //                   )}
// //                 </div>
// //               ))}
// //               <button
// //                 type="button"
// //                 className={'primary-btn'}
// //                 onClick={() => handleCreateAddress('shipping')}
// //                 disabled={isLoading}
// //                 data-loading={isLoading}
// //               >
// //                 Save Shipping Address
// //               </button>
// //             </div>
// //           )}
// //         </div>

// //         <div className={FormStyles.formSection}>
// //           <h5 className={FormStyles.sectionTitle}>Billing Address</h5>
// //           <div className={FormStyles.inputGroup}>
// //             <label className={FormStyles.label} htmlFor="billing_address">
// //               Select Billing Address
// //             </label>
// //             <div className={FormStyles.inputWrapper}>
// //               <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
// //               <select
// //                 className={`${FormStyles.input} ${errors.billing_address ? FormStyles.inputError : ""}`}
// //                 id="billing_address"
// //                 value={selectedBillingAddress}
// //                 onChange={(e) => setSelectedBillingAddress(e.target.value)}
// //                 disabled={isLoading || showNewBillingForm}
// //               >
// //                 <option value="">Select an address</option>
// //                 {billingAddresses.map((addr) => (
// //                   <option key={addr.id} value={addr.id}>
// //                     {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             {errors.billing_address && <span className={FormStyles.errorText}>{errors.billing_address}</span>}
// //             {billingAddresses.map((addr) => (
// //               <button
// //                 key={addr.id}
// //                 type="button"
// //                 className='secodary-btn'
// //                 onClick={() => handleDeleteAddress('billing', addr.id)}
// //                 disabled={isLoading}
// //                 data-loading={isLoading}
// //               >
// //                 <Trash2 size={16} /> Delete {addr.first_name}'s Address
// //               </button>
// //             ))}
// //           </div>
// //           <button
// //             type="button"
// //             className="secondary-btn"
// //             onClick={() => setShowNewBillingForm(!showNewBillingForm)}
// //             disabled={isLoading}
// //             data-loading={isLoading}
// //           >
// //             {showNewBillingForm ? "Cancel" : "Add New Billing Address"}
// //           </button>
// //           {showNewBillingForm && (
// //             <div className={FormStyles.formSection}>
// //               {addressFields.map((field) => (
// //                 <div className={FormStyles.inputGroup} key={field.name}>
// //                   <label className={FormStyles.label} htmlFor={`billing_${field.name}`}>
// //                     {field.label}
// //                   </label>
// //                   <div className={FormStyles.inputWrapper}>
// //                     <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
// //                     <input
// //                       className={`${FormStyles.input} ${errors[`billing_${field.name}`] ? FormStyles.inputError : ""}`}
// //                       type={field.type}
// //                       id={`billing_${field.name}`}
// //                       value={newBillingAddress[field.name] || ""}
// //                       onChange={(e) => setNewBillingAddress({ ...newBillingAddress, [field.name]: e.target.value })}
// //                       disabled={isLoading || field.disabled}
// //                     />
// //                   </div>
// //                   {errors[`billing_${field.name}`] && (
// //                     <span className={FormStyles.errorText}>{errors[`billing_${field.name}`]}</span>
// //                   )}
// //                 </div>
// //               ))}
// //               <button
// //                 type="button"
// //                 className={'primary-btn'}
// //                 onClick={() => handleCreateAddress('billing')}
// //                 disabled={isLoading}
// //                 data-loading={isLoading}
// //               >
// //                 Save Billing Address
// //               </button>
// //             </div>
// //           )}
// //         </div>

// //         <div className={FormStyles.formSection}>
// //           <h5 className={FormStyles.sectionTitle}>Payment Details</h5>
// //           <div className={FormStyles.inputGroup}>
// //             <label className={FormStyles.label} htmlFor="payment_method">
// //               Payment Method
// //             </label>
// //             <div className={FormStyles.inputWrapper}>
// //               <span className={FormStyles.inputIcon}><CreditCard size={20} /></span>
// //               <select
// //                 className={`${FormStyles.input} ${errors.payment_method ? FormStyles.inputError : ""}`}
// //                 id="payment_method"
// //                 value={paymentMethod}
// //                 onChange={(e) => setPaymentMethod(e.target.value)}
// //                 disabled={isLoading}
// //               >
// //                 <option value="">Select a payment method</option>
// //                 {paymentMethodOptions.map((option) => (
// //                   <option key={option.value} value={option.value}>
// //                     {option.label}
// //                   </option>
// //                 ))}
// //               </select>
// //             </div>
// //             {errors.payment_method && <span className={FormStyles.errorText}>{errors.payment_method}</span>}
// //           </div>
// //         </div>

// //         <div className={FormStyles.formSection}>
// //           <div className={FormStyles.inputGroup}>
// //             <h5 className={FormStyles.sectionTitle}>Cart Items</h5>
// //             {cartItems.length > 0 ? (
// //               <ul className={FormStyles.cartList}>
// //                 {cartItems.map((item) => (
// //                   <li key={item.id} className={FormStyles.cartItem}>
// //                     {item.description} - {item.packs} pack{item.packs > 1 ? "s" : ""}
// //                   </li>
// //                 ))}
// //               </ul>
// //             ) : (
// //               <p className={FormStyles.emptyCart}>No items in cart.</p>
// //             )}
// //             {errors.cart && <span className={FormStyles.errorText}>{errors.cart}</span>}
// //           </div>
// //         </div>
// //         <button
// //           className={`primary-btn full-width text-giant ${isLoading ? FormStyles.loading : ""}`}
// //           type="submit"
// //           disabled={isLoading}
// //           data-loading={isLoading}
// //         >
// //           {isLoading ? "Processing..." : "Place Order"}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // };

// // export default CheckoutForm;

// import React, { useEffect, useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import FormStyles from "assets/css/FormStyles.module.css";
// import CheckoutFormStyles from "assets/css/CheckoutFormStyles.module.css";
// import { Building2, MapPin, MapPinCheck, Home, CreditCard, User, Phone, Trash2 } from "lucide-react";
// import { createOrder, getOrCreateCart, getCartItems, getAddresses, getAddresses, createAddress, createAddress, deleteAddress, deleteAddress, createPaymentIntent } from "utils/api/ecommerce";
// import { setCartItems } from "utils/cartSlice";

// // Initialize Stripe with your publishable key
// const stripePromise = loadStripe('pk_test_51Rmb17FLIql148kBi0QtS0w6yKQ8primnWFAKvkbdajWltdiyeX6FpnVpuz0sR1NxvRL2T6JYeGQ6r5KEKstzo4X00QefzX9b5');

// const CheckoutFormContent = () => {
//   const [shippingAddresses, setShippingAddresses] = useState([]);
//   const [billingAddresses, setBillingAddresses] = useState([]);
//   const [selectedShippingAddress, setSelectedShippingAddress] = useState("");
//   const [selectedBillingAddress, setSelectedBillingAddress] = useState("");
//   const [newShippingAddress, setNewShippingAddress] = useState({
//     first_name: "",
//     last_name: "",
//     street: "",
//     city: "",
//     state: "",
//     postal_code: "",
//     country: "UK",
//     telephone_number: "", // Ensure default is empty string
//   });
//   const [newBillingAddress, setNewBillingAddress] = useState({
//     first_name: "",
//     last_name: "",
//     street: "",
//     city: "",
//     state: "",
//     postal_code: "",
//     country: "UK",
//     telephone_number: "", // Ensure default is empty string
//   });
//   const [showNewShippingForm, setShowNewShippingForm] = useState(false);
//   const [showNewBillingForm, setShowNewBillingForm] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState("stripe");
//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [clientSecret, setClientSecret] = useState("");
//   const stripe = useStripe();
//   const elements = useElements();
//   const abortController = new AbortController();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const cartItems = useSelector((state) => state.cart.items);

//   const paymentMethodOptions = [
//     { value: "stripe", label: "Credit/Debit Card (Stripe)" },
//     { value: "manual_payment", label: "Direct Payment" },
//   ];

//   const validateAddresses = (addresses) => {
//     return (addresses || []).filter(
//       (addr) =>
//         addr &&
//         typeof addr === "object" &&
//         addr.id &&
//         addr.first_name &&
//         addr.last_name &&
//         addr.street &&
//         addr.city &&
//         addr.postal_code &&
//         addr.country &&
//         addr.telephone_number
//     );
//   };

//   const validateAddress = (address, type) => {
//     const errors = {};
//     if (!address.first_name) errors[`${type}_first_name`] = "First name is required.";
//     if (!address.last_name) errors[`${type}_last_name`] = "Last name is required.";
//     if (!address.street) errors[`${type}_street`] = "Street is required.";
//     if (!address.city) errors[`${type}_city`] = "City is required.";
//     if (!address.postal_code) errors[`${type}_postal_code`] = "Postal code is required.";
//     if (!address.telephone_number) errors[`${type}_telephone_number`] = "Telephone number is required.";
//     // Ensure telephone_number is a string before testing regex
//     if (address.telephone_number && !/^\+?\d{10,14}$/.test(String(address.telephone_number))) {
//       errors[`${type}_telephone_number`] = "Invalid telephone number format.";
//     }
//     return errors;
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const cart = await getOrCreateCart();
//         const cartId = cart.id;
//         const cartItemsResponse = await getCartItems(cartId);
//         const mappedItems = (cartItemsResponse.results || []).map((item) => ({
//           id: item.id.toString(),
//           description: item.item.title || item.item.product_variant?.name || `Item ${item.item.id}`,
//           packs: item.pack_quantity,
//           units: item.pack_quantity * (item.item.product_variant?.units_per_pack || 1),
//           subtotal: parseFloat(item.subtotal) || 0,
//           total: parseFloat(item.total) || 0,
//           displayPriceType: item.unit_type,
//           variantId: item.item.product_variant?.id?.toString() || "unknown",
//           image: item.item.images?.[0]?.image || "",
//           sku: item.item.sku || `SKU-${item.item.id}`,
//           perPackPrice: parseFloat(item.price_per_pack) || 0,
//           pricingTierId: item.pricing_tier.id,
//           weight: parseFloat(item.weight) || 0,
//           itemId: item.item.id,
//         }));
//         dispatch(setCartItems(mappedItems));

//         const shippingAddressesResponse = await getAddresses();
//         const billingAddressesResponse = await getAddresses();
//         const validShippingAddresses = validateAddresses(shippingAddressesResponse);
//         const validBillingAddresses = validateAddresses(billingAddressesResponse);
//         setShippingAddresses(validShippingAddresses);
//         setBillingAddresses(validBillingAddresses);

//         // Fetch client secret for Stripe PaymentIntent using apiClient
//         if (cartItems.length > 0) {
//           const response = await createPaymentIntent({ cart_id: cartId }, { signal: abortController.signal });
//           setClientSecret(response.client_secret);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         setApiError(error.message || "Failed to load checkout data.");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();

//     return () => {
//       abortController.abort();
//     };
//   }, [dispatch, cartItems.length]);

//   useEffect(() => {
//     if (successMessage) {
//       const timer = setTimeout(() => {
//         setSuccessMessage("");
//         navigate("/track-order");
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [successMessage, navigate]);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!selectedShippingAddress && !showNewShippingForm) {
//       newErrors.shipping_address = "Please select or create a shipping address.";
//     }
//     if (!selectedBillingAddress && !showNewBillingForm) {
//       newErrors.billing_address = "Please select or create a billing address.";
//     }
//     if (showNewShippingForm) {
//       Object.assign(newErrors, validateAddress(newShippingAddress, "shipping"));
//     }
//     if (showNewBillingForm) {
//       Object.assign(newErrors, validateAddress(newBillingAddress, "billing"));
//     }
//     if (!paymentMethod) {
//       newErrors.payment_method = "Payment method is required.";
//     }
//     if (!cartItems.length) {
//       newErrors.cart = "Cart is empty. Add items to proceed.";
//     }
//     if (paymentMethod === "stripe" && !clientSecret) {
//       newErrors.payment = "Payment initialization failed. Please try again.";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleCreateAddress = async (type) => {
//     try {
//       setIsLoading(true);
//       setErrors({});
//       setApiError("");
//       const addressData = type === "shipping" ? newShippingAddress : newBillingAddress;
//       const addressErrors = validateAddress(addressData, type);

//       if (Object.keys(addressErrors).length > 0) {
//         setErrors(addressErrors);
//         setApiError(`Please correct the errors in the ${type} address form.`);
//         return;
//       }

//       const createFn = type === "shipping" ? createAddress : createAddress;
//       const response = await createFn(addressData, { signal: abortController.signal });

//       if (type === "shipping") {
//         setShippingAddresses([...shippingAddresses, response]);
//         setSelectedShippingAddress(response.id);
//         setNewShippingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewShippingForm(false);
//       } else {
//         setBillingAddresses([...billingAddresses, response]);
//         setSelectedBillingAddress(response.id);
//         setNewBillingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewBillingForm(false);
//       }
//     } catch (error) {
//       console.error(`Error creating ${type} address:`, error);
//       if (error.errors) {
//         const formattedErrors = {};
//         Object.entries(error.errors).forEach(([key, messages]) => {
//           const message = Array.isArray(messages) ? messages[0] : messages;
//           formattedErrors[`${type}_${key}`] = message;
//         });
//         setErrors(formattedErrors);
//         setApiError(`Please correct the errors in the ${type} address form.`);
//       } else {
//         setApiError(error.message || `Failed to create ${type} address.`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteAddress = async (type, addressId) => {
//     try {
//       setIsLoading(true);
//       const deleteFn = type === "shipping" ? deleteAddress : deleteAddress;
//       await deleteFn(addressId, { signal: abortController.signal });
//       if (type === "shipping") {
//         setShippingAddresses(shippingAddresses.filter((addr) => addr.id !== addressId));
//         if (selectedShippingAddress === addressId) setSelectedShippingAddress("");
//       } else {
//         setBillingAddresses(billingAddresses.filter((addr) => addr.id !== addressId));
//         if (selectedBillingAddress === addressId) setSelectedBillingAddress("");
//       }
//     } catch (error) {
//       console.error(`Error deleting ${type} address:`, error);
//       setApiError(error.message || `Failed to delete ${type} address.`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCheckout = async (e) => {
//     e.preventDefault();
//     setApiError("");
//     setSuccessMessage("");
//     setErrors({});

//     if (!validateForm()) return;

//     setIsLoading(true);
//     try {
//       let shippingAddressId = selectedShippingAddress;
//       let billingAddressId = selectedBillingAddress;

//       if (showNewShippingForm) {
//         const response = await createAddress(newShippingAddress, { signal: abortController.signal });
//         shippingAddressId = response.id;
//         setShippingAddresses([...shippingAddresses, response]);
//         setNewShippingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewShippingForm(false);
//       }

//       if (showNewBillingForm) {
//         const response = await createAddress(newBillingAddress, { signal: abortController.signal });
//         billingAddressId = response.id;
//         setBillingAddresses([...billingAddresses, response]);
//         setNewBillingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewBillingForm(false);
//       }

//       const orderData = {
//         shipping_address: parseInt(shippingAddressId),
//         billing_address: parseInt(billingAddressId),
//         shipping_cost: 0.00,
//         vat: 20.00,
//         discount: 0.00,
//         status: "PENDING",
//         payment_status: "PENDING",
//         payment_method: paymentMethod,
//       };

//       if (paymentMethod === "stripe") {
//         if (!stripe || !elements) {
//           setApiError("Stripe is not initialized.");
//           setIsLoading(false);
//           return;
//         }

//         const cardElement = elements.getElement(CardElement);
//         const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//           payment_method: {
//             card: cardElement,
//             billing_details: {
//               name: `${newBillingAddress.first_name} ${newBillingAddress.last_name}`,
//               address: {
//                 line1: newBillingAddress.street,
//                 city: newBillingAddress.city,
//                 state: newBillingAddress.state,
//                 postal_code: newBillingAddress.postal_code,
//                 country: newBillingAddress.country,
//               },
//             },
//           },
//         });

//         if (error) {
//           setApiError(error.message);
//           setIsLoading(false);
//           return;
//         }

//         if (paymentIntent.status === "succeeded") {
//           orderData.payment_status = "COMPLETED";
//           orderData.payment_verified = true;
//           orderData.transaction_id = paymentIntent.id;
//         } else {
//           setApiError("Payment failed. Please try again.");
//           setIsLoading(false);
//           return;
//         }
//       }

//       await createOrder(orderData, { signal: abortController.signal });

//       dispatch(setCartItems([]));
//       setSuccessMessage("Order placed successfully! Redirecting to order tracking...");
//       setSelectedShippingAddress("");
//       setSelectedBillingAddress("");
//       setPaymentMethod("stripe");
//       setErrors({});
//     } catch (error) {
//       console.error("Checkout error:", error);
//       if (error.errors) {
//         const formattedErrors = {};
//         const formatErrorMessages = (messages) => (Array.isArray(messages) ? messages[0] : messages);

//         if (showNewShippingForm) {
//           Object.entries(error.errors).forEach(([key, messages]) => {
//             if (key in newShippingAddress) {
//               formattedErrors[`shipping_${key}`] = formatErrorMessages(messages);
//             }
//           });
//         }

//         if (showNewBillingForm) {
//           Object.entries(error.errors).forEach(([key, messages]) => {
//             if (key in newBillingAddress) {
//               formattedErrors[`billing_${key}`] = formatErrorMessages(messages);
//             }
//           });
//         }

//         if (!showNewShippingForm && !showNewBillingForm) {
//           Object.entries(error.errors).forEach(([key, messages]) => {
//             if (key === "shipping_address" || key === "billing_address" || key === "payment_method" || key === "cart") {
//               formattedErrors[key] = formatErrorMessages(messages);
//             }
//           });
//         }

//         setErrors(formattedErrors);
//       } else {
//         setApiError(error.message || "Failed to place order.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addressFields = [
//     { label: "First Name", name: "first_name", type: "text", icon: <User /> },
//     { label: "Last Name", name: "last_name", type: "text", icon: <User /> },
//     { label: "Street", name: "street", type: "text", icon: <MapPinCheck /> },
//     { label: "City", name: "city", type: "text", icon: <Building2 /> },
//     { label: "State", name: "state", type: "text", icon: <Home /> },
//     { label: "Postal Code", name: "postal_code", type: "text", icon: <Building2 /> },
//     { label: "Telephone Number", name: "telephone_number", type: "tel", icon: <Phone /> },
//     { label: "Country", name: "country", type: "text", icon: <MapPin />, disabled: true },
//   ];

//   return (
//     <div className={CheckoutFormStyles.container}>
//       <form className={CheckoutFormStyles.container} onSubmit={handleCheckout}>
//         <h4 className={FormStyles.title}>
//           Place your <span className={FormStyles.accent}>Order</span>
//         </h4>

//         {apiError && <div className={FormStyles.errorMessage}>{apiError}</div>}
//         {successMessage && <div className={FormStyles.successMessage}>{successMessage}</div>}

//         <div className={FormStyles.formSection}>
//           <h5 className={FormStyles.sectionTitle}>Shipping Address</h5>
//           <div className={FormStyles.inputGroup}>
//             <label className={FormStyles.label} htmlFor="shipping_address">
//               Select Shipping Address
//             </label>
//             <div className={FormStyles.inputWrapper}>
//               <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
//               <select
//                 className={`${FormStyles.input} ${errors.shipping_address ? FormStyles.inputError : ""}`}
//                 id="shipping_address"
//                 value={selectedShippingAddress}
//                 onChange={(e) => setSelectedShippingAddress(e.target.value)}
//                 disabled={isLoading || showNewShippingForm}
//               >
//                 <option value="">Select an address</option>
//                 {shippingAddresses.map((addr) => (
//                   <option key={addr.id} value={addr.id}>
//                     {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {errors.shipping_address && <span className={FormStyles.errorText}>{errors.shipping_address}</span>}
//             {shippingAddresses.map((addr) => (
//               <button
//                 key={addr.id}
//                 type="button"
//                 className="secondary-btn"
//                 onClick={() => handleDeleteAddress("shipping", addr.id)}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 <Trash2 size={16} /> Delete {addr.first_name}'s Address
//               </button>
//             ))}
//           </div>
//           <button
//             type="button"
//             className="secondary-btn"
//             onClick={() => setShowNewShippingForm(!showNewShippingForm)}
//             disabled={isLoading}
//             data-loading={isLoading}
//           >
//             {showNewShippingForm ? "Cancel" : "Add New Shipping Address"}
//           </button>
//           {showNewShippingForm && (
//             <div className={FormStyles.formSection}>
//               {addressFields.map((field) => (
//                 <div className={FormStyles.inputGroup} key={field.name}>
//                   <label className={FormStyles.label} htmlFor={`shipping_${field.name}`}>
//                     {field.label}
//                   </label>
//                   <div className={FormStyles.inputWrapper}>
//                     <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
//                     <input
//                       className={`${FormStyles.input} ${errors[`shipping_${field.name}`] ? FormStyles.inputError : ""}`}
//                       type={field.type}
//                       id={`shipping_${field.name}`}
//                       value={newShippingAddress[field.name] || ""}
//                       onChange={(e) => setNewShippingAddress({ ...newShippingAddress, [field.name]: e.target.value })}
//                       disabled={isLoading || field.disabled}
//                     />
//                   </div>
//                   {errors[`shipping_${field.name}`] && (
//                     <span className={FormStyles.errorText}>{errors[`shipping_${field.name}`]}</span>
//                   )}
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="primary-btn"
//                 onClick={() => handleCreateAddress("shipping")}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 Save Shipping Address
//               </button>
//             </div>
//           )}
//         </div>

//         <div className={FormStyles.formSection}>
//           <h5 className={FormStyles.sectionTitle}>Billing Address</h5>
//           <div className={FormStyles.inputGroup}>
//             <label className={FormStyles.label} htmlFor="billing_address">
//               Select Billing Address
//             </label>
//             <div className={FormStyles.inputWrapper}>
//               <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
//               <select
//                 className={`${FormStyles.input} ${errors.billing_address ? FormStyles.inputError : ""}`}
//                 id="billing_address"
//                 value={selectedBillingAddress}
//                 onChange={(e) => setSelectedBillingAddress(e.target.value)}
//                 disabled={isLoading || showNewBillingForm}
//               >
//                 <option value="">Select an address</option>
//                 {billingAddresses.map((addr) => (
//                   <option key={addr.id} value={addr.id}>
//                     {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {errors.billing_address && <span className={FormStyles.errorText}>{errors.billing_address}</span>}
//             {billingAddresses.map((addr) => (
//               <button
//                 key={addr.id}
//                 type="button"
//                 className="secondary-btn"
//                 onClick={() => handleDeleteAddress("billing", addr.id)}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 <Trash2 size={16} /> Delete {addr.first_name}'s Address
//               </button>
//             ))}
//           </div>
//           <button
//             type="button"
//             className="secondary-btn"
//             onClick={() => setShowNewBillingForm(!showNewBillingForm)}
//             disabled={isLoading}
//             data-loading={isLoading}
//           >
//             {showNewBillingForm ? "Cancel" : "Add New Billing Address"}
//           </button>
//           {showNewBillingForm && (
//             <div className={FormStyles.formSection}>
//               {addressFields.map((field) => (
//                 <div className={FormStyles.inputGroup} key={field.name}>
//                   <label className={FormStyles.label} htmlFor={`billing_${field.name}`}>
//                     {field.label}
//                   </label>
//                   <div className={FormStyles.inputWrapper}>
//                     <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
//                     <input
//                       className={`${FormStyles.input} ${errors[`billing_${field.name}`] ? FormStyles.inputError : ""}`}
//                       type={field.type}
//                       id={`billing_${field.name}`}
//                       value={newBillingAddress[field.name] || ""}
//                       onChange={(e) => setNewBillingAddress({ ...newBillingAddress, [field.name]: e.target.value })}
//                       disabled={isLoading || field.disabled}
//                     />
//                   </div>
//                   {errors[`billing_${field.name}`] && (
//                     <span className={FormStyles.errorText}>{errors[`billing_${field.name}`]}</span>
//                   )}
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="primary-btn"
//                 onClick={() => handleCreateAddress("billing")}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 Save Billing Address
//               </button>
//             </div>
//           )}
//         </div>

//         <div className={FormStyles.formSection}>
//           <h5 className={FormStyles.sectionTitle}>Payment Details</h5>
//           <div className={FormStyles.inputGroup}>
//             <label className={FormStyles.label} htmlFor="payment_method">
//               Payment Method
//             </label>
//             <div className={FormStyles.inputWrapper}>
//               <span className={FormStyles.inputIcon}><CreditCard size={20} /></span>
//               <select
//                 className={`${FormStyles.input} ${errors.payment_method ? FormStyles.inputError : ""}`}
//                 id="payment_method"
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 disabled={isLoading}
//               >
//                 <option value="">Select a payment method</option>
//                 {paymentMethodOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {errors.payment_method && <span className={FormStyles.errorText}>{errors.payment_method}</span>}
//           </div>
//           {paymentMethod === "stripe" && (
//             <div className={FormStyles.inputGroup}>
//               <label className={FormStyles.label}>Card Details</label>
//               <div className={`${FormStyles.inputWrapper} ${CheckoutFormStyles.stripeCard}`}>
//                 <CardElement
//                   options={{
//                     style: {
//                       base: {
//                         fontSize: "16px",
//                         color: "#424770",
//                         "::placeholder": { color: "#aab7c4" },
//                       },
//                       invalid: { color: "#9e2146" },
//                     },
//                   }}
//                 />
//               </div>
//               {errors.payment && <span className={FormStyles.errorText}>{errors.payment}</span>}
//             </div>
//           )}
//         </div>

//         <div className={FormStyles.formSection}>
//           <div className={FormStyles.inputGroup}>
//             <h5 className={FormStyles.sectionTitle}>Cart Items</h5>
//             {cartItems.length > 0 ? (
//               <ul className={FormStyles.cartList}>
//                 {cartItems.map((item) => (
//                   <li key={item.id} className={FormStyles.cartItem}>
//                     {item.description} - {item.packs} pack{item.packs > 1 ? "s" : ""} (£{item.total.toFixed(2)})
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className={FormStyles.emptyCart}>No items in cart.</p>
//             )}
//             {errors.cart && <span className={FormStyles.errorText}>{errors.cart}</span>}
//           </div>
//         </div>
//         <button
//           className={`primary-btn full-width text-giant ${isLoading ? FormStyles.loading : ""}`}
//           type="submit"
//           disabled={isLoading}
//           data-loading={isLoading}
//         >
//           {isLoading ? "Processing..." : "Place Order"}
//         </button>
//       </form>
//     </div>
//   );
// };

// const CheckoutForm = () => (
//   <Elements stripe={stripePromise}>
//     <CheckoutFormContent />
//   </Elements>
// );

// export default CheckoutForm;

// import React, { useEffect, useState, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
// import FormStyles from "assets/css/FormStyles.module.css";
// import CheckoutFormStyles from "assets/css/CheckoutFormStyles.module.css";
// import { Building2, MapPin, MapPinCheck, Home, CreditCard, User, Phone, Trash2, Package } from "lucide-react";
// import { createOrder, getOrCreateCart, getCartItems, getAddresses, createAddress, deleteAddress, createPaymentIntent } from "utils/api/ecommerce";
// import { setCartItems } from "utils/cartSlice";

// // Initialize Stripe with environment variable
// const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
// const stripePromise = loadStripe(stripeKey);


// const CheckoutFormContent = () => {
//   const [shippingAddresses, setShippingAddresses] = useState([]);
//   const [billingAddresses, setBillingAddresses] = useState([]);
//   const [selectedShippingAddress, setSelectedShippingAddress] = useState("");
//   const [selectedBillingAddress, setSelectedBillingAddress] = useState("");
//   const [newShippingAddress, setNewShippingAddress] = useState({
//     first_name: "",
//     last_name: "",
//     street: "",
//     city: "",
//     state: "",
//     postal_code: "",
//     country: "UK",
//     telephone_number: "",
//   });
//   const [newBillingAddress, setNewBillingAddress] = useState({
//     first_name: "",
//     last_name: "",
//     street: "",
//     city: "",
//     state: "",
//     postal_code: "",
//     country: "UK",
//     telephone_number: "",
//   });
//   const [showNewShippingForm, setShowNewShippingForm] = useState(false);
//   const [showNewBillingForm, setShowNewBillingForm] = useState(false);
//   const [paymentMethod, setPaymentMethod] = useState("stripe");
//   const [errors, setErrors] = useState({});
//   const [apiError, setApiError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isPaymentIntentLoading, setIsPaymentIntentLoading] = useState(false);
//   const [clientSecret, setClientSecret] = useState("");
//   const [stripeInitialized, setStripeInitialized] = useState(false);
//   const stripe = useStripe();
//   const elements = useElements();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const cartItems = useSelector((state) => Array.isArray(state.cart.items) ? state.cart.items : []);

//   // Calculate total cart weight
//   const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight * item.packs), 0);
//   const showPalletPricingNote = totalWeight >= 750;

//   const paymentMethodOptions = [
//     { value: "stripe", label: "Credit/Debit Card (Stripe)" },
//    // { value: "manual_payment", label: "Direct Payment" },
//   ];

//   const validateAddresses = (addresses) => {
//     return (addresses || []).filter(
//       (addr) =>
//         addr &&
//         typeof addr === "object" &&
//         addr.id &&
//         addr.first_name &&
//         addr.last_name &&
//         addr.street &&
//         addr.city &&
//         addr.postal_code &&
//         addr.country &&
//         addr.telephone_number
//     );
//   };

//   const validateAddress = (address, type) => {
//     const errors = {};
//     if (!address.first_name) errors[`${type}_first_name`] = "First name is required.";
//     if (!address.last_name) errors[`${type}_last_name`] = "Last name is required.";
//     if (!address.street) errors[`${type}_street`] = "Street is required.";
//     if (!address.city) errors[`${type}_city`] = "City is required.";
//     if (!address.postal_code) errors[`${type}_postal_code`] = "Postal code is required.";
//     if (!address.telephone_number) errors[`${type}_telephone_number`] = "Telephone number is required.";
//     if (address.telephone_number && !/^\+?\d{10,14}$/.test(String(address.telephone_number))) {
//       errors[`${type}_telephone_number`] = "Invalid telephone number format.";
//     }
//     return errors;
//   };

//   // Check Stripe initialization
//   useEffect(() => {
//     if (stripe && elements) {
//       setStripeInitialized(true);
//     }
//   }, [stripe, elements]);

//   // Fetch cart and addresses
//   useEffect(() => {
//     const cartController = new AbortController();
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const cart = await getOrCreateCart({ signal: cartController.signal });
//         const cartId = cart.id;
//         const cartItemsResponse = await getCartItems(cartId, { signal: cartController.signal });
//         const mappedItems = (cartItemsResponse.results || []).map((item) => ({
//           id: item.id.toString(),
//           description: item.item.title || item.item.product_variant?.name || `Item ${item.item.id}`,
//           packs: item.pack_quantity,
//           units: item.pack_quantity * (item.item.product_variant?.units_per_pack || 1),
//           subtotal: parseFloat(item.subtotal) || 0,
//           total: parseFloat(item.total) || 0,
//           displayPriceType: item.unit_type,
//           variantId: item.item.product_variant?.id?.toString() || "unknown",
//           image: item.item.images?.[0]?.image || "",
//           sku: item.item.sku || `SKU-${item.item.id}`,
//           perPackPrice: parseFloat(item.price_per_pack) || 0,
//           pricingTierId: item.pricing_tier.id,
//           weight: parseFloat(item.weight) || 0,
//           itemId: item.item.id,
//         }));
//         dispatch(setCartItems(mappedItems));

//         const shippingAddressesResponse = await getAddresses({ signal: cartController.signal });
//         const billingAddressesResponse = await getAddresses({ signal: cartController.signal });
//         const validShippingAddresses = validateAddresses(shippingAddressesResponse);
//         const validBillingAddresses = validateAddresses(billingAddressesResponse);
//         setShippingAddresses(validShippingAddresses);
//         setBillingAddresses(validBillingAddresses);
//       } catch (error) {
//         if (error.name !== 'AbortError') {
//           console.error("Error fetching data:", error);
//           setApiError(error.message || "Failed to load checkout data.");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchData();

//     return () => {
//       cartController.abort();
//     };
//   }, [dispatch]);

//   // Fetch PaymentIntent with retry
//   const fetchPaymentIntent = useCallback(async (cartId, retries = 3, delay = 1000) => {
//     if (!cartId || paymentMethod !== "stripe" || cartItems.length === 0) {
//       return;
//     }
//     const paymentController = new AbortController();
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       try {
//         setIsPaymentIntentLoading(true);
//         const response = await createPaymentIntent({ cart_id: cartId }, { signal: paymentController.signal });
//         setClientSecret(response.client_secret);
//         setApiError("");
//         return;
//       } catch (error) {
//         if (error.name === 'AbortError') {
//           return;
//         }
//         console.error(`PaymentIntent attempt ${attempt} failed:`, error);
//         if (attempt === retries) {
//           setApiError(error.message || "Failed to initialize payment after multiple attempts. Please try again.");
//         } else {
//           await new Promise(resolve => setTimeout(resolve, delay));
//         }
//       } finally {
//         setIsPaymentIntentLoading(false);
//       }
//     }
//     return () => {
//       paymentController.abort();
//     };
//   }, [cartItems.length, paymentMethod]);

//   // Fetch PaymentIntent when cartItems and cart are ready
//   useEffect(() => {
//     const initPaymentIntent = async () => {
//       try {
//         const cart = await getOrCreateCart();
//         await fetchPaymentIntent(cart.id);
//       } catch (error) {
//         if (error.name !== 'AbortError') {
//           console.error("Error getting cart for PaymentIntent:", error);
//           setApiError(error.message || "Failed to initialize payment setup.");
//         }
//       }
//     };
//     if (cartItems.length > 0 && paymentMethod === "stripe") {
//       initPaymentIntent();
//     }
//   }, [cartItems.length, paymentMethod, fetchPaymentIntent]);

//   useEffect(() => {
//     if (successMessage) {
//       const timer = setTimeout(() => {
//         setSuccessMessage("");
//         navigate("/track-order");
//       }, 2000);
//       return () => clearTimeout(timer);
//     }
//   }, [successMessage, navigate]);

//   const validateForm = () => {
//     const newErrors = {};
//     if (!selectedShippingAddress && !showNewShippingForm) {
//       newErrors.shipping_address = "Please select or create a shipping address.";
//     }
//     if (!selectedBillingAddress && !showNewBillingForm) {
//       newErrors.billing_address = "Please select or create a billing address.";
//     }
//     if (showNewShippingForm) {
//       Object.assign(newErrors, validateAddress(newShippingAddress, "shipping"));
//     }
//     if (showNewBillingForm) {
//       Object.assign(newErrors, validateAddress(newBillingAddress, "billing"));
//     }
//     if (!paymentMethod) {
//       newErrors.payment_method = "Payment method is required.";
//     }
//     if (!cartItems.length) {
//       newErrors.cart = "Cart is empty. Add items to proceed.";
//     }
//     if (paymentMethod === "stripe" && (!clientSecret || !stripeInitialized)) {
//       newErrors.payment = "Payment system is not fully initialized. Please wait or try again.";
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleCreateAddress = async (type) => {
//     try {
//       setIsLoading(true);
//       setErrors({});
//       setApiError("");
//       const addressData = type === "shipping" ? newShippingAddress : newBillingAddress;
//       const addressErrors = validateAddress(addressData, type);

//       if (Object.keys(addressErrors).length > 0) {
//         setErrors(addressErrors);
//         setApiError(`Please correct the errors in the ${type} address form.`);
//         return;
//       }

//       const addressController = new AbortController();
//       const createFn = createAddress;
//       const response = await createFn(addressData, { signal: addressController.signal });

//       if (type === "shipping") {
//         setShippingAddresses([...shippingAddresses, response]);
//         setSelectedShippingAddress(response.id);
//         setNewShippingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewShippingForm(false);
//       } else {
//         setBillingAddresses([...billingAddresses, response]);
//         setSelectedBillingAddress(response.id);
//         setNewBillingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewBillingForm(false);
//       }
//     } catch (error) {
//       if (error.name !== 'AbortError') {
//         console.error(`Error creating ${type} address:`, error);
//         if (error.errors) {
//           const formattedErrors = {};
//           Object.entries(error.errors).forEach(([key, messages]) => {
//             const message = Array.isArray(messages) ? messages[0] : messages;
//             formattedErrors[`${type}_${key}`] = message;
//           });
//           setErrors(formattedErrors);
//           setApiError(`Please correct the errors in the ${type} address form.`);
//         } else {
//           setApiError(error.message || `Failed to create ${type} address.`);
//         }
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteAddress = async (type, addressId) => {
//     try {
//       setIsLoading(true);
//       const deleteController = new AbortController();
//       const deleteFn = deleteAddress;
//       await deleteFn(addressId, { signal: deleteController.signal });
//       if (type === "shipping") {
//         setShippingAddresses(shippingAddresses.filter((addr) => addr.id !== addressId));
//         if (selectedShippingAddress === addressId) setSelectedShippingAddress("");
//       } else {
//         setBillingAddresses(billingAddresses.filter((addr) => addr.id !== addressId));
//         if (selectedBillingAddress === addressId) setSelectedBillingAddress("");
//       }
//     } catch (error) {
//       if (error.name !== 'AbortError') {
//         console.error(`Error deleting ${type} address:`, error);
//         setApiError(error.message || `Failed to delete ${type} address.`);
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCheckout = async (e) => {
//     e.preventDefault();
//     setApiError("");
//     setSuccessMessage("");
//     setErrors({});

//     if (!validateForm()) return;

//     setIsLoading(true);
//     try {
//       let shippingAddressId = selectedShippingAddress;
//       let billingAddressId = selectedBillingAddress;

//       if (showNewShippingForm) {
//         const response = await createAddress(newShippingAddress, { signal: new AbortController().signal });
//         shippingAddressId = response.id;
//         setShippingAddresses([...shippingAddresses, response]);
//         setNewShippingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewShippingForm(false);
//       }

//       if (showNewBillingForm) {
//         const response = await createAddress(newBillingAddress, { signal: new AbortController().signal });
//         billingAddressId = response.id;
//         setBillingAddresses([...billingAddresses, response]);
//         setNewBillingAddress({
//           first_name: "",
//           last_name: "",
//           street: "",
//           city: "",
//           state: "",
//           postal_code: "",
//           country: "UK",
//           telephone_number: "",
//         });
//         setShowNewBillingForm(false);
//       }

//       const orderData = {
//         shipping_address: parseInt(shippingAddressId),
//         billing_address: parseInt(billingAddressId),
//         shipping_cost: 0.00,
//         vat: 20.00,
//         discount: 0.00,
//         status: "PENDING",
//         payment_status: "PENDING",
//         payment_method: paymentMethod,
//       };

//       if (paymentMethod === "stripe") {
//         if (!stripe || !elements || !clientSecret || !stripeInitialized) {
//           setApiError("Payment system is not initialized properly.");
//           setIsLoading(false);
//           return;
//         }

//         const cardElement = elements.getElement(CardElement);
//         const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
//           payment_method: {
//             card: cardElement,
//             billing_details: {
//               name: `${newBillingAddress.first_name || billingAddresses.find(addr => addr.id === selectedBillingAddress)?.first_name || ""} ${newBillingAddress.last_name || billingAddresses.find(addr => addr.id === selectedBillingAddress)?.last_name || ""}`,
//               address: {
//                 line1: newBillingAddress.street || billingAddresses.find(addr => addr.id === selectedBillingAddress)?.street || "",
//                 city: newBillingAddress.city || billingAddresses.find(addr => addr.id === selectedBillingAddress)?.city || "",
//                 state: newBillingAddress.state || billingAddresses.find(addr => addr.id === selectedBillingAddress)?.state || "",
//                 postal_code: newBillingAddress.postal_code || billingAddresses.find(addr => addr.id === selectedBillingAddress)?.postal_code || "",
//                 country: newBillingAddress.country || billingAddresses.find(addr => addr.id === selectedBillingAddress)?.country || "UK",
//               },
//             },
//           },
//         });

//         if (error) {
//           setApiError(error.message);
//           setIsLoading(false);
//           return;
//         }

//         if (paymentIntent.status === "succeeded") {
//           orderData.payment_status = "COMPLETED";
//           orderData.payment_verified = true;
//           orderData.transaction_id = paymentIntent.id;
//         } else {
//           setApiError("Payment failed. Please try again.");
//           setIsLoading(false);
//           return;
//         }
//       }

//       await createOrder(orderData, { signal: new AbortController().signal });

//       dispatch(setCartItems([]));
//       setSuccessMessage("Order placed successfully! Redirecting to order tracking...");
//       setSelectedShippingAddress("");
//       setSelectedBillingAddress("");
//       setPaymentMethod("stripe");
//       setErrors({});
//     } catch (error) {
//       if (error.name !== 'AbortError') {
//         console.error("Checkout error:", error);
//         if (error.errors) {
//           const formattedErrors = {};
//           const formatErrorMessages = (messages) => (Array.isArray(messages) ? messages[0] : messages);

//           if (showNewShippingForm) {
//             Object.entries(error.errors).forEach(([key, messages]) => {
//               if (key in newShippingAddress) {
//                 formattedErrors[`shipping_${key}`] = formatErrorMessages(messages);
//               }
//             });
//           }

//           if (showNewBillingForm) {
//             Object.entries(error.errors).forEach(([key, messages]) => {
//               if (key in newBillingAddress) {
//                 formattedErrors[`billing_${key}`] = formatErrorMessages(messages);
//               }
//             });
//           }

//           if (!showNewShippingForm && !showNewBillingForm) {
//             Object.entries(error.errors).forEach(([key, messages]) => {
//               if (key === "shipping_address" || key === "billing_address" || key === "payment_method" || key === "cart") {
//                 formattedErrors[key] = formatErrorMessages(messages);
//               }
//             });
//           }

//           setErrors(formattedErrors);
//         } else {
//           setApiError(error.message || "Failed to place order.");
//         }
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const addressFields = [
//     { label: "First Name", name: "first_name", type: "text", icon: <User /> },
//     { label: "Last Name", name: "last_name", type: "text", icon: <User /> },
//     { label: "Street", name: "street", type: "text", icon: <MapPinCheck /> },
//     { label: "City", name: "city", type: "text", icon: <Building2 /> },
//     { label: "State", name: "state", type: "text", icon: <Home /> },
//     { label: "Postal Code", name: "postal_code", type: "text", icon: <Building2 /> },
//     { label: "Telephone Number", name: "telephone_number", type: "tel", icon: <Phone /> },
//     { label: "Country", name: "country", type: "text", icon: <MapPin />, disabled: true },
//   ];

//   return (

//     <div className={CheckoutFormStyles.container}>
      
//       <form className={CheckoutFormStyles.container} onSubmit={handleCheckout}>
//         <h4 className={FormStyles.title}>
//           Place your <span className={FormStyles.accent}>Order</span>
//         </h4>

//         {apiError && <div className={FormStyles.errorMessage}>{apiError}</div>}
//         {successMessage && <div className={FormStyles.successMessage}>{successMessage}</div>}
//         {showPalletPricingNote && (
//               <div className={FormStyles.successMessage}>
//                 <Package size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
//                 <span>Congratulations! You've unlocked pallet pricing on all items, securing impressive savings (£)!</span>
//               </div>
//             )}
     

//         <div className={FormStyles.formSection}>
//           <h5 className={FormStyles.sectionTitle}>Shipping Address</h5>
//           <div className={FormStyles.inputGroup}>
//             <label className={FormStyles.label} htmlFor="shipping_address">
//               Select Shipping Address
//             </label>
//             <div className={FormStyles.inputWrapper}>
//               <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
//               <select
//                 className={`${FormStyles.input} ${errors.shipping_address ? FormStyles.inputError : ""}`}
//                 id="shipping_address"
//                 value={selectedShippingAddress}
//                 onChange={(e) => setSelectedShippingAddress(e.target.value)}
//                 disabled={isLoading || showNewShippingForm}
//               >
//                 <option value="">Select an address</option>
//                 {shippingAddresses.map((addr) => (
//                   <option key={addr.id} value={addr.id}>
//                     {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {errors.shipping_address && <span className={FormStyles.errorText}>{errors.shipping_address}</span>}
//             {shippingAddresses.map((addr) => (
//               <button
//                 key={addr.id}
//                 type="button"
//                 className="secondary-btn"
//                 onClick={() => handleDeleteAddress("shipping", addr.id)}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 <Trash2 size={16} /> Delete {addr.first_name}'s Address
//               </button>
//             ))}
//           </div>
//           <button
//             type="button"
//             className="secondary-btn"
//             onClick={() => setShowNewShippingForm(!showNewShippingForm)}
//             disabled={isLoading}
//             data-loading={isLoading}
//           >
//             {showNewShippingForm ? "Cancel" : "Add New Shipping Address"}
//           </button>
//           {showNewShippingForm && (
//             <div className={FormStyles.formSection}>
//               {addressFields.map((field) => (
//                 <div className={FormStyles.inputGroup} key={field.name}>
//                   <label className={FormStyles.label} htmlFor={`shipping_${field.name}`}>
//                     {field.label}
//                   </label>
//                   <div className={FormStyles.inputWrapper}>
//                     <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
//                     <input
//                       className={`${FormStyles.input} ${errors[`shipping_${field.name}`] ? FormStyles.inputError : ""}`}
//                       type={field.type}
//                       id={`shipping_${field.name}`}
//                       value={newShippingAddress[field.name] || ""}
//                       onChange={(e) => setNewShippingAddress({ ...newShippingAddress, [field.name]: e.target.value })}
//                       disabled={isLoading || field.disabled}
//                     />
//                   </div>
//                   {errors[`shipping_${field.name}`] && (
//                     <span className={FormStyles.errorText}>{errors[`shipping_${field.name}`]}</span>
//                   )}
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="primary-btn"
//                 onClick={() => handleCreateAddress("shipping")}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 Save Shipping Address
//               </button>
//             </div>
//           )}
//         </div>

//         <div className={FormStyles.formSection}>
//           <h5 className={FormStyles.sectionTitle}>Billing Address</h5>
//           <div className={FormStyles.inputGroup}>
//             <label className={FormStyles.label} htmlFor="billing_address">
//               Select Billing Address
//             </label>
//             <div className={FormStyles.inputWrapper}>
//               <span className={FormStyles.inputIcon}><MapPin size={20} /></span>
//               <select
//                 className={`${FormStyles.input} ${errors.billing_address ? FormStyles.inputError : ""}`}
//                 id="billing_address"
//                 value={selectedBillingAddress}
//                 onChange={(e) => setSelectedBillingAddress(e.target.value)}
//                 disabled={isLoading || showNewBillingForm}
//               >
//                 <option value="">Select an address</option>
//                 {billingAddresses.map((addr) => (
//                   <option key={addr.id} value={addr.id}>
//                     {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {errors.billing_address && <span className={FormStyles.errorText}>{errors.billing_address}</span>}
//             {billingAddresses.map((addr) => (
//               <button
//                 key={addr.id}
//                 type="button"
//                 className="secondary-btn"
//                 onClick={() => handleDeleteAddress("billing", addr.id)}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 <Trash2 size={16} /> Delete {addr.first_name}'s Address
//               </button>
//             ))}
//           </div>
//           <button
//             type="button"
//             className="secondary-btn"
//             onClick={() => setShowNewBillingForm(!showNewBillingForm)}
//             disabled={isLoading}
//             data-loading={isLoading}
//           >
//             {showNewBillingForm ? "Cancel" : "Add New Billing Address"}
//           </button>
//           {showNewBillingForm && (
//             <div className={FormStyles.formSection}>
//               {addressFields.map((field) => (
//                 <div className={FormStyles.inputGroup} key={field.name}>
//                   <label className={FormStyles.label} htmlFor={`billing_${field.name}`}>
//                     {field.label}
//                   </label>
//                   <div className={FormStyles.inputWrapper}>
//                     <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
//                     <input
//                       className={`${FormStyles.input} ${errors[`billing_${field.name}`] ? FormStyles.inputError : ""}`}
//                       type={field.type}
//                       id={`billing_${field.name}`}
//                       value={newBillingAddress[field.name] || ""}
//                       onChange={(e) => setNewBillingAddress({ ...newBillingAddress, [field.name]: e.target.value })}
//                       disabled={isLoading || field.disabled}
//                     />
//                   </div>
//                   {errors[`billing_${field.name}`] && (
//                     <span className={FormStyles.errorText}>{errors[`billing_${field.name}`]}</span>
//                   )}
//                 </div>
//               ))}
//               <button
//                 type="button"
//                 className="primary-btn"
//                 onClick={() => handleCreateAddress("billing")}
//                 disabled={isLoading}
//                 data-loading={isLoading}
//               >
//                 Save Billing Address
//               </button>
//             </div>
//           )}
//         </div>

//         <div className={FormStyles.formSection}>
//           <h5 className={FormStyles.sectionTitle}>Payment Details</h5>
//           <div className={FormStyles.inputGroup}>
//             <label className={FormStyles.label} htmlFor="payment_method">
//               Payment Method
//             </label>
//             <div className={FormStyles.inputWrapper}>
//               <span className={FormStyles.inputIcon}><CreditCard size={20} /></span>
//               <select
//                 className={`${FormStyles.input} ${errors.payment_method ? FormStyles.inputError : ""}`}
//                 id="payment_method"
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 disabled={isLoading}
//               >
//                 <option value="">Select a payment method</option>
//                 {paymentMethodOptions.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             {errors.payment_method && <span className={FormStyles.errorText}>{errors.payment_method}</span>}
//           </div>
//           {paymentMethod === "stripe" && stripeInitialized && !isPaymentIntentLoading && clientSecret && (
//             <div className={FormStyles.inputGroup}>
//               <label className={FormStyles.label}>Card Details</label>
//               <div className={`${FormStyles.inputWrapper} ${CheckoutFormStyles.stripeCard}`}>
//                 <CardElement
//                   options={{
//                     style: {
//                       base: {
//                         fontSize: "16px",
//                         color: "#424770",
//                         "::placeholder": { color: "#aab7c4" },
//                       },
//                       invalid: { color: "#9e2146" },
//                     },
//                   }}
//                 />
//               </div>
//               {errors.payment && <span className={FormStyles.errorText}>{errors.payment}</span>}
//             </div>
//           )}
//           {paymentMethod === "stripe" && (isPaymentIntentLoading || !stripeInitialized) && (
//             <div className={FormStyles.infoMessage}>
//               {isPaymentIntentLoading ? "Loading payment details..." : "Initializing Stripe..."}
//             </div>
//           )}
//         </div>

//         <div className={FormStyles.formSection}>
//           <div className={FormStyles.inputGroup}>
//             <h5 className={FormStyles.sectionTitle}>Cart Items</h5>

//             {cartItems.length > 0 ? (
//               <ul className={FormStyles.cartList}>
//                 {cartItems.map((item) => (
//                   <li key={item.id} className={FormStyles.cartItem}>
//                     {item.description} - {item.packs} pack{item.packs > 1 ? "s" : ""} (£{item.total.toFixed(2)})
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p className={FormStyles.emptyCart}>No items in cart.</p>
//             )}
//             {errors.cart && <span className={FormStyles.errorText}>{errors.cart}</span>}
//           </div>
//         </div>
//         <button
//           className={`primary-btn full-width text-giant ${isLoading ? FormStyles.loading : ""}`}
//           type="submit"
//           disabled={isLoading || (paymentMethod === "stripe" && (!clientSecret || isPaymentIntentLoading || !stripeInitialized))}
//           data-loading={isLoading}
//         >
//           {isLoading ? "Processing..." : "Place Order"}
//         </button>
//       </form>
//     </div>
//   );
// };

// const CheckoutForm = () => (
//   <Elements stripe={stripePromise}>
//     <CheckoutFormContent />
//   </Elements>
// );

// export default CheckoutForm;

import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import FormStyles from "assets/css/FormStyles.module.css";
import CheckoutFormStyles from "assets/css/CheckoutFormStyles.module.css";
import { Building2, MapPin, MapPinCheck, Home, CreditCard, User, Phone, Trash2, Package } from "lucide-react";
import { createOrder, getOrCreateCart, getCartItems, getAddresses, createAddress, deleteAddress, createPaymentIntent } from "utils/api/ecommerce";
import { setCartItems } from "utils/cartSlice";

// Initialize Stripe with environment variable
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripeKey);

const CheckoutFormContent = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState("");
  const [selectedBillingAddress, setSelectedBillingAddress] = useState("");
  const [newAddress, setNewAddress] = useState({
    first_name: "",
    last_name: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "UK",
    telephone_number: "",
  });
  const [sameAsBilling, setSameAsBilling] = useState(true); // Default to true
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentIntentLoading, setIsPaymentIntentLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [stripeInitialized, setStripeInitialized] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => 
    Array.isArray(state.cart.items) ? state.cart.items : []
  );

  // Calculate total cart weight
  const totalWeight = cartItems.reduce((sum, item) => sum + (item.weight * item.packs), 0);
  const showPalletPricingNote = totalWeight >= 750;

  const paymentMethodOptions = [
    { value: "stripe", label: "Credit/Debit Card (Stripe)" },
  ];

  const validateAddresses = (addresses) => {
    return (addresses || []).filter(
      (addr) =>
        addr &&
        typeof addr === "object" &&
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
    if (address.telephone_number && !/^\+?\d{10,14}$/.test(String(address.telephone_number))) {
      errors[`${type}_telephone_number`] = "Invalid telephone number format.";
    }
    return errors;
  };

  useEffect(() => {
    if (stripe && elements) {
      setStripeInitialized(true);
    }
  }, [stripe, elements]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch cart items
        const cart = await getOrCreateCart({ signal: controller.signal });
        const mappedItems = (cart.items || []).map((item) => ({
          id: item.id.toString(),
          description: item.item.title || item.item.product_variant?.name || `Item ${item.item.id}`,
          packs: item.pack_quantity,
          units: item.pack_quantity * (item.item.units_per_pack || 1),
          subtotal: parseFloat(item.subtotal) || 0,
          total: parseFloat(item.total) || 0,
          displayPriceType: item.unit_type,
          variantId: item.item.product_variant?.id?.toString() || "unknown",
          image: item.item.images?.[0]?.image || "",
          sku: item.item.sku || `SKU-${item.item.id}`,
          perPackPrice: parseFloat(item.price_per_pack) || 0,
          pricingTierId: item.pricing_tier,
          weight: parseFloat(item.weight) || 0,
          itemId: item.item.id,
        }));
        dispatch(setCartItems(mappedItems));

        // Fetch addresses
        const addressesResponse = await getAddresses({ signal: controller.signal });
        const validAddresses = validateAddresses(addressesResponse.results || addressesResponse);
        setAddresses(validAddresses);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error fetching data:", error);
          setApiError(error.message || "Failed to load checkout data.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  const fetchPaymentIntent = useCallback(async (cartId, retries = 3, delay = 1000) => {
    if (!cartId || paymentMethod !== "stripe" || cartItems.length === 0) {
      return;
    }
    const paymentController = new AbortController();
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        setIsPaymentIntentLoading(true);
        const response = await createPaymentIntent({ cart_id: cartId }, { signal: paymentController.signal });
        setClientSecret(response.client_secret);
        setApiError("");
        return;
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error(`PaymentIntent attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          setApiError(error.message || "Failed to initialize payment after multiple attempts. Please try again.");
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } finally {
        setIsPaymentIntentLoading(false);
      }
    }
    return () => {
      paymentController.abort();
    };
  }, [cartItems.length, paymentMethod]);

  useEffect(() => {
    const initPaymentIntent = async () => {
      try {
        const cart = await getOrCreateCart();
        await fetchPaymentIntent(cart.id);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error("Error getting cart for PaymentIntent:", error);
          setApiError(error.message || "Failed to initialize payment setup.");
        }
      }
    };
    if (cartItems.length > 0 && paymentMethod === "stripe") {
      initPaymentIntent();
    }
  }, [cartItems.length, paymentMethod, fetchPaymentIntent]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        navigate("/track-order");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  useEffect(() => {
    // Update shipping address when billing address changes and sameAsBilling is true
    if (sameAsBilling && selectedBillingAddress) {
      setSelectedShippingAddress(selectedBillingAddress);
    }
  }, [selectedBillingAddress, sameAsBilling]);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedBillingAddress && !showNewAddressForm) {
      newErrors.billing_address = "Please select or create a billing address.";
    }
    if (!sameAsBilling && !selectedShippingAddress && !showNewAddressForm) {
      newErrors.shipping_address = "Please select or create a shipping address.";
    }
    if (showNewAddressForm) {
      Object.assign(newErrors, validateAddress(newAddress, "new"));
    }
    if (!paymentMethod) {
      newErrors.payment_method = "Payment method is required.";
    }
    if (!cartItems.length) {
      newErrors.cart = "Cart is empty. Add items to proceed.";
    }
    if (paymentMethod === "stripe" && (!clientSecret || !stripeInitialized)) {
      newErrors.payment = "Payment system is not fully initialized. Please wait or try again.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAddress = async (section) => {
    try {
      setIsLoading(true);
      setErrors({});
      setApiError("");
      const addressErrors = validateAddress(newAddress, "new");

      if (Object.keys(addressErrors).length > 0) {
        setErrors(addressErrors);
        setApiError("Please correct the errors in the address form.");
        return;
      }

      // Format phone number before API call
      const formattedAddress = {
        ...newAddress,
        telephone_number: newAddress.telephone_number && newAddress.telephone_number.startsWith('0')
          ? '+44' + newAddress.telephone_number.slice(1)
          : newAddress.telephone_number
      };

      const addressController = new AbortController();
      const response = await createAddress(formattedAddress, { signal: addressController.signal });
      // Update addresses state to refresh both dropdowns
      setAddresses((prevAddresses) => [...prevAddresses, response]);
      // Set the new address as selected for the section where it was created
      if (section === 'billing') {
        setSelectedBillingAddress(response.id.toString());
        if (sameAsBilling) {
          setSelectedShippingAddress(response.id.toString());
        }
      } else if (section === 'shipping') {
        setSelectedShippingAddress(response.id.toString());
      }
      setNewAddress({
        first_name: "",
        last_name: "",
        street: "",
        city: "",
        state: "",
        postal_code: "",
        country: "UK",
        telephone_number: "",
      });
      setShowNewAddressForm(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error creating address:", error);
        if (error.errors) {
          const formattedErrors = {};
          Object.entries(error.errors).forEach(([key, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            formattedErrors[`new_${key}`] = message;
          });
          setErrors(formattedErrors);
          setApiError("Please correct the errors in the address form.");
        } else {
          setApiError(error.message || "Failed to create address.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      setIsLoading(true);
      const deleteController = new AbortController();
      await deleteAddress(addressId, { signal: deleteController.signal });
      // Update addresses state to refresh both dropdowns
      setAddresses((prevAddresses) => prevAddresses.filter((addr) => addr.id !== addressId));
      // Clear selections if the deleted address was selected
      if (selectedShippingAddress === addressId.toString()) {
        setSelectedShippingAddress("");
      }
      if (selectedBillingAddress === addressId.toString()) {
        setSelectedBillingAddress("");
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Error deleting address:", error);
        setApiError(error.message || "Failed to delete address.");
      }
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
      let shippingAddressId = sameAsBilling ? selectedBillingAddress : selectedShippingAddress;
      let billingAddressId = selectedBillingAddress;

      if (showNewAddressForm) {
        const formattedAddress = {
          ...newAddress,
          telephone_number: newAddress.telephone_number && newAddress.telephone_number.startsWith('0')
            ? '+44' + newAddress.telephone_number.slice(1)
            : newAddress.telephone_number
        };
        const response = await createAddress(formattedAddress, { signal: new AbortController().signal });
        billingAddressId = response.id.toString();
        shippingAddressId = sameAsBilling ? response.id.toString() : shippingAddressId;
        // Update addresses state to refresh both dropdowns
        setAddresses((prevAddresses) => [...prevAddresses, response]);
        setNewAddress({
          first_name: "",
          last_name: "",
          street: "",
          city: "",
          state: "",
          postal_code: "",
          country: "UK",
          telephone_number: "",
        });
        setShowNewAddressForm(false);
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

      if (paymentMethod === "stripe") {
        if (!stripe || !elements || !clientSecret || !stripeInitialized) {
          setApiError("Payment system is not initialized properly.");
          setIsLoading(false);
          return;
        }

        const cardElement = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${newAddress.first_name || addresses.find(addr => addr.id.toString() === selectedBillingAddress)?.first_name || ""} ${newAddress.last_name || addresses.find(addr => addr.id.toString() === selectedBillingAddress)?.last_name || ""}`,
              address: {
                line1: newAddress.street || addresses.find(addr => addr.id.toString() === selectedBillingAddress)?.street || "",
                city: newAddress.city || addresses.find(addr => addr.id.toString() === selectedBillingAddress)?.city || "",
                state: newAddress.state || addresses.find(addr => addr.id.toString() === selectedBillingAddress)?.state || "",
                postal_code: newAddress.postal_code || addresses.find(addr => addr.id.toString() === selectedBillingAddress)?.postal_code || "",
                country: newAddress.country || addresses.find(addr => addr.id.toString() === selectedBillingAddress)?.country || "UK",
              },
            },
          },
        });

        if (error) {
          setApiError(error.message);
          setIsLoading(false);
          return;
        }

        if (paymentIntent.status === "succeeded") {
          orderData.payment_status = "COMPLETED";
          orderData.payment_verified = true;
          orderData.transaction_id = paymentIntent.id;
        } else {
          setApiError("Payment failed. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      await createOrder(orderData, { signal: new AbortController().signal });

      dispatch(setCartItems([]));
      setSuccessMessage("Order placed successfully! Redirecting to order tracking...");
      setSelectedShippingAddress("");
      setSelectedBillingAddress("");
      setPaymentMethod("stripe");
      setErrors({});
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Checkout error:", error);
        if (error.errors) {
          const formattedErrors = {};
          const formatErrorMessages = (messages) => (Array.isArray(messages) ? messages[0] : messages);

          if (showNewAddressForm) {
            Object.entries(error.errors).forEach(([key, messages]) => {
              if (key in newAddress) {
                formattedErrors[`new_${key}`] = formatErrorMessages(messages);
              }
            });
          }

          if (!showNewAddressForm) {
            Object.entries(error.errors).forEach(([key, messages]) => {
              if (key === "shipping_address" || key === "billing_address" || key === "payment_method" || key === "cart") {
                formattedErrors[key] = formatErrorMessages(messages);
              }
            });
          }

          setErrors(formattedErrors);
        } else {
          setApiError(error.message || "Failed to place order.");
        }
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
        {showPalletPricingNote && (
          <div className={FormStyles.successMessage}>
            <Package size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            <span>Congratulations! You've unlocked pallet pricing on all items, securing impressive savings (£)!</span>
          </div>
        )}

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
                disabled={isLoading || showNewAddressForm}
              >
                <option value="">Select an address</option>
                {addresses.map((addr) => (
                  <option key={addr.id} value={addr.id.toString()}>
                    {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
                  </option>
                ))}
              </select>
            </div>
            {errors.billing_address && <span className={FormStyles.errorText}>{errors.billing_address}</span>}
            {selectedBillingAddress && (
              <button
                type="button"
                className="secondary-btn"
                onClick={() => handleDeleteAddress(parseInt(selectedBillingAddress))}
                disabled={isLoading}
                data-loading={isLoading}
              >
                <Trash2 size={16} /> Delete Selected Address
              </button>
            )}
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setShowNewAddressForm(!showNewAddressForm)}
            disabled={isLoading}
            data-loading={isLoading}
          >
            {showNewAddressForm ? "Cancel" : "Add New Address"}
          </button>
          {showNewAddressForm && (
            <div className={FormStyles.formSection}>
              {addressFields.map((field) => (
                <div className={FormStyles.inputGroup} key={field.name}>
                  <label className={FormStyles.label} htmlFor={`new_${field.name}`}>
                    {field.label}
                  </label>
                  <div className={FormStyles.inputWrapper}>
                    <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
                    <input
                      className={`${FormStyles.input} ${errors[`new_${field.name}`] ? FormStyles.inputError : ""}`}
                      type={field.type}
                      id={`new_${field.name}`}
                      value={newAddress[field.name] || ""}
                      onChange={(e) => setNewAddress({ ...newAddress, [field.name]: e.target.value })}
                      disabled={isLoading || field.disabled}
                    />
                  </div>
                  {errors[`new_${field.name}`] && (
                    <span className={FormStyles.errorText}>{errors[`new_${field.name}`]}</span>
                  )}
                </div>
              ))}
              <button
                type="button"
                className="primary-btn"
                onClick={() => handleCreateAddress('billing')}
                disabled={isLoading}
                data-loading={isLoading}
              >
                Save Address
              </button>
            </div>
          )}
        </div>

        {selectedBillingAddress && (
          <div className={FormStyles.formSection}>
            <h5 className={FormStyles.sectionTitle}>Shipping Address</h5>
            <div className={`${FormStyles.inputGroup}`}>
              <label className={`${FormStyles.checkboxLabel}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--gap-xxs)' }}>
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => {
                    setSameAsBilling(e.target.checked);
                    if (e.target.checked) {
                      setSelectedShippingAddress(selectedBillingAddress);
                    } else {
                      setSelectedShippingAddress("");
                    }
                  }}
                  disabled={isLoading}
                />
                Same as billing address
              </label>
            </div>
            {!sameAsBilling && (
              <>
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
                      disabled={isLoading || showNewAddressForm}
                    >
                      <option value="">Select an address</option>
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id.toString()}>
                          {addr.first_name} {addr.last_name}, {addr.street}, {addr.city}, {addr.postal_code}, {addr.country}, {addr.telephone_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.shipping_address && <span className={FormStyles.errorText}>{errors.shipping_address}</span>}
                  {selectedShippingAddress && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => handleDeleteAddress(parseInt(selectedShippingAddress))}
                      disabled={isLoading}
                      data-loading={isLoading}
                    >
                      <Trash2 size={16} /> Delete Selected Address
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  disabled={isLoading}
                  data-loading={isLoading}
                >
                  {showNewAddressForm ? "Cancel" : "Add New Address"}
                </button>
                {showNewAddressForm && (
                  <div className={FormStyles.formSection}>
                    {addressFields.map((field) => (
                      <div className={FormStyles.inputGroup} key={field.name}>
                        <label className={FormStyles.label} htmlFor={`new_${field.name}`}>
                          {field.label}
                        </label>
                        <div className={FormStyles.inputWrapper}>
                          <span className={FormStyles.inputIcon}>{React.cloneElement(field.icon, { size: 20 })}</span>
                          <input
                            className={`${FormStyles.input} ${errors[`new_${field.name}`] ? FormStyles.inputError : ""}`}
                            type={field.type}
                            id={`new_${field.name}`}
                            value={newAddress[field.name] || ""}
                            onChange={(e) => setNewAddress({ ...newAddress, [field.name]: e.target.value })}
                            disabled={isLoading || field.disabled}
                          />
                        </div>
                        {errors[`new_${field.name}`] && (
                          <span className={FormStyles.errorText}>{errors[`new_${field.name}`]}</span>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="primary-btn"
                      onClick={() => handleCreateAddress('shipping')}
                      disabled={isLoading}
                      data-loading={isLoading}
                    >
                      Save Address
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

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
          {paymentMethod === "stripe" && stripeInitialized && !isPaymentIntentLoading && clientSecret && (
            <div className={FormStyles.inputGroup}>
              <label className={FormStyles.label}>Card Details</label>
              <div className={`${FormStyles.inputWrapper} ${CheckoutFormStyles.stripeCard}`}>
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: "#424770",
                        "::placeholder": { color: "#aab7c4" },
                      },
                      invalid: { color: "#9e2146" },
                    },
                  }}
                />
              </div>
              {errors.payment && <span className={FormStyles.errorText}>{errors.payment}</span>}
            </div>
          )}
          {paymentMethod === "stripe" && (isPaymentIntentLoading || !stripeInitialized) && (
            <div className={FormStyles.infoMessage}>
              {isPaymentIntentLoading ? "Loading payment details..." : "Initializing Stripe..."}
            </div>
          )}
        </div>

        <div className={FormStyles.formSection}>
          <div className={FormStyles.inputGroup}>
            <h5 className={FormStyles.sectionTitle}>Cart Items</h5>
            {cartItems.length > 0 ? (
              <ul className={FormStyles.cartList}>
                {cartItems.map((item) => (
                  <li key={item.id} className={FormStyles.cartItem}>
                    {item.description} - {item.packs} pack{item.packs > 1 ? "s" : ""} (£{item.total.toFixed(2)})
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
          disabled={isLoading || (paymentMethod === "stripe" && (!clientSecret || isPaymentIntentLoading || !stripeInitialized))}
          data-loading={isLoading}
        >
          {isLoading ? "Processing..." : "Place Order"}
        </button>
      </form>
    </div>
  );
};

const CheckoutForm = () => (
  <Elements stripe={stripePromise}>
    <CheckoutFormContent />
  </Elements>
);

export default CheckoutForm;