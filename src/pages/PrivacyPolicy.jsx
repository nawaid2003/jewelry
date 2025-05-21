import styles from "../styles/policy.module.scss";

export default function PrivacyPolicy() {
  return (
    <div className={styles.policyContainer}>
      <h1>Privacy Policy</h1>
      <p>Last updated: May 21, 2025</p>

      <h2>1. Introduction</h2>
      <p>
        Silver Lining values your privacy. This Privacy Policy explains how we
        collect, use, and protect your personal information when you visit our
        website or make a purchase.
      </p>

      <h2>2. Information We Collect</h2>
      <p>
        We may collect the following types of information:
        <ul>
          <li>
            <strong>Personal Information:</strong> Name, email address, phone
            number, shipping/billing address, and payment details provided
            during checkout.
          </li>
          <li>
            <strong>Non-Personal Information:</strong> Browsing data, such as IP
            address, browser type, and pages visited, collected via cookies and
            similar technologies.
          </li>
        </ul>
      </p>

      <h2>3. How We Use Your Information</h2>
      <p>
        Your information is used to:
        <ul>
          <li>Process and fulfill your orders.</li>
          <li>Communicate with you about your order or account.</li>
          <li>Improve our website and customer experience.</li>
          <li>Send promotional emails (with your consent).</li>
        </ul>
      </p>

      <h2>4. Sharing Your Information</h2>
      <p>
        We do not sell your personal information. We may share your data with:
        <ul>
          <li>
            Third-party service providers (e.g., payment processors, shipping
            companies).
          </li>
          <li>Legal authorities, if required by law.</li>
        </ul>
      </p>

      <h2>5. Cookies and Tracking</h2>
      <p>
        We use cookies to enhance your browsing experience. You can manage
        cookie preferences through your browser settings.
      </p>

      <h2>6. Data Security</h2>
      <p>
        We implement industry-standard security measures to protect your data.
        However, no method of transmission over the internet is 100% secure.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        You may request access, correction, or deletion of your personal
        information by contacting us at{" "}
        <a href="mailto:test@silverliningjewelry.com">
          test@silverliningjewelry.com
        </a>
        .
      </p>

      <h2>8. Contact Us</h2>
      <p>
        For questions about this Privacy Policy, please contact us at{" "}
        <a href="mailto:test@silverliningjewelry.com">
          test@silverliningjewelry.com
        </a>{" "}
        or call 123 456-7890.
      </p>
    </div>
  );
}
