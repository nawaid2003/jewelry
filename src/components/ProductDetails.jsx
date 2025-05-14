import styles from "../styles/products.module.scss";

export default function ProductDetails({ product, onClose }) {
  if (!product) {
    return null; // Early return if product is undefined
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose}></div>
      <div className={styles.productDetails}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
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
      </div>
    </>
  );
}
