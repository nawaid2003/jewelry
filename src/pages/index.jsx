// pages/index.jsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Toast } from "../components/Toast";
import styles from "../styles/home.module.scss";

export default function Home() {
  const [showLoginMessage, setShowLoginMessage] = useState(false);

  const handleShowLoginMessage = () => {
    setShowLoginMessage(true);
  };

  const handleCloseLoginMessage = () => {
    setShowLoginMessage(false);
  };

  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image
            src="https://placehold.co/1920x900/1C365D/EDEEF2?text=Silver+Lining+Hero"
            alt="Silver Lining Jewelry Hero"
            width={1920}
            height={900}
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroGradient}></div>
        </div>
        <div className={styles.heroText}>
          <h1>Silver Lining</h1>
          <p>
            Handcrafted jewelry that weaves your moments into timeless stories.
          </p>
          <Link href="/products">
            <button className={styles.ctaButton}>Explore Collections</button>
          </Link>
        </div>
      </section>
      <section className={styles.featured}>
        <h2>Our Signature Collections</h2>
        <div className={styles.featuredGrid}>
          <div className={styles.featuredItem}>
            <Image
              src="https://placehold.co/400x400/EDEEF2/1C365D?text=Necklaces"
              alt="Necklaces Collection"
              width={400}
              height={400}
              className={styles.featuredImage}
            />
            <h3>Necklaces</h3>
            <Link href="/products" className={styles.featuredLink}>
              Shop Now
            </Link>
          </div>
          <div className={styles.featuredItem}>
            <Image
              src="https://placehold.co/400x400/EDEEF2/1C365D?text=Rings"
              alt="Rings Collection"
              width={400}
              height={400}
              className={styles.featuredImage}
            />
            <h3>Rings</h3>
            <Link href="/products" className={styles.featuredLink}>
              Shop Now
            </Link>
          </div>
          <div className={styles.featuredItem}>
            <Image
              src="https://placehold.co/400x400/EDEEF2/1C365D?text=Bracelets"
              alt="Bracelets Collection"
              width={400}
              height={400}
              className={styles.featuredImage}
            />
            <h3>Bracelets</h3>
            <Link href="/products" className={styles.featuredLink}>
              Shop Now
            </Link>
          </div>
        </div>
      </section>
      <section className={styles.story}>
        <div className={styles.storyContent}>
          <h2>Crafted with Soul</h2>
          <p>
            Every piece in our collection is a testament to artistry, blending
            tradition with modern elegance to create jewelry that resonates with
            your story.
          </p>
          <Link href="/about" className={styles.storyLink}>
            Our Journey
          </Link>
        </div>
        <div className={styles.storyImageWrapper}>
          <Image
            src="https://placehold.co/600x500/EDEEF2/1C365D?text=Craftsmanship"
            alt="Craftsmanship"
            width={600}
            height={500}
            className={styles.storyImage}
          />
        </div>
      </section>
      <Toast
        message="Please log in to continue shopping"
        show={showLoginMessage}
        onClose={handleCloseLoginMessage}
      />
    </div>
  );
}
