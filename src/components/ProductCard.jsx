import styles from "../styles/products.module.scss";

export default function ProductCard({ product, onSelect }) {
  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
    localStorage.setItem("cartItems", JSON.stringify(cart));
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className={styles.productCard}>
      <img
        src={product.image}
        alt={product.name}
        className={styles.productImage}
        onClick={() => onSelect(product)}
      />
      <div className={styles.productInfo}>
        <h3>{product.name}</h3>
        <p>${product.price.toFixed(2)}</p>
        <button className={styles.addToCartButton} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}
