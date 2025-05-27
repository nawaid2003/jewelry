import styles from "../styles/policy.module.scss";

export default function RefundPolicy() {
  return (
    <div className={styles.policyContainer}>
      <h1>Refund Policy</h1>
      <p>Last updated: May 21, 2025</p>

      <h2>1. Returns</h2>
      <p>
        We accept returns within 30 days of delivery, provided the item is
        unused, in its original condition, and accompanied by the original
        packaging and receipt.
      </p>

      <h2>2. Refund Process</h2>
      <p>
        We offer no refund as of now, still you can contact us at{" "}
        <a href="mailto:silverlining4622@gmail.com">
          silverlining4622@gmail.com
        </a>{" "}
        .
      </p>

      <h2>3. Defective or Incorrect Items</h2>
      <p>
        If you receive a defective or incorrect item, please contact us
        immediately.
      </p>

      <h2>4. Non-Returnable Items</h2>
      <p>
        Custom orders, engraved items, and gift cards are non-returnable unless
        defective.
      </p>

      <h2>5. Contact Us</h2>
      <p>
        For questions about our Refund Policy, please contact us at{" "}
        <a href="mailto:silverlining4622@gmail.com">
          silverlining4622@gmail.com
        </a>{" "}
        or call +91 9370664930.
      </p>
    </div>
  );
}
