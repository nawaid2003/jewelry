import { useState } from "react";
import styles from "../styles/products.module.scss";

export default function AdminProductForm({ onAddProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    details: [""],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDetailChange = (index, value) => {
    const updatedDetails = [...formData.details];
    updatedDetails[index] = value;
    setFormData({
      ...formData,
      details: updatedDetails,
    });
  };

  const addDetailField = () => {
    setFormData({
      ...formData,
      details: [...formData.details, ""],
    });
  };

  const removeDetailField = (index) => {
    const updatedDetails = formData.details.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      details: updatedDetails,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.price || !formData.description) {
      alert("Please fill out all required fields");
      return;
    }

    // Filter out empty detail fields
    const filteredDetails = formData.details.filter(
      (detail) => detail.trim() !== ""
    );

    // Create the new product object
    const newProduct = {
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      description: formData.description,
      details: filteredDetails,
    };

    // Pass the new product up to the parent component
    onAddProduct(newProduct);

    // Reset the form
    setFormData({
      name: "",
      price: "",
      image: "",
      description: "",
      details: [""],
    });
  };

  return (
    <form className={styles.adminForm} onSubmit={handleSubmit}>
      <h2>Add New Product</h2>

      <div className={styles.formGroup}>
        <label htmlFor="name">Product Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="price">Price *</label>
        <input
          type="number"
          id="price"
          name="price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="image">Image URL (optional)</label>
        <input
          type="text"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Leave blank for default image"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <fieldset className={styles.detailsFieldset}>
        <legend>Product Details</legend>

        {formData.details.map((detail, index) => (
          <div key={index} className={styles.detailItem}>
            <input
              type="text"
              value={detail}
              onChange={(e) => handleDetailChange(index, e.target.value)}
              placeholder="Enter a product detail"
            />
            {formData.details.length > 1 && (
              <button
                type="button"
                onClick={() => removeDetailField(index)}
                aria-label="Remove detail"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          className={styles.addDetailButton}
          onClick={addDetailField}
        >
          + Add Another Detail
        </button>
      </fieldset>

      <button type="submit" className={styles.adminButton}>
        Add Product
      </button>
    </form>
  );
}
