import { useState, useEffect } from "react";
import AdminLogin from "../../components/AdminLogin";
import AdminProductForm from "../../components/AdminProductForm";
import styles from "../../styles/products.module.scss";

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");

  // Clear login status on mount
  useEffect(() => {
    sessionStorage.removeItem("adminLoggedIn");
    setIsAdminLoggedIn(false);
    setShowAdminLogin(true);
  }, []);

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
    // Show success message
    setSuccessMessage(`Product "${newProduct.name}" added successfully!`);
    // Hide message after 3 seconds
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
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
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}
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
