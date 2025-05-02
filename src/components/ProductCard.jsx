import Image from "next/image";
import styles from "../styles/products.module.scss";

export default function ProductCard({ product, onSelect }) {
  return (
    <div className={styles.productCard}>
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={300}
        className={styles.productImage}
      />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button className={styles.productButton} onClick={onSelect}>
        View Details
      </button>
    </div>
  );
}
