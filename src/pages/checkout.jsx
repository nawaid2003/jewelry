import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Checkout.module.scss";

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
  });
  const [step, setStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fallbackImage = "/images/fallback-product.jpg";

  // Helper function to check if an item is a ring
  const isRingItem = (item) => {
    return (
      item?.category?.toLowerCase().includes("ring") ||
      item?.name?.toLowerCase().includes("ring") ||
      item?.type?.toLowerCase().includes("ring") ||
      item?.ringSize // Check if ring size data exists
    );
  };

  // Helper function to get ring size display text
  const getRingSizeDisplay = (item) => {
    if (!isRingItem(item)) return "";

    // Check new structure first, then fall back to legacy
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
    setCartItems(items);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
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
    return subtotal > 5000 ? 0 : 250;
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const shipping = calculateShipping();
    return (subtotal + shipping).toFixed(2);
  };

  const handlePayment = () => {
    alert("Razorpay integration will be implemented here!");
    setStep(3);
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const orderData = {
        orderId,
        userId: user?.uid || null, // Add user ID for better tracking
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
        items: cartItems.map((item) => {
          const baseItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            total: (item.price * item.quantity).toFixed(2),
            category: item.category || "",
            type: item.type || "",
          };

          // Add ring-specific information if it's a ring
          if (isRingItem(item)) {
            const ringSize = item.ringSize?.value || item.selectedSize;
            const isCustomSize =
              item.ringSize?.isCustom || item.sizeType === "custom";

            baseItem.ringDetails = {
              isRing: true,
              size: ringSize,
              sizeType: isCustomSize ? "custom" : "standard",
              isCustomSize: isCustomSize,
              sizeDisplay: getRingSizeDisplay(item),
            };

            // Also add to main level for easy access
            baseItem.ringSize = ringSize;
            baseItem.isCustomRingSize = isCustomSize;
          }

          return baseItem;
        }),
        orderSummary: {
          subtotal: parseFloat(calculateSubtotal()),
          shipping: calculateShipping(),
          total: parseFloat(calculateTotal()),
          itemCount: cartItems.reduce(
            (total, item) => total + item.quantity,
            0
          ),
        },
        paymentInfo: {
          method: formData.paymentMethod,
          status: "pending",
        },
        orderStatus: "pending",
        // Add metadata for better tracking
        metadata: {
          hasRings: cartItems.some((item) => isRingItem(item)),
          ringItems: cartItems
            .filter((item) => isRingItem(item))
            .map((item) => ({
              productId: item.id,
              name: item.name,
              size: item.ringSize?.value || item.selectedSize,
              isCustomSize:
                item.ringSize?.isCustom || item.sizeType === "custom",
            })),
          totalItems: cartItems.length,
          browserInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Order data being submitted:", orderData); // For debugging

      const docRef = await addDoc(collection(db, "orders"), orderData);
      localStorage.removeItem("cartItems");
      localStorage.setItem("lastOrderId", orderId);
      localStorage.setItem("firestoreOrderId", docRef.id);
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

              {/* Show ring size details in review */}
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
              <div key={`${item.id}-${index}`} className={styles.summaryItem}>
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
