import { useState } from "react";
import styles from "../styles/design.module.scss";

export default function Design() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Design request submitted!"); // Placeholder for form submission
  };

  return (
    <div className={styles.designContainer}>
      <section className={styles.designHero}>
        <h1>Create Your Masterpiece</h1>
        <p>
          Collaborate with Silver Lining artisans to design your dream jewelry.
        </p>
      </section>
      <section className={styles.designForm}>
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Design Vision
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Submit Request</button>
        </form>
      </section>
    </div>
  );
}
