import { useState, useEffect } from "react";
import styles from "../styles/products.module.scss";
import Link from "next/link";
import Image from "next/image";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart from localStorage
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(items);
  }, []);

  const updateCart = (updatedItems) => {
    setCartItems(updatedItems);
    localStorage.setItem("cartItems", JSON.stringify(updatedItems));
  };

  const handleQuantityChange = (id, delta) => {
    const updatedItems = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          if (newQuantity < 1) return null; // Remove item if quantity is 0
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
      .filter(Boolean); // Remove null items
    updateCart(updatedItems);
  };

  const handleRemoveItem = (id) => {
    const updatedItems = cartItems.filter((item) => item.id !== id);
    updateCart(updatedItems);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className={styles.productsContainer}>
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>
          Your cart is empty. <Link href="/">Shop now</Link>.
        </p>
      ) : (
        <div className={styles.cartTable}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.cartItem}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className={styles.cartItemImage}
                      />
                      {item.name}
                    </div>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className={styles.quantityButton}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.cartTotal}>
            <h2>Total: ${total.toFixed(2)}</h2>
            <button className={styles.checkoutButton}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
