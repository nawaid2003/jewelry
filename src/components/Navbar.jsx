// components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { SignupForm, LoginForm } from "./AuthForms";
import logoSL from "../images/logoSL.png";
import styles from "../styles/navbar.module.scss";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
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

  const handleProfileClick = () => {
    console.log("Profile icon clicked, user:", user);
    if (user) {
      router.push("/profile");
    } else {
      setShowProfileDropdown(!showProfileDropdown);
    }
  };

  const handleLoginClick = (e) => {
    e.stopPropagation();
    console.log("Login button clicked");
    setShowLogin(true);
    setShowSignup(false);
    setShowProfileDropdown(false);
  };

  const handleSignupClick = (e) => {
    e.stopPropagation();
    console.log("Sign Up button clicked");
    setShowSignup(true);
    setShowLogin(false);
    setShowProfileDropdown(false);
  };

  // Close dropdown when clicking outside, but not on dropdown buttons
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isDropdownClick =
        (dropdownRef.current && dropdownRef.current.contains(event.target)) ||
        (mobileDropdownRef.current &&
          mobileDropdownRef.current.contains(event.target));
      const isButtonClick = event.target.closest(`.${styles.dropdownItem}`);

      if (!isDropdownClick && !isButtonClick) {
        console.log("Clicked outside dropdown, closing");
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

  // Debug rendering
  console.log("Navbar render:", { showLogin, showSignup, showProfileDropdown });

  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <div className={styles.logoContainer}>
            <div className={styles.logoImage}>
              <img
                src={logoSL.src}
                alt="Silver Lining Logo"
                width={50}
                height={50}
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
            onClick={handleProfileClick}
            aria-label="Profile menu"
          >
            <div className={styles.profileIcon}>
              {user ? getInitials() : "?"}
            </div>
          </button>

          {showProfileDropdown && !user && (
            <div className={styles.profileDropdown}>
              <button
                onClick={handleLoginClick}
                className={styles.dropdownItem}
              >
                <span className={styles.dropdownIcon}>🔐</span>
                Login
              </button>
              <button
                onClick={handleSignupClick}
                className={styles.dropdownItem}
              >
                <span className={styles.dropdownIcon}>✨</span>
                Sign Up
              </button>
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
              onClick={handleProfileClick}
              aria-label="Profile menu"
            >
              <div className={styles.profileIconMobile}>
                {user ? getInitials() : "?"}
              </div>
            </button>

            {showProfileDropdown && !user && (
              <div className={styles.profileDropdownMobile}>
                <button
                  onClick={handleLoginClick}
                  className={styles.dropdownItem}
                >
                  <span className={styles.dropdownIcon}>🔐</span>
                  Login
                </button>
                <button
                  onClick={handleSignupClick}
                  className={styles.dropdownItem}
                >
                  <span className={styles.dropdownIcon}>✨</span>
                  Sign Up
                </button>
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

      {showLogin && (
        <LoginForm
          onClose={() => {
            console.log("Closing LoginForm");
            setShowLogin(false);
          }}
        />
      )}
      {showSignup && (
        <SignupForm
          onClose={() => {
            console.log("Closing SignupForm");
            setShowSignup(false);
          }}
        />
      )}
    </nav>
  );
}
