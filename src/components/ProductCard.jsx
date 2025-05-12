import styles from "../styles/products.module.scss";

export default function ProductCard({ product, onSelect }) {
  const handleAddToCart = () => {
    // Load current cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
    // Check if product is already in cart
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      // Increment quantity
      existingItem.quantity += 1;
    } else {
      // Add new item
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
    // Save updated cart
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
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button className={styles.addToCartButton} onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}
