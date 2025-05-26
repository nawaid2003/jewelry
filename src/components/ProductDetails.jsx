// components/ProductDetails.js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./AuthModal";
import styles from "../styles/ProductDetails.module.scss";

export default function ProductDetails({
  product,
  onClose,
  onCartUpdate,
  onShowLoginMessage,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const fallbackImage = "/images/fallback-product.jpg";

  // Check if product is a ring (you can adjust this logic based on your product categorization)
  const isRing =
    product?.category?.toLowerCase().includes("ring") ||
    product?.name?.toLowerCase().includes("ring") ||
    product?.type?.toLowerCase().includes("ring");

  // Generate size options from 4 to 25
  const sizeOptions = Array.from({ length: 22 }, (_, i) => i + 4);

  if (!product) {
    return null;
  }

  const handleSizeSelect = (size) => {
    if (size === "custom") {
      setShowCustomInput(true);
      setSelectedSize("custom");
    } else {
      setSelectedSize(size.toString());
      setShowCustomInput(false);
      setCustomSize("");
    }
    setSizeDropdownOpen(false);
  };

  const handleCustomSizeChange = (e) => {
    setCustomSize(e.target.value);
  };

  const getSelectedSizeDisplay = () => {
    if (showCustomInput) {
      return customSize || "Enter custom size";
    }
    return selectedSize || "Select Size";
  };

  const handleAddToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      onShowLoginMessage();
      onClose();
      return;
    }

    // Check if ring requires size selection
    if (isRing && !selectedSize && !customSize) {
      alert("Please select a ring size before adding to cart.");
      return;
    }

    // Check if custom size is selected but no value is entered
    if (isRing && showCustomInput && !customSize.trim()) {
      alert("Please enter your custom ring size.");
      return;
    }

    setIsLoading(true);
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    // Get the final size value
    const finalSize = showCustomInput ? customSize.trim() : selectedSize;

    // Create product with size information - Enhanced structure
    const productWithSize = {
      ...product,
      // Add unique identifier for cart item (important for rings with different sizes)
      cartItemId: isRing ? `${product.id}-${finalSize}` : product.id,
      // Ring-specific properties
      ...(isRing && {
        ringSize: {
          value: finalSize,
          type: showCustomInput ? "custom" : "standard",
          isCustom: showCustomInput,
        },
        // Legacy properties for backward compatibility
        selectedSize: finalSize,
        sizeType: showCustomInput ? "custom" : "standard",
      }),
    };

    // For rings, treat different sizes as different items
    const existingItem = cartItems.find((item) => {
      if (isRing) {
        // Check both new and legacy structure for compatibility
        const itemSize = item.ringSize?.value || item.selectedSize;
        return item.id === product.id && itemSize === finalSize;
      }
      return item.id === product.id;
    });

    let updatedCart;

    if (existingItem) {
      updatedCart = cartItems.map((item) => {
        if (isRing) {
          const itemSize = item.ringSize?.value || item.selectedSize;
          return item.id === product.id && itemSize === finalSize
            ? { ...item, quantity: item.quantity + 1 }
            : item;
        }
        return item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item;
      });
    } else {
      updatedCart = [...cartItems, { ...productWithSize, quantity: 1 }];
    }

    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    if (onCartUpdate) {
      onCartUpdate();
    }

    setIsFadingOut(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowConfirmation(true);
    }, 300);
  };

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
        setIsFadingOut(false);
        onClose();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showConfirmation, onClose]);

  const renderDescription = () => {
    if (!product.description) {
      return <p>No description available.</p>;
    }

    if (Array.isArray(product.description)) {
      return (
        <ul>
          {product.description.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
      );
    }

    return <p>{product.description}</p>;
  };

  const renderDetails = () => {
    if (
      !product.details ||
      (Array.isArray(product.details) && product.details.length === 0)
    ) {
      return <p className={styles.noDetails}>No details available.</p>;
    }

    if (Array.isArray(product.details)) {
      return (
        <div className={styles.detailsCard}>
          <ul className={styles.detailsList}>
            {product.details.map((detail, index) => (
              <li key={index} className={styles.detailItem}>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return <p>{JSON.stringify(product.details)}</p>;
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div
        className={`${styles.productDetails} ${
          showConfirmation ? styles.confirmationMode : ""
        }`}
        onClick={handleModalClick}
      >
        <button
          className={styles.closeButton}
          onClick={onClose}
          style={{ display: showConfirmation ? "none" : "block" }}
        >
          ×
        </button>
        {showConfirmation ? (
          <div className={styles.confirmation}>
            <p>Product Added to Cart!</p>
          </div>
        ) : (
          <div
            className={`${styles.contentWrapper} ${
              isFadingOut ? styles.fadeOut : ""
            }`}
          >
            <div className={styles.imageContainer}>
              <img src={product.image || fallbackImage} alt={product.name} />
            </div>
            <div className={styles.detailsContainer}>
              <h2>{product.name}</h2>
              <div className={styles.descriptionSection}>
                <h3>Description</h3>
                {renderDescription()}
              </div>
              <div className={styles.detailsSection}>
                <h3>Details</h3>
                {renderDetails()}
              </div>

              {/* Ring Size Selection */}
              {isRing && (
                <div className={styles.sizeSection}>
                  <h3>Ring Size</h3>
                  <div className={styles.sizeSelector}>
                    <div
                      className={`${styles.sizeDropdown} ${
                        sizeDropdownOpen ? styles.open : ""
                      }`}
                      onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                    >
                      <span className={styles.sizeDisplay}>
                        {getSelectedSizeDisplay()}
                      </span>
                      <span className={styles.dropdownArrow}>▼</span>
                    </div>

                    {sizeDropdownOpen && (
                      <div className={styles.sizeOptions}>
                        <div className={styles.sizeOptionsScroll}>
                          {sizeOptions.map((size) => (
                            <div
                              key={size}
                              className={`${styles.sizeOption} ${
                                selectedSize === size.toString()
                                  ? styles.selected
                                  : ""
                              }`}
                              onClick={() => handleSizeSelect(size)}
                            >
                              Size {size}
                            </div>
                          ))}
                          <div
                            className={`${styles.sizeOption} ${
                              styles.customOption
                            } ${
                              selectedSize === "custom" ? styles.selected : ""
                            }`}
                            onClick={() => handleSizeSelect("custom")}
                          >
                            Custom Size (25+)
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {showCustomInput && (
                    <div className={styles.customSizeInput}>
                      <input
                        type="text"
                        placeholder="Enter your ring size"
                        value={customSize}
                        onChange={handleCustomSizeChange}
                        className={styles.customInput}
                      />
                      <small className={styles.sizeHint}>
                        Enter your exact ring size (e.g., 25.5, 26, etc.)
                      </small>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.priceContainer}>
                <span className={styles.priceLabel}>Price</span>
                <span className={styles.priceAmount}>
                  ₹{product.price.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleAddToCart}
                className={styles.addToCartButton}
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          </div>
        )}
      </div>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}
