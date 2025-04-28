import Image from "next/image";
import styles from "../styles/about.module.scss";

export default function About() {
  return (
    <div className={styles.aboutContainer}>
      <section className={styles.aboutHero}>
        <h1>The Silver Lining Story</h1>
        <p>Where craftsmanship meets timeless elegance.</p>
      </section>
      <section className={styles.aboutContent}>
        <div className={styles.aboutText}>
          <h2>Our Journey</h2>
          <p>
            Founded in 1995, Silver Lining creates jewelry that celebrates
            life’s brightest moments. Each piece is handcrafted with passion,
            using ethically sourced materials to ensure beauty that shines
            inside and out.
          </p>
        </div>
        <Image
          src="https://placehold.co/500x400/F8F1E9/D4A373?text=Silver+Lining+Craft"
          alt="Silver Lining Craftsmanship"
          width={500}
          height={400}
          className={styles.aboutImage}
        />
      </section>
    </div>
  );
}
