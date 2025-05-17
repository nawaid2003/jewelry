import { useRouter } from "next/router";
import styles from "../styles/ProductCard.module.scss";

export default function ProductCard({ product, onSelect }) {
  const router = useRouter();

  return (
    <div className={styles.productCard}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      {product.description &&
      Array.isArray(product.description) &&
      product.description.length > 0 ? (
        <ul>
          {product.description.slice(0, 2).map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
          {product.description.length > 2 && <li>...</li>}
        </ul>
      ) : (
        <p>{product.description || "No description available."}</p>
      )}
      <p className={styles.price}>₹{product.price.toFixed(2)}</p>
      <div className={styles.buttonGroup}>
        <button onClick={onSelect} className={styles.viewDetailsButton}>
          View Details
        </button>
      </div>
    </div>
  );
}
