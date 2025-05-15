import { useRouter } from "next/router";
import styles from "../styles/ProductDetails.module.scss";

export default function ProductDetails({ product, onClose }) {
  const router = useRouter();

  if (!product) {
    return null;
  }

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
    router.push("/cart");
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.productDetails}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <img src={product.image} alt={product.name} />
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <p className={styles.price}>${product.price.toFixed(2)}</p>
        <h3>Details</h3>
        {product.details &&
        Array.isArray(product.details) &&
        product.details.length > 0 ? (
          <ul>
            {product.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        ) : (
          <p>No additional details available.</p>
        )}
        <button onClick={handleAddToCart} className={styles.addToCartButton}>
          Add to Cart
        </button>
      </div>
    </>
  );
}
