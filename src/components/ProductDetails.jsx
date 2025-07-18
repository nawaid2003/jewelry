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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fallbackImage = "/images/fallback-product.jpg";

  const isRing =
    product?.category?.toLowerCase().includes("ring") ||
    product?.name?.toLowerCase().includes("ring") ||
    product?.type?.toLowerCase().includes("ring");

  const sizeOptions = Array.from({ length: 22 }, (_, i) => i + 4);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

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

    if (isRing && !selectedSize && !customSize) {
      alert("Please select a ring size before adding to cart.");
      return;
    }

    if (isRing && showCustomInput && !customSize.trim()) {
      alert("Please enter your custom ring size.");
      return;
    }

    setIsLoading(true);
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    const finalSize = showCustomInput ? customSize.trim() : selectedSize;

    const productWithSize = {
      ...product,
      cartItemId: isRing ? `${product.id}-${finalSize}` : product.id,
      ...(isRing && {
        ringSize: {
          value: finalSize,
          type: showCustomInput ? "custom" : "standard",
          isCustom: showCustomInput,
        },
        selectedSize: finalSize,
        sizeType: showCustomInput ? "custom" : "standard",
      }),
    };

    const existingItem = cartItems.find((item) => {
      if (isRing) {
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
    const details = [];
    if (product.weight) {
      details.push(`Weight: ${product.weight} grams`);
    }
    if (product.details && Array.isArray(product.details)) {
      details.push(...product.details);
    }

    if (details.length === 0) {
      return <p className={styles.noDetails}>No details available.</p>;
    }

    return (
      <div className={styles.detailsCard}>
        <ul className={styles.detailsList}>
          {details.map((detail, index) => (
            <li key={index} className={styles.detailItem}>
              {detail}
            </li>
          ))}
        </ul>
      </div>
    );
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
              <div className={styles.slideshow}>
                <img
                  src={
                    product.images?.[currentImageIndex] ||
                    product.image ||
                    fallbackImage
                  }
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                />
                {product.images?.length > 1 && (
                  <>
                    <button
                      className={styles.prevButton}
                      onClick={handlePrevImage}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      className={styles.nextButton}
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      ›
                    </button>
                    <div className={styles.dots}>
                      {product.images.map((_, index) => (
                        <span
                          key={index}
                          className={`${styles.dot} ${
                            index === currentImageIndex ? styles.active : ""
                          }`}
                          onClick={() => handleDotClick(index)}
                          aria-label={`Go to image ${index + 1}`}
                        ></span>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
