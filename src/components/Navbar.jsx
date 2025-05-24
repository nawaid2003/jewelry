import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { SignupForm, LoginForm } from "./AuthForms";
import logoSL from "../images/logoSL.png";
import styles from "../styles/navbar.module.scss";

export default function Navbar() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get user's initials for the avatar
  const getInitials = () => {
    if (!user?.displayName) return user?.email?.[0]?.toUpperCase() || "U";
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

      {/* Desktop Navigation Links */}
      <ul className={styles.desktopNavLinks}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/products">Products</Link>
        </li>
        <li>
          <Link href="/design">Design</Link>
        </li>
        <li>
          <Link href="/faq">FAQ</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>

      {/* Desktop Profile Icon */}
      <div className={styles.desktopProfileSection}>
        <div className={styles.profileIconContainer} ref={dropdownRef}>
          <button
            className={styles.profileIconButton}
            onClick={toggleProfileDropdown}
            aria-label="Profile menu"
          >
            <div className={styles.profileIcon}>
              {user ? getInitials() : "?"}
            </div>
          </button>

          {showProfileDropdown && (
            <div className={styles.profileDropdown}>
              {user ? (
                <>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.profileIconLarge}>
                      {getInitials()}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>
                        {user.displayName || "User"}
                      </span>
                      <span className={styles.userEmail}>{user.email}</span>
                    </div>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <Link
                    href="/profile"
                    className={styles.dropdownItem}
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <span className={styles.dropdownIcon}>👤</span>
                    View Profile
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setShowProfileDropdown(false);
                    }}
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownIcon}>🔐</span>
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowSignup(true);
                      setShowProfileDropdown(false);
                    }}
                    className={styles.dropdownItem}
                  >
                    <span className={styles.dropdownIcon}>✨</span>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Profile icon first, then hamburger */}
      <div className={styles.mobileControls}>
        <div className={styles.mobileProfileSection}>
          <div className={styles.profileIconContainer} ref={mobileDropdownRef}>
            <button
              className={styles.profileIconButton}
              onClick={toggleProfileDropdown}
              aria-label="Profile menu"
            >
              <div className={styles.profileIconMobile}>
                {user ? getInitials() : "?"}
              </div>
            </button>

            {showProfileDropdown && (
              <div className={styles.profileDropdownMobile}>
                {user ? (
                  <>
                    <div className={styles.dropdownHeader}>
                      <div className={styles.profileIconLarge}>
                        {getInitials()}
                      </div>
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {user.displayName || "User"}
                        </span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                    <Link
                      href="/profile"
                      className={styles.dropdownItem}
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <span className={styles.dropdownIcon}>👤</span>
                      View Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowLogin(true);
                        setShowProfileDropdown(false);
                      }}
                      className={styles.dropdownItem}
                    >
                      <span className={styles.dropdownIcon}>🔐</span>
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setShowSignup(true);
                        setShowProfileDropdown(false);
                      }}
                      className={styles.dropdownItem}
                    >
                      <span className={styles.dropdownIcon}>✨</span>
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <button className={styles.menuToggle} onClick={toggleMenu}>
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
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

      {showSignup && <SignupForm onClose={() => setShowSignup(false)} />}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
    </nav>
  );
}
