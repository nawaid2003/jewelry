import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/OrderConfirmation.module.scss";

export default function OrderConfirmation() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState({
    orderId: "",
    date: "",
    items: [],
    shipping: {},
    payment: {},
    subtotal: 0,
    shipping_cost: 0,
    total: 0,
  });

  useEffect(() => {
    // Generate random order ID for demo purposes
    // In a real app, this would come from your backend
    const generateOrderId = () => {
      const timestamp = new Date().getTime().toString().slice(-6);
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      return `JW-${timestamp}-${random}`;
    };

    // Get order details from localStorage or session
    // In a real app, you'd fetch this from your backend API
    const getOrderDetails = () => {
      try {
        // Check if we have order data in localStorage
        const storedOrderData = localStorage.getItem("orderData");

        if (storedOrderData) {
          const parsedData = JSON.parse(storedOrderData);
          setOrderDetails(parsedData);
        } else {
          // Demo data if no real order data exists
          const demoItems = [
            {
              id: 1,
              name: "Diamond Pendant Necklace",
              price: 2499.99,
              quantity: 1,
              image: "/images/diamond-pendant.jpg",
            },
            {
              id: 2,
              name: "Gold Bracelet",
              price: 1299.99,
              quantity: 1,
              image: "/images/gold-bracelet.jpg",
            },
          ];

          const subtotal = demoItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );
          const shipping_cost = subtotal > 5000 ? 0 : 250;
          const total = subtotal + shipping_cost;

          setOrderDetails({
            orderId: generateOrderId(),
            date: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            items: demoItems,
            shipping: {
              name: "Jane Doe",
              address: "123 Main Street",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400001",
              email: "jane.doe@example.com",
              phone: "+91 98765 43210",
            },
            payment: {
              method: "Credit Card",
              last4: "4242",
            },
            subtotal: subtotal,
            shipping_cost: shipping_cost,
            total: total,
          });
        }

        // Clear cart after successfully loading order details
        localStorage.removeItem("cartItems");
      } catch (error) {
        console.error("Error getting order details:", error);
      }
    };

    getOrderDetails();
  }, []);

  const handleContinueShopping = () => {
    router.push("/products");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-IN", options);
  };

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
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Order Number:</span>
              <span className={styles.infoValue}>{orderDetails.orderId}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Date:</span>
              <span className={styles.infoValue}>{orderDetails.date}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Payment Method:</span>
              <span className={styles.infoValue}>
                {orderDetails.payment.method}{" "}
                {orderDetails.payment.last4 &&
                  `(ending in ${orderDetails.payment.last4})`}
              </span>
            </div>
          </div>

          <div className={styles.shippingDetails}>
            <h3>Shipping Information</h3>
            {orderDetails.shipping && (
              <div className={styles.addressBlock}>
                <p className={styles.name}>{orderDetails.shipping.name}</p>
                <p>{orderDetails.shipping.address}</p>
                <p>
                  {orderDetails.shipping.city}, {orderDetails.shipping.state}{" "}
                  {orderDetails.shipping.pincode}
                </p>
                <p>Email: {orderDetails.shipping.email}</p>
                <p>Phone: {orderDetails.shipping.phone}</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.orderItems}>
          <h3>Items in Your Order</h3>
          <div className={styles.itemsList}>
            {orderDetails.items.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <div className={styles.itemImage}>
                  <img src={item.image} alt={item.name} />
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.orderSummary}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₹{orderDetails.subtotal.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Shipping</span>
            <span>
              {orderDetails.shipping_cost === 0
                ? "Free"
                : `₹${orderDetails.shipping_cost.toFixed(2)}`}
            </span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span>₹{orderDetails.total.toFixed(2)}</span>
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
                Date.now() + 7 * 24 * 60 * 60 * 1000
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
