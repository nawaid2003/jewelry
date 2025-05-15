import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/AdminProductForm.module.scss";

export default function AdminProductForm({ onAddProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "Necklaces",
    description: [""],
    price: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Necklaces", "Rings", "Earrings", "Bracelets"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (index, value) => {
    const newDescription = [...formData.description];
    newDescription[index] = value;
    setFormData((prev) => ({ ...prev, description: newDescription }));
  };

  const addDescriptionField = () => {
    setFormData((prev) => ({
      ...prev,
      description: [...prev.description, ""],
    }));
  };

  const removeDescriptionField = (index) => {
    const newDescription = formData.description.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, description: newDescription }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        description: formData.description.filter((desc) => desc.trim() !== ""),
      };
      const docRef = await addDoc(collection(db, "products"), productData);
      setSuccess("Product added to your database!");
      setFormData({
        name: "",
        category: "Necklaces",
        description: [""],
        price: "",
        image: "",
      });
      if (onAddProduct) {
        onAddProduct({ id: docRef.id, ...productData });
      }
    } catch (err) {
      setError(
        "Failed to add product. Please check your Firebase configuration."
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Description (Bullet Points)</label>
          {formData.description.map((desc, index) => (
            <div key={index} className={styles.descriptionGroup}>
              <input
                type="text"
                value={desc}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                placeholder={`Bullet point ${index + 1}`}
                className={styles.formInput}
                disabled={isSubmitting}
              />
              {formData.description.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDescriptionField(index)}
                  className={styles.removeButton}
                  disabled={isSubmitting}
                >
                  −
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDescriptionField}
            className={styles.addButton}
            disabled={isSubmitting}
          >
            +
          </button>
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
