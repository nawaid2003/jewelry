import { useState, useRef, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/AdminProductForm.module.scss";

export default function AdminProductForm({ onAddProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "", // Start with blank category
    description: "",
    details: [""],
    price: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const categories = ["Necklaces", "Rings", "Earrings", "Bracelets"];

  // Handle clicking outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setIsDropdownOpen(false);
  };

  const handleDetailsChange = (index, value) => {
    const newDetails = [...formData.details];
    newDetails[index] = value;
    setFormData((prev) => ({ ...prev, details: newDetails }));
  };

  const addDetailsField = () => {
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, ""],
    }));
  };

  const removeDetailsField = (index) => {
    const newDetails = formData.details.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, details: newDetails }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Check Firebase configuration
    console.log("Submitting product with Firestore database:", db);

    try {
      // Filter out empty details entries
      const filteredDetails = formData.details.filter(
        (detail) => detail.trim() !== ""
      );

      // Validate the form
      if (
        !formData.name ||
        !formData.category ||
        !formData.price ||
        !formData.image ||
        !formData.description
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Prepare product data
      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description.trim(),
        details: filteredDetails.length > 0 ? filteredDetails : [""],
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
        category: "", // Reset to blank category
        description: "",
        details: [""],
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

        {/* Custom Dropdown for Category */}
        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <div className={styles.dropdown} ref={dropdownRef}>
            <button
              type="button"
              className={styles.dropdownToggle}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSubmitting}
            >
              <span>{formData.category || "Select category"}</span>
              <svg
                className={`${styles.dropdownArrow} ${
                  isDropdownOpen ? styles.open : ""
                }`}
                viewBox="0 0 24 24"
              >
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`${styles.dropdownItem} ${
                      formData.category === category ? styles.selected : ""
                    }`}
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter general product description (e.g., A delicate gold necklace with a leaf pendant)"
            required
            className={`${styles.formInput} ${styles.textarea}`}
            disabled={isSubmitting}
            rows={3}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Product Details (Bullet Points)</label>
          {formData.details.map((detail, index) => (
            <div key={index} className={styles.descriptionGroup}>
              <input
                type="text"
                value={detail}
                onChange={(e) => handleDetailsChange(index, e.target.value)}
                placeholder={`Detail bullet point ${
                  index + 1
                } (e.g., "Material: 18K Gold")`}
                className={styles.formInput}
                disabled={isSubmitting}
              />
              {formData.details.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDetailsField(index)}
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
            onClick={addDetailsField}
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
