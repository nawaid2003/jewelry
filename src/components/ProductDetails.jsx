import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/ProductDetails.module.scss";

export default function ProductDetails({ product, onClose, onCartUpdate }) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fallbackImage = "/images/fallback-product.jpg";

  if (!product) {
    return null;
  }

  const handleAddToCart = () => {
    setIsLoading(true);

    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingItem = cartItems.find((item) => item.id === product.id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    // Update parent component's cartItems state
    if (onCartUpdate) {
      onCartUpdate();
    }

    requestAnimationFrame(() => {
      setShowConfirmation(true);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 3000);
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

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.productDetails}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.contentWrapper}>
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
            {showConfirmation && (
              <div className={styles.confirmation}>
                <p>Product Added to Cart!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
