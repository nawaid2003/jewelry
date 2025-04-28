import Link from "next/link";
import styles from "../styles/footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3>Silver Lining</h3>
          <p>Illuminating elegance since 1995.</p>
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
          <h3>Contact</h3>
          <p>Email: info@silverliningjewelry.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© 2025 Silver Lining. All rights reserved.</p>
      </div>
    </footer>
  );
}
