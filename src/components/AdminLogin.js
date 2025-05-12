//AdminLogin.js

import { useState } from "react";
import styles from "../styles/products.module.scss";

export default function AdminLogin({ onLogin, onClose }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real application, you would validate against a secure backend
    // IMPORTANT: In production, NEVER hardcode credentials like this
    // This is only for demonstration purposes

    if (
      credentials.username === "admin" &&
      credentials.password === "admin123"
    ) {
      onLogin(true);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.loginModal}>
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2>Admin Login</h2>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
