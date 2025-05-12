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
      const newId = Date.now().toString(); // Unique ID
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
    <form onSubmit={handleSubmit} className={styles.adminForm}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Price:</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Category:</label>
        <select
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
      <div>
        <label>Details (comma-separated):</label>
        <input
          type="text"
          name="details"
          value={formData.details}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Add Product</button>
    </form>
  );
}
