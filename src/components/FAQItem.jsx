import { useState } from "react";
import styles from "../styles/faq.module.scss";

export default function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faqItem}>
      <div
        className={`${styles.faqQuestion} ${isOpen ? styles.open : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3>{question}</h3>
        <span>{isOpen ? "−" : "+"}</span>
      </div>
      <div className={`${styles.faqAnswer} ${isOpen ? styles.open : ""}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}
