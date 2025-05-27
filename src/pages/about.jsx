import Image from "next/image";
import styles from "../styles/about.module.scss";
import Journey from "../images/about.jpg";

export default function About() {
  return (
    <div className={styles.aboutContainer}>
      <section className={styles.aboutHero}>
        <h1>Our Silver Legacy</h1>
        <p>Four decades of excellence, now embracing the digital world.</p>
      </section>

      <section className={styles.aboutMainSection}>
        <div className={styles.imageContainer}>
          <Image
            src={Journey}
            alt="Silver Jewelry Craftsmanship"
            width={600}
            height={500}
            className={styles.aboutImage}
          />
        </div>

        <div className={styles.textContainer}>
          <div className={styles.aboutText}>
            <h2>A Legacy of Craftsmanship</h2>
            <p>
              For over four decades, our family has been dedicated to crafting
              exquisite silver jewellery, a legacy now proudly carried forward
              by the second generation. We started as a small offline store,
              where our excellent craftsmanship became the talk of the town,
              drawing customers who admired the artistry in every piece.
            </p>
            <p>
              Our skilled artisans pour their expertise into each design,
              ensuring every curve, cut, and polish reflects our commitment to
              creating timeless treasures that last for generations.
            </p>
          </div>

          <div className={styles.aboutText}>
            <h2>Quality & Ethics</h2>
            <p>
              At the core of our journey is a promise of excellent quality and
              ethical practices. We source our silver and gemstones responsibly,
              ensuring all materials are ethically obtained, honoring both the
              environment and the communities we work with.
            </p>
            <p>
              Every piece undergoes strict quality checks to meet the highest
              standards, earning us the trust of customers who value both beauty
              and integrity. As a second-generation business, we've grown up
              cherishing the values of authenticity and reliability, blending
              traditional techniques with modern innovation.
            </p>
          </div>

          <div className={styles.aboutText}>
            <h2>Our Digital Journey</h2>
            <p>
              After years of serving customers through our beloved offline
              store, we are now ready to conquer the online world, and we need
              your support to make this new chapter a success. Our journey has
              always been about building connections through quality and care,
              and we're excited to bring our passion for silver jewellery to a
              global audience.
            </p>
            <p>
              With the trust we've earned and the loyalty of our customers,
              we're confident that together, we can make our online presence as
              cherished as our physical store has been for decades. Join us as
              we take this exciting step forward!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
