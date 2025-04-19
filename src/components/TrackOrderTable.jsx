import React from "react";
import { Link } from "react-router-dom";
import TableStyles from "assets/css/TableStyles.module.css";

const TrackOrderTable = () => {
  const orders = [
    {
      orderId: "#81841921",
      orderDate: "24/2/2025",
      status: "Shipped",
      totalAmount: "£3.01",
      paymentStatus: "Paid",
      shippingMethod: "Standard",
      trackingNumber: "#8273191",
      invoice: "Click to download",
    },
    {
        orderId: "#81841921",
        orderDate: "24/2/2025",
        status: "Shipped",
        totalAmount: "£3.01",
        paymentStatus: "Paid",
        shippingMethod: "Standard",
        trackingNumber: "#8273191",
        invoice: "Click to download",
      },
      {
        orderId: "#81841921",
        orderDate: "24/2/2025",
        status: "Shipped",
        totalAmount: "£3.01",
        paymentStatus: "Paid",
        shippingMethod: "Standard",
        trackingNumber: "#8273191",
        invoice: "Click to download",
      },
      {
        orderId: "#81841921",
        orderDate: "24/2/2025",
        status: "Shipped",
        totalAmount: "£3.01",
        paymentStatus: "Paid",
        shippingMethod: "Standard",
        trackingNumber: "#8273191",
        invoice: "Click to download",
      },
      {
        orderId: "#81841921",
        orderDate: "24/2/2025",
        status: "Shipped",
        totalAmount: "£3.01",
        paymentStatus: "Paid",
        shippingMethod: "Standard",
        trackingNumber: "#8273191",
        invoice: "Click to download",
      },
  ];
  return (
    <div className={TableStyles.tableContainer}>
      <table className={TableStyles.table}>
        <thead>
          <tr>
            <th className="l3 clr-accent-dark-blue">Order ID</th>
            <th className="l3 clr-accent-dark-blue">Order Date</th>
            <th className="l3 clr-accent-dark-blue">Status</th>
            <th className="l3 clr-accent-dark-blue">Total Amount</th>
            <th className="l3 clr-accent-dark-blue">Payment Status</th>
            <th className="l3 clr-accent-dark-blue">Shipping Method</th>
            <th className="l3 clr-accent-dark-blue">Tracking Number</th>
            <th className="l3 clr-accent-dark-blue">Invoice</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td className="c3">{order.orderId}</td>
              <td className="c3">{order.orderDate}</td>
              <td className="c3">{order.status}</td>
              <td className="c3">{order.totalAmount}</td>
              <td className="c3">{order.paymentStatus}</td>
              <td className="c3">{order.shippingMethod}</td>
              <td className="c3">{order.trackingNumber}</td>
              <td className="c3">
                <Link to="#" className={TableStyles.invoiceLink}>
                  {order.invoice}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrackOrderTable;
