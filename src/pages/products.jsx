import ProductCard from "../components/ProductCard";
import styles from "../styles/products.module.scss";

export default function Products() {
  const products = [
    {
      id: 1,
      name: "Moonlight Necklace",
      price: 299,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Necklace",
    },
    {
      id: 2,
      name: "Starlight Ring",
      price: 499,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Ring",
    },
    {
      id: 3,
      name: "Dawn Earrings",
      price: 199,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Earrings",
    },
    {
      id: 4,
      name: "Twilight Bracelet",
      price: 349,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Bracelet",
    },
  ];

  return (
    <div className={styles.productsContainer}>
      <h1>Our Collections</h1>
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
