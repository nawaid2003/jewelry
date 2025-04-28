import Image from "next/image";
import Link from "next/link";
import styles from "../styles/products.module.scss";

export default function ProductCard({ product }) {
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
      <Link href={`/products/${product.id}`}>
        <button className={styles.productButton}>View Details</button>
      </Link>
    </div>
  );
}
