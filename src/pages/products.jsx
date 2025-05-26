// pages/products.jsx
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import { Toast } from "../components/Toast"; // Import Toast
import styles from "../styles/products.module.scss";

export default function Products() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const handleShowLoginMessage = () => setShowLoginMessage(true);
  const handleCloseLoginMessage = () => setShowLoginMessage(false);

  // Load products from Firestore
  useEffect(() => {
    setLoading(true);

    try {
      const productsQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        productsQuery,
        (snapshot) => {
          setLoading(false);

          if (snapshot.empty) {
            setError("No products found in the database.");
            setProducts([]);
            return;
          }

          const fetchedProducts = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              description:
                typeof data.description === "string"
                  ? data.description
                  : Array.isArray(data.description)
                  ? data.description.join(", ")
                  : "No description available",
              details: Array.isArray(data.details)
                ? data.details
                : data.details
                ? [data.details]
                : [],
              image: data.image || "/images/fallback-product.jpg",
            };
          });

          setProducts(fetchedProducts);
        },
        (err) => {
          console.error("Error fetching products:", err);
          setError("Failed to load products. Please try again later.");
          setLoading(false);
          setProducts([]);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up Firestore listener:", err);
      setError("Failed to connect to database.");
      setLoading(false);
      setProducts([]);
    }
  }, []);

  // Sync cartItems with localStorage on mount
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(items);
  }, []);

  // Callback to update cartItems state
  const updateCartItems = () => {
    const items = JSON.parse(localStorage.getItem("cartItems")) || [];
    setCartItems(items);
  };

  // Calculate total number of items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof product.description === "string" &&
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (Array.isArray(product.description) &&
            product.description.some((desc) =>
              desc.toLowerCase().includes(searchQuery.toLowerCase())
            )) ||
          (Array.isArray(product.details) &&
            product.details.some((detail) =>
              detail.toLowerCase().includes(searchQuery.toLowerCase())
            ));

    return matchesCategory && matchesSearch;
  });

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleGoToCart = () => {
    router.push("/cart");
  };

  const categories = ["All", "Necklaces", "Rings", "Earrings", "Bracelets"];

  return (
    <div className={styles.productsContainer}>
      <h1 className={styles.productsTitle}>Our Collections</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.categoryFilter}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <p className={styles.loadingMessage}>Loading products...</p>}

      {error && <p className={styles.errorMessage}>{error}</p>}

      {!loading && (
        <>
          {filteredProducts.length > 0 ? (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => handleProductSelect(product)}
                />
              ))}
            </div>
          ) : (
            <p className={styles.noResults}>
              No products found for this category or search query.
            </p>
          )}
        </>
      )}

      {cartItems.length > 0 && (
        <button onClick={handleGoToCart} className={styles.floatingCartButton}>
          Go to Cart ({totalItems})
        </button>
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={closeProductDetails}
          onCartUpdate={updateCartItems}
          onShowLoginMessage={handleShowLoginMessage} // Pass the handler
        />
      )}

      <Toast
        message="Please log in to continue shopping"
        show={showLoginMessage}
        onClose={handleCloseLoginMessage}
      />
    </div>
  );
}
