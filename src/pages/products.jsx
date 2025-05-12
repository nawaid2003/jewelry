import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import styles from "../styles/products.module.scss";

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsData);
        console.log("Fetched products from Firestore:", productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const categories = ["All", "Necklaces", "Rings", "Earrings", "Bracelets"];

  return (
    <div className={styles.productsContainer}>
      <h1>Our Collections</h1>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Category Filter */}
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

      {/* Products Grid or No Results Message */}
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

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={closeProductDetails}
        />
      )}
    </div>
  );
}
