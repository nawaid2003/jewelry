//checkout
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Checkout.module.scss";
import { initPayUPayment } from "../lib/payu";
import Script from "next/script";

export default function Checkout() {
  const router = useRouter();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "card",
    specialRequest: "", // New field for special request
  });
  const [step, setStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fallbackImage = "/images/fallback-product.jpg";
  const maxSpecialRequestLength = 500; // Character limit for special request

  // Helper function to check if an item is a ring
  const isRingItem = (item) => {
    return (
      item?.category?.toLowerCase().includes("ring") ||
      item?.name?.toLowerCase().includes("ring") ||
      item?.type?.toLowerCase().includes("ring") ||
      item?.ringSize
    );
  };

  // Helper function to get ring size display text
  const getRingSizeDisplay = (item) => {
    if (!isRingItem(item)) return "";
    const ringSize = item.ringSize?.value || item.selectedSize;
    const isCustom = item.ringSize?.isCustom || item.sizeType === "custom";
    if (!ringSize) return "";
    return isCustom ? `Custom Size: ${ringSize}` : `Size ${ringSize}`;
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    if (items.length === 0) {
      router.push("/cart");
    }
    // Normalize cart items to ensure `image` field
    const normalizedItems = items.map((item) => ({
      ...item,
      image: item.images?.[0] || item.image || fallbackImage,
    }));
    setCartItems(normalizedItems);

    if (user) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
      }));
    }
  }, [router, user]);

  useEffect(() => {
    const { firstName, lastName, email, phone, address, city, state, pincode } =
      formData;
    if (step === 1) {
      setIsFormValid(
        firstName &&
          lastName &&
          email &&
          phone &&
          address &&
          city &&
          state &&
          pincode
      );
    } else if (step === 2) {
      setIsFormValid(true);
    } else if (step === 3) {
      setIsFormValid(true);
    }
  }, [formData, step]);

  useEffect(() => {
    const { payment } = router.query;

    if (payment === "success") {
      // Store payment success in localStorage
      localStorage.setItem("paymentStatus", "success");
      // Force step to be 3 (Review)
      setStep(3);
      // Remove query params to avoid infinite loop
      router.replace("/checkout", undefined, { shallow: true });
    } else if (payment === "failed") {
      setError("Payment failed. Please try again.");
      setStep(2); // Send back to payment step
      router.replace("/checkout", undefined, { shallow: true });
    }
  }, [router.query]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "specialRequest" && value.length > maxSpecialRequestLength) {
      return; // Prevent exceeding character limit
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const nextStep = () => {
    if (isFormValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const calculateShipping = () => {
    const subtotal = parseFloat(calculateSubtotal());
    return subtotal > 2500 ? 0 : 0;
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const shipping = calculateShipping();
    return (subtotal + shipping).toFixed(2);
  };

  // Update handlePayment function
  const handlePayment = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      // Generate temporary order data (not saved to Firestore yet)
      const tempOrderData = {
        orderId: `TEMP${Date.now()}${Math.floor(Math.random() * 1000)}`,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: cartItems,
        totalAmount: calculateTotal(),
        paymentMethod: formData.paymentMethod,
      };

      // Store temp order data in localStorage
      localStorage.setItem("tempOrderData", JSON.stringify(tempOrderData));

      // Prepare PayU payment data
      const paymentData = {
        txnid: tempOrderData.orderId,
        amount: tempOrderData.totalAmount,
        productinfo: `Purchase of ${cartItems.length} item(s)`,
        firstname: tempOrderData.customerInfo.firstName,
        email: tempOrderData.customerInfo.email,
        phone: tempOrderData.customerInfo.phone,
        address: tempOrderData.customerInfo.address,
        city: tempOrderData.customerInfo.city,
        state: tempOrderData.customerInfo.state,
        country: "India",
        zipcode: tempOrderData.customerInfo.pincode,
        udf1: user?.uid || "guest",
        udf2: JSON.stringify(cartItems.map((item) => item.id)),
      };

      // Initialize PayU payment
      const payuParams = await initPayUPayment(paymentData);

      // Create and submit form to PayU
      const form = document.createElement("form");
      form.method = "POST";
      form.action = `${PAYU_CONFIG.baseUrl}/_payment`;

      Object.entries(payuParams).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Payment initialization failed:", err);
      setError(
        `Payment initialization failed: ${err.message || "Please try again"}`
      );
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Check if payment was successful
      const paymentStatus = localStorage.getItem("paymentStatus");
      if (paymentStatus !== "success") {
        throw new Error("Payment not verified. Please complete payment first.");
      }

      // Get temp order data
      const tempOrderData = JSON.parse(localStorage.getItem("tempOrderData"));
      if (!tempOrderData) {
        throw new Error("Order data not found. Please start over.");
      }

      // Generate final order ID
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const orderData = {
        orderId,
        userId: user?.uid || null,
        customerInfo: tempOrderData.customerInfo,
        specialRequest: formData.specialRequest || null,
        items: tempOrderData.items.map((item) => {
          // ... (your existing item mapping logic)
        }),
        orderSummary: {
          subtotal: parseFloat(calculateSubtotal()),
          shipping: calculateShipping(),
          total: parseFloat(tempOrderData.totalAmount),
          itemCount: tempOrderData.items.reduce(
            (total, item) => total + item.quantity,
            0
          ),
        },
        paymentInfo: {
          method: tempOrderData.paymentMethod,
          status: "success",
          transactionId: tempOrderData.orderId.replace("TEMP", "PAY"),
          amount: tempOrderData.totalAmount,
          gateway: "PayU",
        },
        orderStatus: "confirmed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "orders"), orderData);

      // Clear all temporary data
      localStorage.removeItem("cartItems");
      localStorage.removeItem("tempOrderData");
      localStorage.removeItem("paymentStatus");

      // Store order IDs for confirmation page
      localStorage.setItem("lastOrderId", orderId);
      localStorage.setItem("firestoreOrderId", docRef.id);

      // Redirect to confirmation
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error("Error storing order:", err);
      setError(`Failed to place order: ${err.message || "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.checkoutTitle}>Checkout</h1>

      <div className={styles.checkoutSteps}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepLabel}>Shipping</span>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`}>
          <span className={styles.stepNumber}>2</span>
          <span className={styles.stepLabel}>Payment</span>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepLabel}>Review</span>
        </div>
      </div>

      <div className={styles.checkoutContent}>
        <div className={styles.formContainer}>
          {step === 1 && (
            <div className={styles.shippingForm}>
              <h2>Shipping Information</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name*</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name*</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email*</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone*</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Address*</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city">City*</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="state">State*</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="pincode">Pincode*</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="specialRequest">
                  Special Requests (e.g., gift message, engraving)
                </label>
                <textarea
                  id="specialRequest"
                  name="specialRequest"
                  value={formData.specialRequest}
                  onChange={handleChange}
                  placeholder="E.g., Please engrave 'Love Always' on the ring or include a gift note saying 'Happy Birthday!'"
                  maxLength={maxSpecialRequestLength}
                  className={styles.specialRequest}
                />
                <div className={styles.charCount}>
                  {formData.specialRequest.length}/{maxSpecialRequestLength}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.paymentForm}>
              <h2>Payment Information</h2>
              <div className={styles.paymentOptions}>
                <div className={styles.paymentOption}>
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={handleChange}
                  />
                  <label htmlFor="card">Credit/Debit Card</label>
                </div>
                <div className={styles.paymentOption}>
                  <input
                    type="radio"
                    id="upi"
                    name="paymentMethod"
                    value="upi"
                    checked={formData.paymentMethod === "upi"}
                    onChange={handleChange}
                  />
                  <label htmlFor="upi">UPI</label>
                </div>
                <div className={styles.paymentOption}>
                  <input
                    type="radio"
                    id="netbanking"
                    name="paymentMethod"
                    value="netbanking"
                    checked={formData.paymentMethod === "netbanking"}
                    onChange={handleChange}
                  />
                  <label htmlFor="netbanking">Net Banking</label>
                </div>
              </div>

              <div className={styles.razorpayPlaceholder}>
                <div className={styles.razorpayLogo}>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p>Razorpay Payment Form Will Render Here</p>
                <div className={styles.securePayment}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <span>Secured by Razorpay</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.orderReview}>
              <h2>Order Review</h2>

              {/* Show payment status */}
              {localStorage.getItem("paymentStatus") === "success" && (
                <div className={styles.paymentSuccess}>
                  <svg viewBox="0 0 24 24" className={styles.successIcon}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  <p>Payment successful! Review your order details below.</p>
                </div>
              )}

              <div className={styles.reviewSection}>
                <h3>Shipping Details</h3>
                <div className={styles.reviewInfo}>
                  <p>
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>{formData.address}</p>
                  <p>
                    {formData.city}, {formData.state} {formData.pincode}
                  </p>
                  <p>Email: {formData.email}</p>
                  <p>Phone: {formData.phone}</p>
                </div>
              </div>

              {formData.specialRequest && (
                <div className={styles.reviewSection}>
                  <h3>Special Request</h3>
                  <div className={styles.reviewInfo}>
                    <p>{formData.specialRequest}</p>
                  </div>
                </div>
              )}

              <div className={styles.reviewSection}>
                <h3>Payment Method</h3>
                <div className={styles.reviewInfo}>
                  <p>
                    {formData.paymentMethod === "card"
                      ? "Credit/Debit Card"
                      : formData.paymentMethod === "upi"
                      ? "UPI"
                      : "Net Banking"}
                  </p>
                </div>
              </div>

              {cartItems.some((item) => isRingItem(item)) && (
                <div className={styles.reviewSection}>
                  <h3>Ring Size Details</h3>
                  <div className={styles.reviewInfo}>
                    {cartItems
                      .filter((item) => isRingItem(item))
                      .map((item, index) => (
                        <p key={index}>
                          <strong>{item.name}</strong>:{" "}
                          {getRingSizeDisplay(item)}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {error && <div className={styles.error}>{error}</div>}
            </div>
          )}
        </div>

        <div className={styles.orderSummary}>
          <h2>Order Summary</h2>
          <div className={styles.summaryItems}>
            {cartItems.map((item, index) => (
              <div
                key={`${item.cartItemId}-${index}`}
                className={styles.summaryItem}
              >
                <div className={styles.itemImage}>
                  <img src={item.image || fallbackImage} alt={item.name} />
                  <span className={styles.itemQuantity}>{item.quantity}</span>
                </div>
                <div className={styles.itemInfo}>
                  <h4>{item.name}</h4>
                  {isRingItem(item) && (
                    <p className={styles.ringSize}>
                      {getRingSizeDisplay(item)}
                    </p>
                  )}
                  <p className={styles.itemPrice}>₹{item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.summaryCalculation}>
            <div className={styles.calculationRow}>
              <span>Subtotal</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            <div className={styles.calculationRow}>
              <span>Shipping</span>
              <span>
                {calculateShipping() === 0
                  ? "Free"
                  : `₹${calculateShipping().toFixed(2)}`}
              </span>
            </div>
            <div className={`${styles.calculationRow} ${styles.totalRow}`}>
              <span>Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.checkoutActions}>
        {step > 1 && (
          <button
            onClick={prevStep}
            className={styles.backButton}
            disabled={isSubmitting}
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            onClick={step === 2 ? handlePayment : nextStep}
            className={styles.nextButton}
            disabled={!isFormValid || isSubmitting}
          >
            {step === 1 ? "Continue to Payment" : "Pay Now"}
          </button>
        ) : (
          <button
            onClick={handleSubmitOrder}
            className={styles.placeOrderButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Placing Order..." : "Place Order"}
          </button>
        )}
      </div>
    </div>
  );
}
