import { useRouter } from "next/router";
import styles from "../styles/ProductDetails.module.scss";

export default function ProductDetails({ product, onClose }) {
  const router = useRouter();

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
    router.push("/cart");
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
                <ul>
                  {product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              ) : (
                <p>No details available.</p>
              )}
            </div>
            <p className={styles.price}>${product.price.toFixed(2)}</p>
            <button
              onClick={handleAddToCart}
              className={styles.addToCartButton}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
