import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/ProductDetails.module.scss";

export default function ProductDetails({ product, onClose }) {
  const router = useRouter();
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!product) {
    return null;
  }

  // Debug: Log product data to check description and details
  console.log("ProductDetails product:", product);

  const handleAddToCart = () => {
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
    setShowConfirmation(true);
  };

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        setShowConfirmation(false);
        onClose(); // Close the modal after 3 seconds
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfirmation, onClose]);

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.productDetails}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.contentWrapper}>
          <div className={styles.imageContainer}>
            <img src={product.image} alt={product.name} />
          </div>
          <div className={styles.detailsContainer}>
            <h2>{product.name}</h2>
            <div className={styles.descriptionSection}>
              <h3>Description</h3>
              {product.description ? (
                Array.isArray(product.description) &&
                product.description.length > 0 ? (
                  <ul>
                    {product.description.map((desc, index) => (
                      <li key={index}>{desc}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{product.description}</p>
                )
              ) : (
                <p>No description available.</p>
              )}
            </div>
            <div className={styles.detailsSection}>
              <h3>Details</h3>
              {product.details &&
              Array.isArray(product.details) &&
              product.details.length > 0 ? (
                <div className={styles.detailsCard}>
                  <ul className={styles.detailsList}>
                    {product.details.map((detail, index) => (
                      <li key={index} className={styles.detailItem}>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className={styles.noDetails}>No details available.</p>
              )}
            </div>
            <div className={styles.priceContainer}>
              <span className={styles.priceLabel}>Price</span>
              <span className={styles.priceAmount}>
                ${product.price.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className={styles.addToCartButton}
            >
              Add to Cart
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
