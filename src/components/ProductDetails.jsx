import Image from "next/image";
import styles from "../styles/products.module.scss";

export default function ProductDetails({ product, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.productDetails}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className={styles.detailsContent}>
          <div className={styles.detailsImageContainer}>
            <Image
              src={product.image}
              alt={product.name}
              width={400}
              height={400}
              className={styles.detailsImage}
            />
          </div>

          <div className={styles.detailsInfo}>
            <h2>{product.name}</h2>
            <p className={styles.price}>${product.price}</p>

            <div className={styles.tabs}>
              <div className={styles.tabContent}>
                <h3>Description</h3>
                <p>{product.description}</p>

                <h3>Details</h3>
                <ul>
                  {product.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button className={styles.addToCartButton}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
