import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import styles from "../styles/Cart.module.scss";

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const fallbackImage = "/images/fallback-product.jpg"; // Add fallback image

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    // Ensure each item has a single `image` field for display
    const normalizedItems = items.map((item) => ({
      ...item,
      image: item.images?.[0] || item.image || fallbackImage, // Prioritize first image from `images`
    }));
    setCartItems(normalizedItems);
  }, []);

  const updateCart = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
  };

  const handleQuantityChange = (cartItemId, delta) => {
    const updatedItems = cartItems
      .map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    updateCart(updatedItems);
  };

  const handleRemoveItem = (cartItemId) => {
    const updatedItems = cartItems.filter(
      (item) => item.cartItemId !== cartItemId
    );
    updateCart(updatedItems);
  };

  const calculateTotal = () => {
    return cartItems
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>Your Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="none"
              stroke={styles.primaryBlue}
              strokeWidth="2"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <p>
            Your cart is empty. Explore our products to find something you love!
          </p>
          <button
            onClick={() => router.push("/products")}
            className={styles.shopNowButton}
          >
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.cartItemId} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <img src={item.image || fallbackImage} alt={item.name} />
                </div>
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <p className={styles.itemPrice}>₹{item.price.toFixed(2)}</p>
                  <div className={styles.quantityControl}>
                    <button
                      onClick={() => handleQuantityChange(item.cartItemId, -1)}
                      className={styles.quantityButton}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.cartItemId, 1)}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveItem(item.cartItemId)}
                  className={styles.removeButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className={styles.cartSummary}>
            <div className={styles.totalContainer}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalAmount}>₹{calculateTotal()}</span>
            </div>
            <button onClick={handleCheckout} className={styles.checkoutButton}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
