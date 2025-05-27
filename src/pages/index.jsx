// pages/index.jsx
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Toast } from "../components/Toast";
import styles from "../styles/home.module.scss";
import Image1 from "../images/home.jpg";
import Image2 from "../images/necklace.jpg";
import Image3 from "../images/ring.jpg";
import Image4 from "../images/earring.jpg";
import Image5 from "../images/craftsmanship.jpg";

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
      {/* Floating Elements for Visual Enhancement */}
      <div className={styles.floatingElements}>
        <div className={styles.floatingGem}></div>
        <div className={styles.floatingGem}></div>
        <div className={styles.floatingGem}></div>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <Image
            src={Image1}
            alt="Silver Lining Jewelry Hero"
            width={1920}
            height={900}
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroGradient}></div>
          <div className={styles.heroPattern}></div>
        </div>
        <div className={styles.heroText}>
          <div className={styles.heroTextInner}>
            <h1>
              <span className={styles.mainTitle}>Silver Lining</span>
              <span className={styles.subtitle}>Where Hope Meets Elegance</span>
            </h1>
            <p>
              Handcrafted jewelry that weaves your moments into timeless
              stories. Each piece is a masterpiece of elegance and
              sophistication.
            </p>
            <Link href="/products">
              <button className={styles.ctaButton}>
                <span>Explore Collections</span>
                <div className={styles.buttonShine}></div>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.featured}>
        <div className={styles.sectionHeader}>
          <h2>Our Signature Collections</h2>
          <p>Discover the perfect piece that speaks to your soul</p>
        </div>
        <div className={styles.featuredGrid}>
          <div className={styles.featuredItem}>
            <div className={styles.featuredImageWrapper}>
              <Image
                src={Image2}
                alt="Necklaces Collection"
                width={400}
                height={400}
                className={styles.featuredImage}
              />
              <div className={styles.featuredOverlay}>
                <div className={styles.featuredIcon}>✨</div>
              </div>
            </div>
            <div className={styles.featuredContent}>
              <h3>Necklaces</h3>
              <p>Elegant chains and pendants</p>
              <Link href="/products" className={styles.featuredLink}>
                <span>Shop Now</span>
                <div className={styles.linkArrow}>→</div>
              </Link>
            </div>
          </div>

          <div className={styles.featuredItem}>
            <div className={styles.featuredImageWrapper}>
              <Image
                src={Image3}
                alt="Rings Collection"
                width={400}
                height={400}
                className={styles.featuredImage}
              />
              <div className={styles.featuredOverlay}>
                <div className={styles.featuredIcon}>💎</div>
              </div>
            </div>
            <div className={styles.featuredContent}>
              <h3>Rings</h3>
              <p>Timeless bands and statement pieces</p>
              <Link href="/products" className={styles.featuredLink}>
                <span>Shop Now</span>
                <div className={styles.linkArrow}>→</div>
              </Link>
            </div>
          </div>

          <div className={styles.featuredItem}>
            <div className={styles.featuredImageWrapper}>
              <Image
                src={Image4}
                alt="Earrings Collection"
                width={400}
                height={400}
                className={styles.featuredImage}
              />
              <div className={styles.featuredOverlay}>
                <div className={styles.featuredIcon}>🌟</div>
              </div>
            </div>
            <div className={styles.featuredContent}>
              <h3>Earrings</h3>
              <p>Delicate studs and bold drops</p>
              <Link href="/products" className={styles.featuredLink}>
                <span>Shop Now</span>
                <div className={styles.linkArrow}>→</div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.story}>
        <div className={styles.storyContent}>
          <div className={styles.storyText}>
            <h2>Crafted with Soul</h2>
            <p>
              Every piece in our collection is a testament to artistry, blending
              tradition with modern elegance to create jewelry that resonates
              with your story. Our master craftsmen pour decades of experience
              into each creation.
            </p>
            <div className={styles.storyFeatures}>
              <div className={styles.storyFeature}>
                <span className={styles.featureIcon}>🎨</span>
                <span>Handcrafted Excellence</span>
              </div>
              <div className={styles.storyFeature}>
                <span className={styles.featureIcon}>💫</span>
                <span>Premium Materials</span>
              </div>
              <div className={styles.storyFeature}>
                <span className={styles.featureIcon}>❤️</span>
                <span>Made with Love</span>
              </div>
            </div>
            <Link href="/about" className={styles.storyLink}>
              <span>Our Journey</span>
              <div className={styles.linkArrow}>→</div>
            </Link>
          </div>
        </div>
        <div className={styles.storyImageWrapper}>
          <div className={styles.storyImageContainer}>
            <Image
              src={Image5}
              alt="Craftsmanship"
              width={600}
              height={500}
              className={styles.storyImage}
            />
            <div className={styles.storyImageOverlay}></div>
          </div>
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
