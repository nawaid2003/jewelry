import { useState } from "react";
import { db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import styles from "../styles/products.module.scss";

export default function AdminProductForm({ onAddProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "Necklaces",
    details: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.price ||
        !formData.description ||
        !formData.category
      ) {
        alert("Please fill out all required fields");
        return;
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        category: formData.category,
        details: formData.details
          ? formData.details.split(",").map((item) => item.trim())
          : [],
        image: `https://placehold.co/300x300/F8F1E9/D4A373?text=${encodeURIComponent(
          formData.name
        )}`,
      };

      // Save to Firestore
      const newId = Date.now().toString();
      await setDoc(doc(db, "products", newId), {
        ...productData,
        id: newId,
      });

      // Trigger success callback
      onAddProduct(productData);

      // Reset form
      setFormData({
        name: "",
        price: "",
        description: "",
        category: "Necklaces",
        details: "",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Please try again.");
    }
  };

  return (
    <div className={styles.adminFormContainer}>
      <h3>Add New Product</h3>
      <form onSubmit={handleSubmit} className={styles.adminForm}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Moonlight Necklace"
            required
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
            placeholder="e.g., 150"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., A delicate necklace with a moonstone pendant"
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Necklaces">Necklaces</option>
            <option value="Rings">Rings</option>
            <option value="Earrings">Earrings</option>
            <option value="Bracelets">Bracelets</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="details">Details (comma-separated)</label>
          <input
            type="text"
            id="details"
            name="details"
            value={formData.details}
            onChange={handleChange}
            placeholder="e.g., Gold, Adjustable, Handmade"
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Add Product
        </button>
      </form>
    </div>
  );
}
