import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Checkout.module.scss";
import crypto from "crypto";

const PAYU_CONFIG = {
  merchantKey: process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY,
  merchantSalt: process.env.PAYU_MERCHANT_SALT,
  env: process.env.PAYU_ENV || "test",
  boltScriptUrl:
    process.env.PAYU_ENV === "production"
      ? "https://jssdk.payu.in/bolt/bolt.min.js"
      : "https://jssdk-uat.payu.in/bolt/bolt.min.js",
  paymentUrl:
    process.env.PAYU_ENV === "production"
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment",
};

// Utility function to generate PayU hash
const generatePayUHash = (params) => {
  const { key, txnid, amount, productinfo, firstname, email } = params;
  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_CONFIG.merchantSalt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

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
    specialRequest: "",
  });
  const [step, setStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fallbackImage = "/images/fallback-product.jpg";
  const maxSpecialRequestLength = 500;

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "specialRequest" && value.length > maxSpecialRequestLength) {
      return;
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

  const handlePayment = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const productInfo = `Jewelry Order ${orderId}`;
      const amount = parseFloat(calculateTotal()).toFixed(2);

      const paymentParams = {
        key: PAYU_CONFIG.merchantKey,
        txnid: orderId,
        amount: amount,
        productinfo: productInfo,
        firstname: formData.firstName,
        email: formData.email,
        phone: formData.phone,
        surl: `https://silverlining.store/order-confirmation?orderId=${orderId}`,
        furl: `https://silverlining.store/checkout?step=3`,
        pg:
          formData.paymentMethod === "集card"
            ? "CC"
            : formData.paymentMethod.toUpperCase(),
      };

      // Fetch hash from API route
      const response = await fetch("/api/payu-hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentParams),
      });

      if (!response.ok) {
        throw new Error("Failed to generate payment hash");
      }

      const { hash } = await response.json();
      paymentParams.hash = hash;

      window.bolt.launch(
        {
          ...paymentParams,
          lastname: formData.lastName,
          address1: formData.address,
          city: formData.city,
          state: formData.state,
          country: "India",
          zipcode: formData.pincode,
          udf1: formData.specialRequest || "",
          enforce_paymethod:
            formData.paymentMethod === "card"
              ? "creditcard|debitcard"
              : formData.paymentMethod,
          display_lang: "en",
        },
        {
          responseHandler: async (response) => {
            if (response.response.txnStatus === "SUCCESS") {
              formData.paymentMethod = response.response.mode.toLowerCase();
              await handleSubmitOrder();
            } else if (response.response.txnStatus === "FAILED") {
              setError("Payment failed. Please try again.");
              setIsSubmitting(false);
            } else if (response.response.txnStatus === "CANCEL") {
              setError("Payment was cancelled. Please try again.");
              setIsSubmitting(false);
            }
          },
          catchException: (error) => {
            setError(
              `Payment error: ${
                error.response?.error_Message || "Network error"
              }`
            );
            setIsSubmitting(false);
          },
        }
      );
    } catch (err) {
      console.error("Payment error:", err);
      setError(`Payment failed: ${err.message || "Please try again"}`);
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const orderData = {
        orderId,
        userId: user?.uid || null,
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
        specialRequest: formData.specialRequest || null,
        items: cartItems.map((item) => {
          const baseItem = {
            id: item.id,
            cartItemId: item.cartItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            images: Array.isArray(item.images) ? item.images : [item.image],
            total: (item.price * item.quantity).toFixed(2),
            category: item.category || "",
            type: item.type || "",
          };

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
          status: "completed",
        },
        orderStatus: "confirmed",
        metadata: {
          hasRings: cartItems.some((item) => isRingItem(item)),
          ringItems: cartItems
            .filter((item) => isRingItem(item))
            .map((item) => ({
              productId: item.id,
              cartItemId: item.cartItemId,
              name: item.name,
              size: item.ringSize?.value || item.selectedSize,
              isCustomSize:
                item.ringSize?.isCustom || item.sizeType === "custom",
            })),
          totalItems: cartItems.length,
          hasSpecialRequest: !!formData.specialRequest,
          browserInfo: {
            userAgent: navigator.userAgent,
            timestamp: Date.now(),
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      localStorage.removeItem("cartItems");
      localStorage.setItem("lastOrderId", orderId);
      localStorage.setItem("firestoreOrderId", docRef.id);
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error("Error storing order:", err);
      setError(`Failed to place order: ${err.message || "Please try again"}`);
      throw err;
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
          <span className={styles.stepLabel}>Review</span>
        </div>
        <div className={styles.stepConnector}></div>
        <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepLabel}>Payment</span>
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

              {formData.specialRequest && (
                <div className={styles.reviewSection}>
                  <h3>Special Request</h3>
                  <div className={styles.reviewInfo}>
                    <p>{formData.specialRequest}</p>
                  </div>
                </div>
              )}

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

              <div className={styles.reviewSection}>
                <h3>Order Items</h3>
                <div className={styles.reviewItems}>
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.cartItemId}-${index}`}
                      className={styles.reviewItem}
                    >
                      <div className={styles.itemImage}>
                        <img
                          src={item.image || fallbackImage}
                          alt={item.name}
                        />
                      </div>
                      <div className={styles.itemDetails}>
                        <h4>{item.name}</h4>
                        {isRingItem(item) && (
                          <p className={styles.ringSize}>
                            {getRingSizeDisplay(item)}
                          </p>
                        )}
                        <p className={styles.itemPrice}>
                          ₹{item.price.toFixed(2)} × {item.quantity} = ₹
                          {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
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
                <div className={styles.paymentOption}>
                  <input
                    type="radio"
                    id="wallet"
                    name="paymentMethod"
                    value="wallet"
                    checked={formData.paymentMethod === "wallet"}
                    onChange={handleChange}
                  />
                  <label htmlFor="wallet">Wallet</label>
                </div>
                <div className={styles.paymentOption}>
                  <input
                    type="radio"
                    id="emi"
                    name="paymentMethod"
                    value="emi"
                    checked={formData.paymentMethod === "emi"}
                    onChange={handleChange}
                  />
                  <label htmlFor="emi">EMI</label>
                </div>
              </div>

              <div className={styles.payuContainer}>
                <div className={styles.payuLogo}>
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M8 10h8v4H8z" />
                  </svg>
                </div>
                <p>PayU Secure Payment Form</p>
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
                  <span>Secured by PayU</span>
                </div>
              </div>

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
            onClick={nextStep}
            className={styles.nextButton}
            disabled={!isFormValid || isSubmitting}
          >
            {step === 1 ? "Review Order" : "Proceed to Payment"}
          </button>
        ) : (
          <button
            onClick={handlePayment}
            className={styles.placeOrderButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing Payment..." : "Pay Now"}
          </button>
        )}
      </div>

      {/* PayU Bolt Script */}
      <script src={PAYU_CONFIG.boltScriptUrl}></script>
    </div>
  );
}
