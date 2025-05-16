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

    // Check Firebase configuration
    console.log("Submitting product with Firestore database:", db);

    try {
      // Filter out empty description entries
      const filteredDescription = formData.description.filter(
        (desc) => desc.trim() !== ""
      );

      // Validate the form
      if (!formData.name || !formData.price || !formData.image) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        category: formData.category,
        description:
          filteredDescription.length > 0 ? filteredDescription : [""],
        price: parseFloat(formData.price),
        image: formData.image,
        createdAt: new Date().toISOString(),
      };

      console.log("Adding product to Firestore:", productData);

      // Add to Firestore
      const docRef = await addDoc(collection(db, "products"), productData);
      console.log("Product added with ID:", docRef.id);

      setSuccess(`Product added successfully! ID: ${docRef.id}`);

      // Reset form
      setFormData({
        name: "",
        category: "Necklaces",
        description: [""],
        price: "",
        image: "",
      });

      // Callback if provided
      if (onAddProduct) {
        onAddProduct({ id: docRef.id, ...productData });
      }
    } catch (err) {
      console.error("Error adding product:", err);
      setError(
        `Failed to add product: ${
          err.message || "Check your Firebase configuration"
        }`
      );
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
