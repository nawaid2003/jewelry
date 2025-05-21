import Link from "next/link";
import styles from "../styles/footer.module.scss";
import Image from "next/image";
import logoSL from "../images/logoSL.png";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div className={styles.logoContainer}>
            <div className={styles.logoImage}>
              <Image
                src={logoSL}
                alt="Silver Lining Logo"
                width={65}
                height={65}
                priority
              />
            </div>
            <div className={styles.logoText}>
              <h3>Silver Lining</h3>
              <p>Where Hope Meets Elegance.</p>
            </div>
          </div>
          <p>
            Discover exquisite jewelry pieces that celebrate life's precious
            moments and milestones.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3>Explore</h3>
          <ul>
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
        </div>

        <div className={styles.footerSection}>
          <h3>Policies</h3>
          <ul>
            <li>
              <Link href="/TermsAndConditions">Terms & Conditions</Link>
            </li>
            <li>
              <Link href="/PrivacyPolicy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/RefundPolicy">Refund Policy</Link>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Size Guide</h3>
          <p>
            Find your perfect fit with our comprehensive sizing information.
          </p>
          <Link href="/size-guide" className={styles.sizeGuideButton}>
            <svg
              className={styles.buttonIcon}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className={styles.buttonText}>View Size Guide</span>
          </Link>
        </div>

        <div className={styles.footerSection}>
          <h3>Contact</h3>
          <p>Email: test@silverliningjewelry.com</p>
          <p>Phone: 123 456-7890</p>
          <p>Address: Itwari, Nagpur</p>
        </div>

        <div className={styles.footerSection}>
          <h3>Follow Us</h3>
          <div className={styles.socialLinks}>
            <a
              href="https://instagram.com/silverliningjewelry"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="Instagram"
            >
              <div className={styles.socialIconWrapper}>
                <svg
                  className={styles.socialIcon}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span className={styles.socialText}>Instagram</span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Silver Lining. All rights reserved.</p>
      </div>
    </footer>
  );
}
