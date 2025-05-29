import { useRouter } from "next/router";
import styles from "../styles/PaymentFailed.module.scss";

export default function PaymentFailed() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.errorCard}>
        <svg viewBox="0 0 24 24" className={styles.errorIcon}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <h1>Payment Failed</h1>
        <p>We couldn't process your payment. Please try again.</p>
        <button
          onClick={() => router.push("/checkout?step=2")}
          className={styles.retryButton}
        >
          Retry Payment
        </button>
      </div>
    </div>
  );
}
