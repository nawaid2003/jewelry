import FAQItem from "../components/FAQItem";
import styles from "../styles/faq.module.scss";

export default function FAQ() {
  const faqs = [
    {
      question: "What materials does Silver Lining use?",
      answer:
        "We use high-quality 9 to 5 Sterling Silver and ethically sourced gemstones to ensure lasting beauty and sustainability.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping typically takes 5-7 business days. Expedited options are available at checkout.",
    },
    {
      question: "Can I return or exchange a purchase?",
      answer:
        "We dont offer return poicy on the products we only offer exchange policy for unworn items in their original condition.",
    },
    {
      question: "Do you offer custom jewelry designs?",
      answer:
        "Absolutely! Visit our Design page to collaborate with our artisans on a bespoke piece.",
    },
    {
      question: "How should I care for my jewelry?",
      answer:
        "Clean with a soft cloth and store in a dry, airtight container to maintain shine. Avoid harsh chemicals.",
    },
    {
      question: "Are your gemstones ethically sourced?",
      answer:
        "Yes, we partner with suppliers who adhere to ethical and sustainable sourcing practices.",
    },
  ];

  return (
    <div className={styles.faqContainer}>
      <h1>Frequently Asked Questions</h1>
      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}
