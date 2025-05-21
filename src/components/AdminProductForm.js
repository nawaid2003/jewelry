import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Script from "next/script";
import styles from "../styles/AdminProductForm.module.scss";

export default function AdminProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    details: [],
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [detailInput, setDetailInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const categories = ["Necklaces", "Rings", "Earrings", "Bracelets"];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setIsDropdownOpen(false);
  };

  // Handle adding details
  const handleAddDetail = () => {
    if (detailInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        details: [...prev.details, detailInput.trim()],
      }));
      setDetailInput("");
    }
  };

  // Handle pressing Enter in detail input
  const handleDetailKeyPress = (e) => {
    if (e.key === "Enter" && detailInput.trim()) {
      e.preventDefault();
      handleAddDetail();
    }
  };

  // Handle removing details
  const handleRemoveDetail = (index) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  // Handle Cloudinary upload success
  const handleImageUpload = (result) => {
    if (result.event === "success") {
      setFormData((prev) => ({
        ...prev,
        image: result.info.secure_url,
      }));
    }
  };

  // Open Cloudinary Upload Widget
  const openUploadWidget = () => {
    if (window.cloudinary) {
      window.cloudinary
        .createUploadWidget(
          {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            folder: "products",
            multiple: false,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "png", "jpeg"],
          },
          (error, result) => {
            if (error) {
              setError("Image upload failed. Please try again.");
              console.error("Cloudinary error:", error);
            } else {
              handleImageUpload(result);
            }
          }
        )
        .open();
    } else {
      setError("Cloudinary widget not loaded. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setError("Please select a category.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "products"), productData);
      setSuccess("Product added successfully!");
      setFormData({
        name: "",
        category: "",
        description: "",
        price: "",
        details: [],
        image: "",
      });
    } catch (err) {
      setError(`Failed to add product: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle drag events for upload area
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    openUploadWidget();
  };

  return (
    <>
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        strategy="lazyOnload"
      />
      <div className={styles.productsContainer}>
        <h1>Add New Product</h1>
        <p>Create a new product listing with details and image.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Product Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.formInput}
              placeholder="Enter product name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="category">Category*</label>
            <div className={styles.dropdown}>
              <button
                type="button"
                className={styles.dropdownToggle}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{formData.category || "Select category"}</span>
                <svg
                  className={`${styles.dropdownArrow} ${
                    isDropdownOpen ? styles.open : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
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
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className={styles.textarea}
              placeholder="Describe the product in detail"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price">Price (₹)*</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
              className={styles.formInput}
              placeholder="Enter price in ₹"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Product Details</label>
            <div className={styles.descriptionGroup}>
              <input
                type="text"
                value={detailInput}
                onChange={(e) => setDetailInput(e.target.value)}
                onKeyPress={handleDetailKeyPress}
                placeholder="Add a detail (e.g., Material: 14K Gold)"
                className={styles.formInput}
              />
              <button
                type="button"
                onClick={handleAddDetail}
                className={styles.addButton}
                disabled={!detailInput.trim()}
                aria-label="Add detail"
              >
                +
              </button>
            </div>
            {formData.details.length > 0 && (
              <div className={styles.detailsList}>
                {formData.details.map((detail, index) => (
                  <div key={index} className={styles.descriptionGroup}>
                    <input
                      type="text"
                      value={detail}
                      readOnly
                      className={styles.formInput}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDetail(index)}
                      className={styles.removeButton}
                      aria-label="Remove detail"
                    >
                      −
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Product Image*</label>
            <button
              type="button"
              onClick={openUploadWidget}
              className={styles.uploadButton}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                borderColor: isDragging ? "#1c365d" : "",
                background: isDragging ? "rgba(28, 54, 93, 0.05)" : "",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              {formData.image ? "Change Image" : "Upload Image"}
            </button>
            <p className={styles.uploadHint}>
              Drag and drop or click to upload
            </p>
            {formData.image && (
              <div className={styles.imagePreview}>
                <img src={formData.image} alt="Product preview" />
              </div>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{success}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting || !formData.image}
          >
            {isSubmitting ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </>
  );
}
