import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/OrderConfirmation.module.scss";

const InfoItem = ({ label, value }) => (
  <div className={styles.infoItem}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={styles.infoValue}>{value}</span>
  </div>
);

export default function OrderConfirmation() {
  const router = useRouter();
  const { orderId } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fallbackImage = "/images/fallback-product.jpg";

  const isRingItem = (item) => {
    return (
      item?.category?.toLowerCase().includes("ring") ||
      item?.name?.toLowerCase().includes("ring") ||
      item?.type?.toLowerCase().includes("ring") ||
      item?.ringSize ||
      item?.ringDetails
    );
  };

  const getRingSizeDisplay = (item) => {
    if (!isRingItem(item)) return "";
    if (item.ringDetails?.sizeDisplay) {
      return item.ringDetails.sizeDisplay;
    }
    const ringSize =
      item.ringSize?.value || item.ringSize || item.selectedSize || item.size;
    const isCustom =
      item.ringDetails?.isCustomSize ||
      item.ringSize?.isCustom ||
      item.sizeType === "custom";
    if (!ringSize) return "";
    return isCustom ? `Custom Size: ${ringSize}` : `Size ${ringSize}`;
  };

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
    router.push("/products");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
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
            aria-label="Continue shopping"
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
        <h1 className={styles.successTitle}>Order Confirmed!</h1>
        <p className={styles.successMessage}>
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
      </div>

      <div className={styles.orderDetails}>
        <h2 className={styles.orderTitle}>Order Details</h2>

        <div className={styles.orderGrid}>
          <div className={styles.orderInfo}>
            <InfoItem label="Order Number:" value={orderDetails.orderId} />
            <InfoItem
              label="Date:"
              value={formatDate(orderDetails.createdAt)}
            />
            <InfoItem
              label="Payment Method:"
              value={
                orderDetails.paymentInfo.method === "card"
                  ? "Credit/Debit Card"
                  : orderDetails.paymentInfo.method === "upi"
                  ? "UPI"
                  : orderDetails.paymentInfo.method === "netbanking"
                  ? "Net Banking"
                  : orderDetails.paymentInfo.method === "wallet"
                  ? "Wallet"
                  : "Online Payment"
              }
            />
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
            <div className={styles.shippingNote}>
              <p>
                A reliable courier (e.g., Blue Dart, Delhivery) will be assigned
                for secure delivery. Tracking updates will be sent via SMS,
                WhatsApp, and email within 24 hours (Also check your Spam folder
                for the tracking link).
              </p>
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

        {orderDetails.items.some((item) => isRingItem(item)) && (
          <div className={styles.ringSizeSection}>
            <h3>Ring Size Details</h3>
            <div className={styles.ringSizeContent}>
              {orderDetails.items
                .filter((item) => isRingItem(item))
                .map((item, index) => (
                  <div key={index} className={styles.ringSizeItem}>
                    <strong>{item.name}</strong>: {getRingSizeDisplay(item)}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className={styles.orderItems}>
          <h3>Items in Your Order</h3>
          <div className={styles.itemsList}>
            {orderDetails.items.map((item) => (
              <div key={item.cartItemId} className={styles.orderItem}>
                <div className={styles.itemImage}>
                  <img
                    src={item.image || fallbackImage}
                    alt={item.name}
                    onError={(e) => (e.target.src = fallbackImage)}
                  />
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
                    {isRingItem(item) && getRingSizeDisplay(item) && (
                      <span className={styles.itemRingSize}>
                        {getRingSizeDisplay(item)}
                      </span>
                    )}
                  </div>
                  <div className={styles.itemTotal}>
                    Total: ₹{(item.price * item.quantity).toFixed(2)}
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
            aria-label="Continue shopping"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
