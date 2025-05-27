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

      <h2>3. Refund Conditions</h2>
      <p>
        Refunds will be issued to the original payment method within [insert
        timeframe, e.g., 7-10 business days] after we receive and inspect the
        returned item. Shipping costs are non-refundable unless the item is
        defective or incorrect.
      </p>

      <h2>4. Defective or Incorrect Items</h2>
      <p>
        If you receive a defective or incorrect item, please contact us
        immediately. We will provide a prepaid return label and issue a full
        refund or replacement upon receipt of the item.
      </p>

      <h2>5. Non-Returnable Items</h2>
      <p>
        Custom orders, engraved items, and gift cards are non-returnable unless
        defective.
      </p>

      <h2>6. Contact Us</h2>
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
