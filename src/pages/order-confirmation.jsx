// components/OrderConfirmation.jsx
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/OrderConfirmation.module.scss";

export default function OrderConfirmation() {
  const router = useRouter();
  const { orderId } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fallbackImage = "/images/fallback-product.jpg";

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const firestoreOrderId = localStorage.getItem("firestoreOrderId");
        if (!firestoreOrderId) {
          setError("Order not found. Please contact support.");
          setLoading(false);
          return;
        }

        const orderRef = doc(db, "orders", firestoreOrderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const data = orderSnap.data();
          const normalizedData = {
            ...data,
            items: data.items.map((item) => ({
              ...item,
              image: item.image || item.images?.[0] || fallbackImage,
            })),
          };
          setOrderDetails(normalizedData);
        } else {
          setError("Order not found. Please contact support.");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleContinueShopping = () => {
    localStorage.removeItem("firestoreOrderId");
    localStorage.removeItem("lastOrderId");
    router.push("/products");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return <div className={styles.confirmationContainer}>Loading...</div>;
  }

  if (error || !orderDetails) {
    return (
      <div className={styles.confirmationContainer}>
        <h1 className={styles.errorTitle}>{error || "Order not found"}</h1>
        <div className={styles.orderActions}>
          <a href="/contact" className={styles.contactLink}>
            Contact Customer Support
          </a>
          <button
            onClick={handleContinueShopping}
            className={styles.continueShoppingButton}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.confirmationContainer}>
      <div className={styles.successBanner}>
        <div className={styles.checkmarkCircle}>
          <svg viewBox="0 0 52 52" className={styles.checkmark}>
            <circle
              cx="26"
              cy="26"
              r="25"
              fill="none"
              className={styles.checkmarkCircle}
            />
            <path
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
              fill="none"
              className={styles.checkmarkCheck}
            />
          </svg>
        </div>
        <h1 className={styles.successTitle}>
          {orderDetails.orderStatus === "confirmed"
            ? "Order Confirmed!"
            : orderDetails.orderStatus === "failed"
            ? "Order Failed"
            : "Order Pending"}
        </h1>
        <p className={styles.successMessage}>
          {orderDetails.orderStatus === "confirmed"
            ? "Thank you for your purchase. Your order has been received and is being processed."
            : orderDetails.orderStatus === "failed"
            ? "Your payment failed. Please try again or contact support."
            : "Your order is pending payment confirmation."}
        </p>
      </div>

      <div className={styles.orderDetails}>
        <h2 className={styles.orderTitle}>Order Details</h2>
        <div className={styles.orderGrid}>
          <div className={styles.orderInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Order Number:</span>
              <span className={styles.infoValue}>{orderDetails.orderId}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date:</span>
              <span className={styles.infoValue}>
                {formatDate(orderDetails.createdAt)}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Payment Method:</span>
              <span className={styles.infoValue}>
                {orderDetails.paymentInfo.method === "card"
                  ? "Credit/Debit Card"
                  : orderDetails.paymentInfo.method === "upi"
                  ? "UPI"
                  : "Net Banking"}
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Payment Status:</span>
              <span className={styles.infoValue}>
                {orderDetails.paymentInfo.status === "success"
                  ? "Paid"
                  : orderDetails.paymentInfo.status === "failed"
                  ? "Failed"
                  : "Pending"}
              </span>
            </div>
            {orderDetails.paymentInfo.transactionId && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Transaction ID:</span>
                <span className={styles.infoValue}>
                  {orderDetails.paymentInfo.transactionId}
                </span>
              </div>
            )}
            {orderDetails.paymentInfo.payuId && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>PayU ID:</span>
                <span className={styles.infoValue}>
                  {orderDetails.paymentInfo.payuId}
                </span>
              </div>
            )}
            {orderDetails.paymentInfo.status === "failed" &&
              orderDetails.paymentInfo.error && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Error:</span>
                  <span className={styles.infoValue}>
                    {orderDetails.paymentInfo.error}
                  </span>
                </div>
              )}
          </div>
          <div className={styles.shippingDetails}>
            <h3>Shipping Information</h3>
            <div className={styles.addressBlock}>
              <p className={styles.name}>
                {orderDetails.customerInfo.firstName}{" "}
                {orderDetails.customerInfo.lastName}
              </p>
              <p>{orderDetails.customerInfo.address}</p>
              <p>
                {orderDetails.customerInfo.city},{" "}
                {orderDetails.customerInfo.state}{" "}
                {orderDetails.customerInfo.pincode}
              </p>
              <p>Email: {orderDetails.customerInfo.email}</p>
              <p>Phone: {orderDetails.customerInfo.phone}</p>
            </div>
          </div>
        </div>
        {orderDetails.specialRequest && (
          <div className={styles.specialRequestSection}>
            <h3>Special Request</h3>
            <div className={styles.specialRequestContent}>
              <p>{orderDetails.specialRequest}</p>
            </div>
          </div>
        )}
        <div className={styles.orderItems}>
          <h3>Items in Your Order</h3>
          <div className={styles.itemsList}>
            {orderDetails.items.map((item) => (
              <div key={item.cartItemId} className={styles.orderItem}>
                <div className={styles.itemImage}>
                  <img src={item.image || fallbackImage} alt={item.name} />
                </div>
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemMeta}>
                    <span className={styles.itemQuantity}>
                      Qty: {item.quantity}
                    </span>
                    <span className={styles.itemPrice}>
                      ₹{item.price.toFixed(2)}
                    </span>
                    {item.ringDetails && (
                      <span className={styles.itemRingSize}>
                        {item.ringDetails.sizeDisplay}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.orderSummary}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{orderDetails.orderSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>
              {orderDetails.orderSummary.shipping === 0
                ? "Free"
                : `₹${orderDetails.orderSummary.shipping.toFixed(2)}`}
            </span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>₹{orderDetails.orderSummary.total.toFixed(2)}</span>
          </div>
        </div>
        <div className={styles.estimatedDelivery}>
          <div className={styles.deliveryIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>
          <div className={styles.deliveryText}>
            <p className={styles.deliveryTitle}>Estimated Delivery</p>
            <p className={styles.deliveryDate}>
              {new Date(
                new Date(orderDetails.createdAt).getTime() +
                  7 * 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className={styles.orderActions}>
          <div className={styles.orderHelp}>
            <p>Have questions about your order?</p>
            <a href="/contact" className={styles.contactLink}>
              Contact Customer Support
            </a>
          </div>
          <button
            onClick={handleContinueShopping}
            className={styles.continueShoppingButton}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
