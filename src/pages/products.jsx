import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import AdminProductForm from "../components/AdminProductForm";
import AdminLogin from "../components/AdminLogin";
import styles from "../styles/products.module.scss";

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Moonlight Necklace",
      price: 299,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Necklace",
      description:
        "Elegant sterling silver necklace inspired by the soft glow of moonlight. Perfect for both casual and formal occasions, this piece features a delicate pendant that catches the light beautifully.",
      details: [
        "Sterling Silver",
        "18-inch chain",
        "Handcrafted",
        "Includes gift box",
      ],
      category: "Necklaces",
    },
    {
      id: 2,
      name: "Starlight Ring",
      price: 499,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Ring",
      description:
        "A stunning ring that captures the essence of a starry night. Set with premium cubic zirconia that sparkle like distant stars, this ring makes a perfect gift for someone special.",
      details: [
        "White Gold Plated",
        "Size adjustable",
        "Premium CZ stones",
        "Tarnish resistant",
      ],
      category: "Rings",
    },
    {
      id: 3,
      name: "Dawn Earrings",
      price: 199,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Earrings",
      description:
        "Beautifully crafted drop earrings that evoke the first light of dawn. These lightweight earrings bring a touch of elegance to any outfit.",
      details: [
        "Rose Gold Finish",
        "Hypoallergenic posts",
        "Lightweight design",
        "1.5 inches in length",
      ],
      category: "Earrings",
    },
    {
      id: 4,
      name: "Twilight Bracelet",
      price: 349,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Bracelet",
      description:
        "A versatile bracelet inspired by the magical moments of twilight. Features an adjustable chain and delicate charms that complement any wrist.",
      details: [
        "Gold Plated",
        "Adjustable size",
        "Water resistant",
        "Signature clasp",
      ],
      category: "Bracelets",
    },
  ]);

  // Check if admin is already logged in (from sessionStorage)
  useEffect(() => {
    const adminLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
    setIsAdminLoggedIn(adminLoggedIn);
  }, []);

  // Load products from localStorage on component mount (if available)
  useEffect(() => {
    const savedProducts = localStorage.getItem("jewelryProducts");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("jewelryProducts", JSON.stringify(products));
  }, [products]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const toggleAdminForm = () => {
    if (isAdminLoggedIn) {
      setShowAdminForm(!showAdminForm);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = (success) => {
    setIsAdminLoggedIn(success);
    setShowAdminLogin(false);

    if (success) {
      sessionStorage.setItem("adminLoggedIn", "true");
      setShowAdminForm(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminForm(false);
    sessionStorage.removeItem("adminLoggedIn");
  };

  const addNewProduct = (newProduct) => {
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    const productToAdd = {
      ...newProduct,
      id: newId,
      image:
        newProduct.image ||
        `https://placehold.co/300x300/F8F1E9/D4A373?text=${encodeURIComponent(
          newProduct.name
        )}`,
    };

    setProducts([...products, productToAdd]);
    setShowAdminForm(false);
  };

  // Filter products based on selected category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  // Define available categories
  const categories = ["All", "Necklaces", "Rings", "Earrings", "Bracelets"];

  return (
    <div className={styles.productsContainer}>
      <h1>Our Collections</h1>

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

      {/* Admin Panel - Only visible to admins or when logging in */}
      {isAdminLoggedIn && (
        <div className={styles.adminPanel}>
          <div className={styles.adminHeader}>
            <h2>Admin Panel</h2>
            <button
              className={styles.adminLogoutButton}
              onClick={handleAdminLogout}
            >
              Logout
            </button>
          </div>

          <button
            className={styles.adminToggleButton}
            onClick={() => setShowAdminForm(!showAdminForm)}
          >
            {showAdminForm ? "Hide Product Form" : "Add New Product"}
          </button>

          {showAdminForm && <AdminProductForm onAddProduct={addNewProduct} />}
        </div>
      )}

      {!isAdminLoggedIn && (
        <button
          className={styles.hiddenAdminButton}
          onClick={() => setShowAdminLogin(true)}
          aria-label="Admin Login"
        >
          ⚙️
        </button>
      )}

      {showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {/* Products Grid */}
      <div className={styles.productsGrid}>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={() => handleProductSelect(product)}
          />
        ))}
      </div>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={closeProductDetails}
        />
      )}
    </div>
  );
}
