import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import FormSideContainerStyles from "assets/css/FormSideContainer.module.css";
import { getOrCreateCart } from "utils/api/ecommerce";
import axios from "axios";
import { BASE_URL } from "utils/global";
import CustomLoading from "components/CustomLoading";

// Function to normalize URL by removing double slashes
const normalizeUrl = (baseUrl, path) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
};

const CheckoutSideContainer = () => {
  const dispatch = useDispatch();
  // const cartItems = useSelector((state) => state.cart.items);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        const cart = await getOrCreateCart();
        const cartId = cart.id;

        const cartUrl = normalizeUrl(BASE_URL, `ecommerce/carts/${cartId}/`);
        const cartResponse = await axios.get(cartUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const cartData = cartResponse.data;
        setCartData(cartData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart data:", err.message);
        setLoading(false);
      }
    };

    fetchCartData();
  }, [dispatch, isLoggedIn]);

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
        discount_amount: 0,
      };
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
      <div className={FormSideContainerStyles.container}>
        <div className={FormSideContainerStyles.row}>
        <CustomLoading/>
        </div>
      </div>
    );
  }

  return (
    <div className={FormSideContainerStyles.container}>
      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Total Items</p>
        <p className="b3 dark">{totalItems} Items</p>
      </div>

      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Total Packs</p>
        <p className="b3 dark">{totalPacks} Packs</p>
      </div>

      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Subtotal</p>
        <p className="b3 dark">£{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      {/* <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Discount ({discount}%)</p>
        <p className="b3 dark">£{discount_amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div> */}

      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">VAT ({vat}%)</p>
        <p className="b3 dark">£{vat_amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>

      <div className={FormSideContainerStyles.row}>
        <p className="b3 dark">Weight</p>
        <p className="b3 dark">{weight.toFixed(1)}kg</p>
      </div>

      <div className={FormSideContainerStyles.row}>
        <h4 className="dark">Total</h4>
        <h4 className="dark">£{total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
      </div>
    </div>
  );
};

export default CheckoutSideContainer;