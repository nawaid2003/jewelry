import { useState, useEffect } from "react";
import AdminLogin from "../../components/AdminLogin";
import AdminProductForm from "../../components/AdminProductForm";
import styles from "../../styles/products.module.scss";

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [products, setProducts] = useState([]);

  // Check admin login status and load products on mount
  useEffect(() => {
    const adminLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
    setIsAdminLoggedIn(adminLoggedIn);
    setShowAdminLogin(!adminLoggedIn);

    const savedProducts = localStorage.getItem("jewelryProducts");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Sync products to localStorage
  useEffect(() => {
    localStorage.setItem("jewelryProducts", JSON.stringify(products));
    console.log("Updated localStorage with products:", products);
  }, [products]);

  const handleAdminLogin = (success) => {
    setIsAdminLoggedIn(success);
    setShowAdminLogin(false);
    if (success) {
      sessionStorage.setItem("adminLoggedIn", "true");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("adminLoggedIn");
    setShowAdminLogin(true);
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
    console.log("Added new product:", productToAdd);
  };

  return (
    <div className={styles.productsContainer}>
      <h1>Admin Dashboard</h1>

      {isAdminLoggedIn ? (
        <div className={styles.adminPanel}>
          <div className={styles.adminHeader}>
            <h2>Manage Products</h2>
            <button
              className={styles.adminLogoutButton}
              onClick={handleAdminLogout}
            >
              Logout
            </button>
          </div>
          <AdminProductForm onAddProduct={addNewProduct} />
        </div>
      ) : (
        showAdminLogin && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onClose={() => setShowAdminLogin(false)}
          />
        )
      )}
    </div>
  );
}
