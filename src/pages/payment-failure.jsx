// pages/payment-failure.jsx
import { useRouter } from "next/router";
import styles from "../styles/PaymentFailure.module.scss";

export default function PaymentFailure() {
  const router = useRouter();
  const { orderId } = router.query;

  return (
    <div className={styles.failureContainer}>
      <h1>Payment Failed</h1>
      <p>Order ID: {orderId || "Unknown"}</p>
      <p>
        Sorry, your payment could not be processed. Please try again or contact
        support.
      </p>
      <div className={styles.actions}>
        <button onClick={() => router.push("/checkout")}>Try Again</button>
        <a href="/contact">Contact Support</a>
      </div>
    </div>
  );
}
