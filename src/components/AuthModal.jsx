// components/AuthModal.js
import { useState } from "react";
import { LoginForm } from "./AuthForms";
import { SignupForm } from "./AuthForms";
import styles from "../styles/AuthForms.module.scss";

export function AuthModal({ onClose, onAuthSuccess, initialTab = "login" }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleAuthSuccess = () => {
    onClose();
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  return (
    <div className={styles.authOverlay}>
      <div className={styles.authForm}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <div className={styles.tabContainer}>
          <button
            className={`${styles.tab} ${
              activeTab === "login" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "signup" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>
        {activeTab === "login" ? (
          <LoginForm onClose={handleAuthSuccess} />
        ) : (
          <SignupForm onClose={handleAuthSuccess} />
        )}
      </div>
    </div>
  );
}
