import { useRouter } from "next/router";
import styles from "../styles/products.module.scss";

export default function ProductCard({ product, onSelect }) {
  const router = useRouter();

  const handleAddToCart = () => {
    // Load existing cart from localStorage
    const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

    // Check if the product is already in the cart
    const existingItem = cartItems.find((item) => item.id === product.id);
    let updatedCart;

    if (existingItem) {
      // Update quantity if the product exists
      updatedCart = cartItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      // Add new product with quantity 1
      updatedCart = [...cartItems, { ...product, quantity: 1 }];
    }

    // Save updated cart to localStorage
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    // Navigate to cart page
    router.push("/cart");
  };

  return (
    <div className={styles.productCard}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <p className={styles.price}>${product.price.toFixed(2)}</p>
      <div className={styles.buttonGroup}>
        <button onClick={onSelect} className={styles.viewDetailsButton}>
          View Details
        </button>
        <button onClick={handleAddToCart} className={styles.addToCartButton}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
