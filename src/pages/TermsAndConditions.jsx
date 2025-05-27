import styles from "../styles/policy.module.scss";

export default function TermsAndConditions() {
  return (
    <div className={styles.policyContainer}>
      <h1>Terms and Conditions</h1>
      <p>Last updated: May 21, 2025</p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Silver Lining website, you agree to be bound
        by these Terms and Conditions. If you do not agree with any part of
        these terms, please do not use our website or services.
      </p>

      <h2>2. Products and Pricing</h2>
      <p>
        All products listed on our website are subject to availability. Prices
        are subject to change without notice. We strive to display accurate
        pricing, but errors may occur. In such cases, we reserve the right to
        cancel or refuse orders placed for incorrectly priced items.
      </p>

      <h2>3. Orders and Payments</h2>
      <p>
        By placing an order, you agree to pay the total amount, including
        shipping and applicable taxes. We accept payments via [list accepted
        payment methods, e.g., credit/debit cards, PayPal]. Orders are processed
        upon successful payment verification.
      </p>

      <h2>4. Shipping and Delivery</h2>
      <p>
        We aim to ship orders within [insert timeframe, e.g., 2-5 business
        days]. Delivery times may vary depending on your location and external
        factors. Silver Lining is not responsible for delays caused by shipping
        carriers or customs processes.
      </p>

      <h2>5. Returns and Refunds</h2>
      <p>
        Please refer to our <a href="/refund-policy">Refund Policy</a> for
        detailed information on returns and refunds.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        All content on this website, including images, designs, and text, is the
        property of Silver Lining or its licensors and is protected by copyright
        laws. Unauthorized use of our content is prohibited.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        Silver Lining is not liable for any indirect, incidental, or
        consequential damages arising from the use of our website or products,
        to the extent permitted by law.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These Terms and Conditions are governed by the laws of [insert
        jurisdiction, e.g., India]. Any disputes will be resolved in the courts
        of [insert city, e.g., Nagpur].
      </p>

      <h2>9. Contact Us</h2>
      <p>
        For questions about these Terms and Conditions, please contact us at{" "}
        <a href="mailto:silverlining4622@gmail.com">
          silverlining4622@gmail.com
        </a>{" "}
        or call +91 9370664930.
      </p>
    </div>
  );
}
