import React, { useState } from "react";
import FormStyles from "assets/css/FormStyles.module.css";
import CheckoutFormStyles from "assets/css/CheckoutFormStyles.module.css";
import HeadingBar from "components/HeadingBar";
import {
  AreaChart,
  Code2,
  MapPin,
  MapPinCheck,
  User,
} from "lucide-react";

const CheckoutForm = () => {
  const [countryValue, setCountryValue] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [postalCodeValue, setPostalCodeValue] = useState("");
  const [cardNumberValue, setCardNumberValue] = useState("");
  const [nameOnCardValue, setNameOnCardValue] = useState("");
  const [cardExpiryValue, setCardExpiryValue] = useState("");
  // eslint-disable-next-line
  const [cardCVVValue, setCardCVVValue] = useState("");

  const shippingFormInputs = [
    {
      label: "Country",
      name: "country",
      type: "text",
      icon: <MapPin />,
      value: countryValue,
      onchange: (e) => {
        setCountryValue(e.target.value);
      },
    },

    {
      label: "Address",
      name: "address",
      type: "text",
      icon: <MapPinCheck />,
      value: addressValue,
      onchange: (e) => {
        setAddressValue(e.target.value);
      },
    },
    {
      label: "City",
      name: "city",
      type: "text",
      icon: <AreaChart />,
      value: cityValue,
      onchange: (e) => {
        setCityValue(e.target.value);
      },
    },
    {
      label: "Postal Code",
      name: "postal-code",
      type: "text",
      icon: <Code2 />,
      value: postalCodeValue,
      onchange: (e) => {
        setPostalCodeValue(e.target.value);
      },
    },
  ];

  const billingFormInputs = [
    {
      label: "Card Number",
      name: "card-number",
      type: "text",
      icon: <Code2 />,
      value: cardNumberValue,
      onchange: (e) => {
        setCardNumberValue(e.target.value);
      },
    },
    {
      label: "Name on Card",
      name: "name-on-card",
      type: "text",
      icon: <User />,
      value: nameOnCardValue,
      onchange: (e) => {
        setNameOnCardValue(e.target.value);
      },
    },
    {
      label: "Expiry Date (MM / YY)",
      name: "expiry-date",
      type: "text",
      icon: <MapPin />,
      value: cardExpiryValue,
      onchange: (e) => {
        setCardExpiryValue(e.target.value);
      },
    },
    {
      label: "Security Code (CCV)",
      name: "security-code",
      type: "text",
      icon: <Code2 />,
      value: setCardCVVValue,
      onchange: (e) => {
        setCardCVVValue(e.target.value);
      },
    },
  ]

  const handleCheckout = () => {};

  return (
    <form className={`${FormStyles.container} ${CheckoutFormStyles.container}`}>
<HeadingBar
        displayType={"column"}
        headline={"Checkout"}
        headlineSize={"h3"}
        headlineSizeType={"tag"}
      />

      <div className={FormStyles.formWrapper}>
      <HeadingBar
        displayType={"row"}
        headline={"Shipping"}
        headlineSize={"h4"}
        headlineSizeType={"tag"}
      />
      {shippingFormInputs.map((inputElement, index) => {
        return (
          <div className={FormStyles.inputGroup}>
            <label className="dark l2" htmlFor={inputElement.name}>
              {inputElement.label}
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}>{inputElement.icon}</span>
              <input
                className="b2"
                type={inputElement.type}
                name={inputElement.name}
                id={inputElement.name}
                value={inputElement.value}
                onChange={inputElement.onchange}
              />
            </div>
          </div>
        );
      })}
      </div>
{/* <Divider/> */}
<div className={FormStyles.formWrapper}>


{/* <h4 className="dark">Billing</h4> */}
<HeadingBar
        displayType={"row"}
        headline={"Billing"}
        headlineSize={"h4"}
        headlineSizeType={"tag"}
      />
      {billingFormInputs.map((inputElement, index) => {
        return (
          <div className={FormStyles.inputGroup}>
            <label className="dark l2" htmlFor={inputElement.name}>
              {inputElement.label}
            </label>
            <div className={FormStyles.inputWrapper}>
              <span className={FormStyles.inputIcon}>{inputElement.icon}</span>
              <input
                className="b2"
                type={inputElement.type}
                name={inputElement.name}
                id={inputElement.name}
                value={inputElement.value}
                onChange={inputElement.onchange}
              />
            </div>
          </div>
        );
      })}
</div>
      <button
        className="primary-btn large-btn full-width text-large"
        onClick={handleCheckout}
      >
        Place Order
      </button>
    </form>
  );
};

export default CheckoutForm;
