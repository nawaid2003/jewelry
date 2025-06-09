import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/Checkout.module.scss";

const PAYU_CONFIG = {
  merchantKey: process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY,
  merchantSalt: process.env.NEXT_PUBLIC_PAYU_MERCHANT_SALT,
  env: process.env.NEXT_PUBLIC_PAYU_ENV || "production",
  boltScriptUrl:
    process.env.NEXT_PUBLIC_PAYU_ENV === "production"
      ? "https://jssdk.payu.in/bolt/bolt.min.js"
      : "https://jssdk-uat.payu.in/bolt/bolt.min.js",
  paymentUrl:
    process.env.NEXT_PUBLIC_PAYU_ENV === "production"
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment",
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
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [shippingCost, setShippingCost] = useState(null);
  const [shippingError, setShippingError] = useState("");
  const fallbackImage = "/images/fallback-product.jpg";
  const maxSpecialRequestLength = 500;
  const COD_FEE = 50; // Define COD fee

  // Load PayU Bolt script dynamically
  const loadBoltScript = () => {
    return new Promise((resolve, reject) => {
      if (window.bolt) {
        setScriptLoaded(true);
        resolve();
        return;
      }
      const existingScript = document.querySelector(
        `script[src="${PAYU_CONFIG.boltScriptUrl}"]`
      );
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setScriptLoaded(true);
          resolve();
        });
        existingScript.addEventListener("error", reject);
        return;
      }
      const script = document.createElement("script");
      script.src = PAYU_CONFIG.boltScriptUrl;
      script.async = true;
      script.onload = () => {
        console.log("PayU Bolt script loaded successfully");
        setScriptLoaded(true);
        resolve();
      };
      script.onerror = (error) => {
        console.error("Failed to load PayU Bolt script:", error);
        reject(new Error("Failed to load PayU Bolt script"));
      };
      document.head.appendChild(script);
    });
  };

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

  // Calculate fixed shipping cost based on cart total and pincode
  const calculateShippingCost = (cartTotal, pincode) => {
    setShippingError("");
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      setShippingError("Please enter a valid 6-digit pincode.");
      return null;
    }

    // =============================================
    // TEST OVERRIDE - REMOVE FOR PRODUCTION
    // =============================================
    if (pincode === "999999") {
      console.log("🧪 TEST MODE: Special shipping rate for pincode 999999");
      return 1; // ₹1 for testing
    }
    // =============================================
    // END TEST OVERRIDE
    // =============================================

    let priceBasedRate = 0;
    if (cartTotal <= 500) priceBasedRate = 100;
    else if (cartTotal <= 1000) priceBasedRate = 150;
    else if (cartTotal <= 2500) priceBasedRate = 50;
    else return 0;

    const metroPrefixes = [
      "400",
      "110",
      "560",
      "600",
      "700",
      "500",
      "411",
      "380",
      "382",
    ];
    const isMetro = metroPrefixes.some((prefix) => pincode.startsWith(prefix));
    const locationBasedRate = isMetro ? 100 : 150;

    return Math.max(priceBasedRate, locationBasedRate);
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
    loadBoltScript().catch((err) => console.error("Bolt script error:", err));
  }, [router, user]);

  useEffect(() => {
    const { firstName, lastName, email, phone, address, city, state, pincode } =
      formData;

    if (step === 1) {
      const subtotal = parseFloat(calculateSubtotal());
      const shipping = calculateShippingCost(subtotal, pincode);
      setShippingCost(shipping);

      // Add a small delay to ensure shipping cost state is updated
      setTimeout(() => {
        const allFieldsValid =
          firstName?.trim() &&
          lastName?.trim() &&
          email?.trim() &&
          phone?.trim() &&
          address?.trim() &&
          city?.trim() &&
          state?.trim() &&
          pincode?.trim();
        const shippingValid = !shippingError && shipping !== null;
        setIsFormValid(allFieldsValid && shippingValid);
      }, 50);
    } else {
      setIsFormValid(true);
    }
  }, [formData, step, shippingError]);

  useEffect(() => {
    console.log("=== FORM VALIDATION DEBUG ===");
    console.log("Current step:", step);
    console.log("Form data:", formData);
    console.log("Shipping cost:", shippingCost);
    console.log("Shipping error:", shippingError);
    console.log("Is form valid:", isFormValid);

    if (step === 1) {
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        state,
        pincode,
      } = formData;
      console.log("Field validation:");
      console.log("- firstName:", !!firstName, firstName);
      console.log("- lastName:", !!lastName, lastName);
      console.log("- email:", !!email, email);
      console.log("- phone:", !!phone, phone);
      console.log("- address:", !!address, address);
      console.log("- city:", !!city, city);
      console.log("- state:", !!state, state);
      console.log("- pincode:", !!pincode, pincode);
      console.log("- shippingError:", !shippingError, shippingError);
      console.log("- shipping !== null:", shippingCost !== null, shippingCost);

      const allFieldsValid =
        firstName &&
        lastName &&
        email &&
        phone &&
        address &&
        city &&
        state &&
        pincode;
      const shippingValid = !shippingError && shippingCost !== null;
      console.log("All fields valid:", allFieldsValid);
      console.log("Shipping valid:", shippingValid);
      console.log("Overall valid:", allFieldsValid && shippingValid);
    }
    console.log("==============================");
  }, [formData, step, shippingCost, shippingError, isFormValid]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "specialRequest" && value.length > maxSpecialRequestLength) {
      return;
    }

    // Ensure pincode is always a string
    const processedValue = name === "pincode" ? value.toString() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const canProceedToReview = () => {
    const { firstName, lastName, email, phone, address, city, state, pincode } =
      formData;
    const hasAllFields = [
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    ].every((field) => field && field.toString().trim().length > 0);
    const hasValidShipping = shippingCost !== null && !shippingError;
    return hasAllFields && hasValidShipping;
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateStep1 = () => {
    const { firstName, lastName, email, phone, address, city, state, pincode } =
      formData;

    // Check all required fields
    const requiredFields = [
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
    ];
    const allFieldsFilled = requiredFields.every(
      (field) => field && field.trim() !== ""
    );

    // Check shipping calculation
    const shippingValid =
      !shippingError && shippingCost !== null && shippingCost >= 0;

    return allFieldsFilled && shippingValid;
  };

  const nextStep = () => {
    if (isFormValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  // Calculate shipping
  const calculateShipping = () => {
    return shippingCost !== null ? parseFloat(shippingCost) : 0;
  };

  // Calculate COD fee
  const calculateCODFee = () => {
    return formData.paymentMethod === "cod" ? COD_FEE : 0;
  };

  // Calculate total (subtotal + shipping + COD fee)
  const calculateTotal = () => {
    const subtotal = parseFloat(calculateSubtotal());
    const shipping = calculateShipping();
    const codFee = calculateCODFee();
    return (subtotal + shipping + codFee).toFixed(2);
  };

  const handlePayment = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      if (formData.paymentMethod === "cod") {
        // Handle COD order
        await handleSubmitOrder(orderId);
      } else {
        // Existing PayU payment logic
        if (!scriptLoaded || !window.bolt) {
          await loadBoltScript();
        }
        if (!window.bolt) {
          throw new Error(
            "PayU Bolt SDK failed to load. Please refresh the page."
          );
        }
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
            formData.paymentMethod === "card"
              ? "CC"
              : formData.paymentMethod.toUpperCase(),
        };
        const response = await fetch("/api/payu-hash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentParams),
        });
        if (!response.ok) {
          throw new Error(
            `Failed to generate payment hash: ${response.statusText}`
          );
        }
        const { hash } = await response.json();
        if (!hash) {
          throw new Error("No hash returned from server");
        }
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
                await handleSubmitOrder(orderId);
              } else if (response.response.txnStatus === "FAILED") {
                setError("Payment failed. Please try again.");
                setIsSubmitting(false);
              } else if (response.response.txnStatus === "CANCEL") {
                setError("Payment was cancelled. Please try again.");
                setIsSubmitting(false);
              }
            },
            catchException: (error) => {
              setError(`Payment error: ${error.message || "Network error"}`);
              setIsSubmitting(false);
            },
          }
        );
      }
    } catch (err) {
      setError(`Payment failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const handleSubmitOrder = async (orderId) => {
    try {
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
            hsn_code: item.hsn_code || "7113",
            weight: item.weight || 0.1,
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
          codFee: calculateCODFee(), // Store COD fee
          total: parseFloat(calculateTotal()),
          itemCount: cartItems.reduce(
            (total, item) => total + item.quantity,
            0
          ),
        },
        paymentInfo: {
          method: formData.paymentMethod, // Store the payment method (including 'cod')
          status: formData.paymentMethod === "cod" ? "pending" : "completed",
        },
        shippingInfo: {
          awb_number: null,
          courier_name: null,
          estimated_delivery: null,
          status: "pending",
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

      // Save order to Firestore
      const docRef = await addDoc(collection(db, "orders"), orderData);

      // Send customer thank you email
      try {
        const customerEmailResponse = await fetch("/api/send-customer-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderData }),
        });

        if (!customerEmailResponse.ok) {
          console.error("Failed to send customer email");
        } else {
          console.log("Customer thank you email sent successfully");
        }
      } catch (customerEmailError) {
        console.error("Customer email error:", customerEmailError);
      }

      // Send admin notification email
      try {
        const adminEmailResponse = await fetch("/api/send-order-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderData }),
        });

        if (!adminEmailResponse.ok) {
          console.error("Failed to send admin notification email");
        } else {
          console.log("Admin notification email sent successfully");
        }
      } catch (adminEmailError) {
        console.error("Admin email error:", adminEmailError);
      }

      // Clear cart and redirect
      localStorage.removeItem("cartItems");
      localStorage.setItem("lastOrderId", orderId);
      localStorage.setItem("firestoreOrderId", docRef.id);
      router.push(`/order-confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error("Order submission error:", err);
      setError(`Failed to place order: ${err.message}`);
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
                  {shippingError && (
                    <p className={styles.error}>{shippingError}</p>
                  )}
                  {shippingCost !== null && !shippingError && (
                    <p className={styles.shippingInfo}>
                      Shipping Cost: ₹{shippingCost.toFixed(2)}
                    </p>
                  )}
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
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleChange}
                  />
                  <label htmlFor="cod">Cash on Delivery</label>
                  <span className={styles.codNote}>
                    (Additional ₹50 COD handling fee applies)
                  </span>
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

              {!scriptLoaded && formData.paymentMethod !== "cod" && (
                <div className={styles.scriptLoading}>
                  <p>Loading payment gateway...</p>
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
                {shippingError
                  ? "Enter pincode"
                  : shippingCost !== null
                  ? `₹${shippingCost.toFixed(2)}`
                  : "Enter pincode"}
              </span>
            </div>
            {formData.paymentMethod === "cod" && (
              <div className={styles.calculationRow}>
                <span>COD Fee</span>
                <span>₹{COD_FEE.toFixed(2)}</span>
              </div>
            )}
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
            title={`Form Valid: ${isFormValid}, Submitting: ${isSubmitting}`}
          >
            {step === 1 ? "Review Order" : "Continue to Payment"}
          </button>
        ) : (
          <button
            onClick={handlePayment}
            className={styles.placeOrderButton}
            disabled={
              isSubmitting ||
              (!scriptLoaded && formData.paymentMethod !== "cod") ||
              shippingCost === null
            }
          >
            {isSubmitting
              ? "Processing..."
              : formData.paymentMethod === "cod"
              ? "Place Order"
              : "Pay Now"}
          </button>
        )}
      </div>
    </div>
  );
}
