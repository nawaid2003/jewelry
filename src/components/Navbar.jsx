import { useState } from "react";
import Link from "next/link";
import styles from "../styles/navbar.module.scss";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <div className={styles.logoContainer}>
            <span className={styles.monogram}>SL</span>
            <div className={styles.logoText}>
              <span className={styles.brandName}>SILVER LINING</span>
              <span className={styles.tagline}>WHERE HOPE MEETS ELEGANCE</span>
            </div>
          </div>
        </Link>
      </div>
      <button className={styles.menuToggle} onClick={toggleMenu}>
        {isOpen ? "✕" : "☰"}
      </button>
      <ul className={`${styles.navLinks} ${isOpen ? styles.open : ""}`}>
        <li>
          <Link href="/" onClick={closeMenu}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/about" onClick={closeMenu}>
            About
          </Link>
        </li>
        <li>
          <Link href="/products" onClick={closeMenu}>
            Products
          </Link>
        </li>
        <li>
          <Link href="/design" onClick={closeMenu}>
            Design
          </Link>
        </li>
        <li>
          <Link href="/faq" onClick={closeMenu}>
            FAQ
          </Link>
        </li>
        <li>
          <Link href="/contact" onClick={closeMenu}>
            Contact
          </Link>
        </li>
      </ul>
    </nav>
  );
}
