import { useState } from "react";
import AdminLogin from "../../components/AdminLogin";
import AdminProductForm from "../../components/AdminProductForm";
import styles from "../../styles/AdminPage.module.scss";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState([]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
  };

  return (
    <div className={styles.productsContainer}>
      <h1>Admin Dashboard</h1>
      {!isAuthenticated ? (
        <AdminLogin onLogin={handleLogin} />
      ) : (
        <div className={styles.adminPanel}>
          <div className={styles.adminHeader}>
            <h2>Manage Products</h2>
            <button onClick={handleLogout} className={styles.adminLogoutButton}>
              Logout
            </button>
          </div>
          <AdminProductForm onAddProduct={handleAddProduct} />
        </div>
      )}
    </div>
  );
}
