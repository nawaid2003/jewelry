import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/products.module.scss";

export default function AdminProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Necklaces",
    description: "",
    price: "",
    image: "",
    details: "", // Store as comma-separated string in form, convert to array on submit
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = ["Necklaces", "Rings", "Earrings", "Bracelets"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        details: formData.details
          .split(",")
          .map((detail) => detail.trim())
          .filter((detail) => detail), // Convert comma-separated string to array
      };
      await addDoc(collection(db, "products"), productData);
      setSuccess("Product added successfully!");
      setFormData({
        name: "",
        category: "Necklaces",
        description: "",
        price: "",
        image: "",
        details: "",
      });
    } catch (err) {
      setError("Failed to add product. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className={styles.productsContainer}>
      <h1>Add New Product</h1>
      <p>Fill in the details to add a new product to your collection.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.formInput}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the product..."
            rows="4"
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price">Price ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
            step="0.01"
            min="0"
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Enter image URL"
            required
            className={styles.formInput}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="details">Details (comma-separated)</label>
          <textarea
            id="details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="e.g., Material: 14K Gold, Length: 45cm, Stone: 1ct Emerald"
            rows="3"
            className={styles.formInput}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button type="submit" className={styles.submitButton}>
          Add Product
        </button>
      </form>
    </div>
  );
}
