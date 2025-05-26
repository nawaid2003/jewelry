// components/Toast.js
import { useState, useEffect } from "react";
import styles from "../styles/ProductDetails.module.scss";

export function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return <div className={styles.loginMessage}>{message}</div>;
}
