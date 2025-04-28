import Image from "next/image";
import Link from "next/link";
import styles from "../styles/home.module.scss";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <Image
          src="https://placehold.co/1200x600/F8F1E9/D4A373?text=Silver+Lining+Hero"
          alt="Silver Lining Jewelry Hero"
          width={1200}
          height={600}
          className={styles.heroImage}
        />
        <div className={styles.heroText}>
          <h1>Silver Lining Elegance</h1>
          <p>Crafted to illuminate your moments with timeless beauty.</p>
          <Link href="/products">
            <button className={styles.ctaButton}>Explore Collections</button>
          </Link>
        </div>
      </section>
      <section className={styles.intro}>
        <h2>Discover Our Craft</h2>
        <p>
          From delicate necklaces to radiant rings, each piece tells a story of
          artistry.
        </p>
        <Link href="/products" className={styles.introLink}>
          Shop Now
        </Link>
      </section>
    </div>
  );
}
