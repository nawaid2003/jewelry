import styles from "../styles/policy.module.scss";

export default function DomesticShipping() {
  return (
    <div className={styles.policyContainer}>
      <h1>Domestic Shipping</h1>
      <p>Last updated: May 22, 2025</p>

      <h2>1. Processing Time</h2>
      <p>
        Orders are usually processed and shipped within 2-3 business days after
        your order is placed. Please note that "Made to Order" products will
        take additional time to be processed and shipped as they are crafted
        specifically for you.
      </p>

      <h2>2. Shipping Fees</h2>
      <p>
        We are pleased to offer{" "}
        <strong>FREE shipping on all domestic orders</strong> within India over
        ₹2499. There are no minimum order requirements - every Silver Lining
        purchase qualifies for complimentary shipping.
      </p>

      <h2>3. Delivery Timeline</h2>
      <p>
        Standard domestic shipping typically takes 5-7 business days after your
        order has been processed and shipped. During peak seasons or holidays,
        delivery times may be extended. We will notify you of any potential
        delays.
      </p>

      <h2>4. Order Tracking</h2>
      <p>
        Once your order is shipped, you will receive tracking details via email
        to your registered address. This allows you to monitor your package's
        journey and estimated delivery date. Please check your spam folder if
        you don't see the tracking email within 24 hours of shipment.
      </p>

      <h2>5. Delivery Information</h2>
      <p>
        Please ensure that someone is available to receive your package, or that
        it can be safely left at your delivery address. Silver Lining is not
        responsible for packages that are lost or stolen after successful
        delivery confirmation.
      </p>

      <h2>6. Address Changes</h2>
      <p>
        If you need to change your shipping address, please contact us
        immediately at{" "}
        <a href="mailto:silverlining4622@gmail.com">
          silverlining4622@gmail.com
        </a>
        . We can only modify addresses before the order has been shipped.
      </p>

      <h2>7. Contact Us</h2>
      <p>
        For any shipping-related questions or concerns, please don't hesitate to
        contact us at{" "}
        <a href="mailto:silverlining4622@gmail.com">
          silverlining4622@gmail.com
        </a>{" "}
        or call us at +91 9370664930. Our customer service team is here to help
        ensure your Silver Lining jewelry reaches you safely and on time.
      </p>
    </div>
  );
}
