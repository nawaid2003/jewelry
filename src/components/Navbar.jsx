import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { SignupForm, LoginForm } from "./AuthForms";
import logoSL from "../images/logoSL.png";
import styles from "../styles/Navbar.module.scss";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Get user's initials for the avatar
  const getInitials = () => {
    if (!user?.displayName) return "U";
    const names = user.displayName.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <div className={styles.logoContainer}>
            <div className={styles.logoImage}>
              <Image
                src={logoSL}
                alt="Silver Lining Logo"
                width={50}
                height={50}
                priority
              />
            </div>
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
        {user ? (
          <>
            <li>
              <Link href="/profile" onClick={closeMenu}>
                <div className={styles.profileContainer}>
                  <span className={styles.profileAvatar}>{getInitials()}</span>
                  <span className={styles.profileText}>Profile</span>
                </div>
              </Link>
            </li>
            <li>
              <button onClick={logout} className={styles.authButton}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <button
                onClick={() => setShowSignup(true)}
                className={styles.authButton}
              >
                Sign Up
              </button>
            </li>
            <li>
              <button
                onClick={() => setShowLogin(true)}
                className={styles.authButton}
              >
                Login
              </button>
            </li>
          </>
        )}
      </ul>
      {showSignup && <SignupForm onClose={() => setShowSignup(false)} />}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </nav>
  );
}
