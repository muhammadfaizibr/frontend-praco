import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import TableStyles from "assets/css/TableStyles.module.css";
import { AlertCircle, Package } from "lucide-react";
import Notification from "components/Notification";
import { getOrders } from "utils/api/ecommerce";
import AccentNotifier from "./AccentNotifier";

const TrackOrderContent = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  // Show notification with timeout
  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification((prev) => ({ ...prev, visible: false })), 3000);
  };

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isLoggedIn) {
        console.log("User not logged in, skipping order fetch");
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }

      const abortController = new AbortController();
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching orders...");

        const fetchedOrders = await getOrders({ signal: abortController.signal });
        console.log("Fetched orders:", fetchedOrders);

        // Set orders directly from API response
        setOrders([...fetchedOrders]);
        console.log("Orders state updated:", fetchedOrders);
        setLoading(false);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching orders:", {
            message: err.message,
            status: err.status,
            response: err.response?.data,
          });
          setError(err.message || "Failed to load orders. Please try again later.");
          setLoading(false);
        }
      }

      return () => {
        console.log("Cleaning up fetchOrders");
        abortController.abort();
      };
    };

    fetchOrders();
  }, [isLoggedIn]);

  // Log orders state changes
  useEffect(() => {
    console.log("Orders state:", orders);
  }, [orders]);

  // Determine status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "var(--clr-warning)"; // Orange
      case "processing":
        return "var(--clr-primary)"; // Blue
      case "shipped":
        return "var(--clr-success)"; // Green
      case "delivered":
        return "var(--clr-success-dark)"; // Dark Green
      case "cancelled":
        return "var(--clr-danger)"; // Red
      default:
        return "var(--clr-text)"; // Default text color
    }
  };

  if (loading) {
    return (
      <div className={TableStyles.tableContentWrapper}>
        <div className={TableStyles.tableContainer}>
          <p className="c3 text-center">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={TableStyles.tableContentWrapper}>
      <Notification message={notification.message} type={notification.type} visible={notification.visible} />
      {error && (
        <AccentNotifier
          icon={AlertCircle}
          text={error}
          className="clr-danger"
        />
      )}
      <div className={TableStyles.tableContainer}>
        {orders.length === 0 ? (
          <p className="c3 text-center">You have no orders.</p>
        ) : (
          <table className={TableStyles.table} role="grid">
            <thead>
              <tr>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Order ID</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Order Date</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Status</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Payment Status</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Payment Method</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Payment Verified</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Invoice</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Total Items</th>
                <th className={`${TableStyles.defaultHeader} b3 clr-text`}>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="b3 clr-text">{order.id}</td>
                  <td className="b3 clr-text">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="b3" style={{ color: getStatusColor(order.status) }}>
                    {order.status}
                  </td>
                  <td className="b3 clr-text">
                    {order.payment_status === "Paid" && order.payment_verified ? (
                      <>
                        Completed{" "}
                        <a href={order.invoice} target="_blank" rel="noopener noreferrer">
                          View Paid Receipt
                        </a>
                      </>
                    ) : order.payment_status === "Refunded" ? (
                      <>
                        Refunded{" "}
                        <a href={order.invoice} target="_blank" rel="noopener noreferrer">
                          View Paid Receipt
                        </a>{" "}
                        <a href={order.refund_receipt || order.invoice} target="_blank" rel="noopener noreferrer">
                          View Refund Receipt
                        </a>
                      </>
                    ) : (
                      order.payment_status
                    )}
                  </td>
                  <td className="b3 clr-text">{order.payment_method || "N/A"}</td>
                  <td className="b3 clr-text">{order.payment_verified ? "Yes" : "No"}</td>
                  <td className="b3 clr-text">
                    {order.invoice ? (
                      <a href={order.invoice} target="_blank" rel="noopener noreferrer">
                        View Invoice
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="b3 clr-text" style={{ textAlign: "right" }}>{order.items.length || 0}</td>
                  <td className="b3 clr-text" style={{ textAlign: "right" }}>
                    £{parseFloat(order.total).toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {orders.length > 0 && (
        <AccentNotifier
          icon={Package}
          text="Track your order status and details here."
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
      </div>
    </div>
  );
};

export default TrackOrderContent;