import React from "react";
import { Link } from "react-router-dom";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Plus, Truck } from "lucide-react";
import AccentNotifier from "./AccentNotifier";
import { useSelector, useDispatch } from "react-redux";
import { updateCartItemUnits } from "utils/cartSlice";

const TrackOrderTable = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const handleUnitChange = (itemId, change) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item) {
      const newUnits = Math.max(0, item.units + change);
      dispatch(updateCartItemUnits({ itemId, units: newUnits }));
    }
  };

  // Calculate order summary
  const totalItems = cartItems.reduce((sum, item) => sum + item.units, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const vat = subtotal * 0.2; // Assuming 20% VAT based on provided data
  const weight = cartItems.reduce((sum, item) => sum + item.units * 0.2, 0); // Placeholder: 0.2kg per unit

  return (
    <div className={TableStyles.container}>
      <div className={TableStyles.tableContentWrapper}>
        <div className={TableStyles.tableContainer}>
          <table className={TableStyles.table}>
            <thead>
              <tr>
                <th className="l3 clr-accent-dark-blue">Image</th>
                <th className={`${TableStyles.colLongWidth} l3 clr-accent-dark-blue`}>Item</th>
                <th className="l3 clr-accent-dark-blue">Units</th>
                <th className="l3 clr-accent-dark-blue">Price</th>
                <th className="l3 clr-accent-dark-blue">Total</th>
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
                cartItems.map((cartElement) => (
                  <tr key={cartElement.id}>
                    <td className="c3">
                      <div className={TableStyles.colImageWrapper}>
                        <div className={TableStyles.colImageContainer}>
                          <img src={cartElement.image} alt={cartElement.description} loading="lazy" />
                        </div>
                      </div>
                    </td>
                    <td className={`${TableStyles.colLongWidth} c3`}>{cartElement.description}</td>
                    <td className="c3">
                      <span className={TableStyles.cartUnitsColWrapper}>
                        <button
                          className={TableStyles.cartButton}
                          onClick={() => handleUnitChange(cartElement.id, -1)}
                        >
                          <Minus className="icon-xms" />
                        </button>
                        {cartElement.units}
                        <button
                          className={TableStyles.cartButton}
                          onClick={() => handleUnitChange(cartElement.id, 1)}
                        >
                          <Plus className="icon-xms" />
                        </button>
                      </span>
                    </td>
                    <td className="c3">
                      £{(cartElement.subtotal / cartElement.units).toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="c3">
                      £{cartElement.subtotal.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
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
                  £{subtotal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  £{vat.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {subtotal > 0 && (
        <AccentNotifier
          icon={Truck}
          text={"Your order meets the requirements for free standard shipping."}
        />
      )}

      <div className="row-content justify-content-flex-end gap-xs">
        <Link to="/" className="secondary-btn large-btn text-large hover-primary">
          Continue Shopping
        </Link>
        <Link to="/checkout" className="primary-btn large-btn text-large hover-primary">
          Checkout
        </Link>
      </div>
    </div>
  );
};

export default TrackOrderTable;
