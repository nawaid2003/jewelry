import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import AdminProductForm from "../components/AdminProductForm";
import styles from "../styles/products.module.scss";

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Moonlight Necklace",
      price: 299,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Necklace",
      description:
        "Elegant sterling silver necklace inspired by the soft glow of moonlight. Perfect for both casual and formal occasions, this piece features a delicate pendant that catches the light beautifully.",
      details: [
        "Sterling Silver",
        "18-inch chain",
        "Handcrafted",
        "Includes gift box",
      ],
    },
    {
      id: 2,
      name: "Starlight Ring",
      price: 499,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Ring",
      description:
        "A stunning ring that captures the essence of a starry night. Set with premium cubic zirconia that sparkle like distant stars, this ring makes a perfect gift for someone special.",
      details: [
        "White Gold Plated",
        "Size adjustable",
        "Premium CZ stones",
        "Tarnish resistant",
      ],
    },
    {
      id: 3,
      name: "Dawn Earrings",
      price: 199,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Earrings",
      description:
        "Beautifully crafted drop earrings that evoke the first light of dawn. These lightweight earrings bring a touch of elegance to any outfit.",
      details: [
        "Rose Gold Finish",
        "Hypoallergenic posts",
        "Lightweight design",
        "1.5 inches in length",
      ],
    },
    {
      id: 4,
      name: "Twilight Bracelet",
      price: 349,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Bracelet",
      description:
        "A versatile bracelet inspired by the magical moments of twilight. Features an adjustable chain and delicate charms that complement any wrist.",
      details: [
        "Gold Plated",
        "Adjustable size",
        "Water resistant",
        "Signature clasp",
      ],
    },
  ]);

  // Load products from localStorage on component mount (if available)
  useEffect(() => {
    const savedProducts = localStorage.getItem("jewelryProducts");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("jewelryProducts", JSON.stringify(products));
  }, [products]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const toggleAdminForm = () => {
    setShowAdminForm(!showAdminForm);
  };

  const addNewProduct = (newProduct) => {
    // Generate a new ID (simple implementation - in a real app you'd use a more robust method)
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;

    const productToAdd = {
      ...newProduct,
      id: newId,
      // Set a default image if none provided
      image:
        newProduct.image ||
        `https://placehold.co/300x300/F8F1E9/D4A373?text=${encodeURIComponent(
          newProduct.name
        )}`,
    };

    setProducts([...products, productToAdd]);
    setShowAdminForm(false);
  };

  return (
    <div className={styles.productsContainer}>
      <h1>Our Collections</h1>

      {/* Admin button - in a real app, this would be protected by authentication */}
      <button className={styles.adminToggleButton} onClick={toggleAdminForm}>
        {showAdminForm ? "Hide Admin Form" : "Show Admin Form"}
      </button>

      {/* Admin Form */}
      {showAdminForm && <AdminProductForm onAddProduct={addNewProduct} />}

      {/* Products Grid */}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={() => handleProductSelect(product)}
          />
        ))}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={closeProductDetails}
        />
      )}
    </div>
  );
}
