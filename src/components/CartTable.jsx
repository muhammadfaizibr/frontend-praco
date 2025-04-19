import React from "react";
import { Link } from "react-router-dom";
import TableStyles from "assets/css/TableStyles.module.css";
import { Minus, Plus } from "lucide-react";
import AccentNotifier from "./AccentNotifier";
import { Truck } from "lucide-react";

const TrackOrderTable = () => {
  const cartItems = [
    {
      image:
        "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
      item: "General purpose - Clear Blown alternative Flush core - 30% recycled content",
      units: 5,
      price: "£3.10",
      total: "£31.00",
    },
    {
      image:
        "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
      item: "General purpose - Clear Blown alternative Flush core - 30% recycled content",
      units: 5,
      price: "£3.10",
      total: "£31.00",
    },
    {
      image:
        "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
      item: "General purpose - Clear Blown alternative Flush core - 30% recycled content",
      units: 5,
      price: "£3.10",
      total: "£31.00",
    },
    {
      image:
        "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
      item: "General purpose - Clear Blown alternative Flush core - 30% recycled content",
      units: 5,
      price: "£3.10",
      total: "£31.00",
    },
    {
      image:
        "https://praco.co.uk/cdn/shop/collections/coloured-stretch-wrap-1062x708_600x.jpg?v=1707147471",
      item: "General purpose - Clear Blown alternative Flush core - 30% recycled content",
      units: 5,
      price: "£3.10",
      total: "£31.00",
    },
  ];
  return (
    <div className={TableStyles.container}>
    <div className={TableStyles.tableContentWrapper}>
      <div className={TableStyles.tableContainer}>
        <table className={TableStyles.table}>
          <thead>
            <tr>
              <th className="l3 clr-accent-dark-blue">Image</th>
              <th
                className={`${TableStyles.colLongWidth} l3 clr-accent-dark-blue`}
              >
                Item
              </th>
              <th className="l3 clr-accent-dark-blue">Units</th>
              <th className="l3 clr-accent-dark-blue">Price</th>
              <th className="l3 clr-accent-dark-blue">Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((cartElement, index) => (
              <tr key={index}>
                <td className="c3">
                  <div className={TableStyles.colImageWrapper}>
                  <div className={TableStyles.colImageContainer}>
                    <img src={cartElement.image} loading="lazy" />
                  </div>
                  </div>
                </td>
                <td className={`${TableStyles.colLongWidth} c3`}>
                  {cartElement.item}
                </td>
                <td className={`c3`}>
                  <span className={TableStyles.cartUnitsColWrapper}>
                    <button className={TableStyles.cartButton}>
                      <Minus className="icon-xms" />
                    </button>
                    {cartElement.units}
                    <button className={TableStyles.cartButton}>
                      <Plus className="icon-xms" />
                    </button>
                  </span>
                </td>
                <td className="c3">{cartElement.price}</td>
                <td className="c3">{cartElement.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={TableStyles.orderSummary}>
        <div className={TableStyles.orderSummaryInfo}>
          <div className={TableStyles.orderSummaryRow}>
            <div className={TableStyles.orderDataWrapper}>
              <div className={TableStyles.orderSummaryData}>Total Items</div>
              <div className={TableStyles.orderSummaryData}>22</div>
            </div>
            <div className={TableStyles.orderDataWrapper}>
              <div className={TableStyles.orderSummaryData}>Sub Total</div>
              <div className={TableStyles.orderSummaryData}>£871.00</div>
            </div>
          </div>

          <div className={TableStyles.orderSummaryRow}>
            <div className={TableStyles.orderDataWrapper}>
              <div className={TableStyles.orderSummaryData}>Weight</div>
              <div className={TableStyles.orderSummaryData}>4.5kg</div>
            </div>

            <div className={TableStyles.orderDataWrapper}>
              <div className={TableStyles.orderSummaryData}>Vat</div>
              <div className={TableStyles.orderSummaryData}>£174.20</div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <AccentNotifier
        icon={Truck}
        text={"Your order meets the requirements for free standard shipping."}
      />

      <div className="row-content justify-content-flex-end gap-xs">
      <Link className="secondary-btn large-btn text-large hover-primary">
        Continue Shopping
      </Link>

      <Link className="primary-btn large-btn text-large hover-primary">
        Checkout
      </Link>
      </div>
    </div>
  );
};

export default TrackOrderTable;
