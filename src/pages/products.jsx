import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import AdminProductForm from "../components/AdminProductForm";
import AdminLogin from "../components/AdminLogin";
import styles from "../styles/products.module.scss";

export default function Products() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Initial hardcoded products
  const initialProducts = [
    {
      id: 1,
      name: "Moonlight Necklace",
      price: 299,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Necklace",
      description:
        "Elegant sterling silver necklace inspired by the soft glow of moonlight. Perfect for both casual and formal occasions.",
      details: [
        "Sterling Silver",
        "18-inch chain",
        "Handcrafted",
        "Includes gift box",
      ],
      category: "Necklaces",
    },
    {
      id: 5,
      name: "Starshine Necklace",
      price: 349,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Starshine",
      description:
        "A dazzling necklace with a star-shaped pendant, crafted from white gold and adorned with cubic zirconia.",
      details: [
        "White Gold",
        "16-inch chain",
        "CZ stones",
        "Gift box included",
      ],
      category: "Necklaces",
    },
    {
      id: 6,
      name: "Ocean Pearl Necklace",
      price: 399,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Pearl",
      description:
        "A luxurious necklace featuring a genuine freshwater pearl, set in a delicate gold chain.",
      details: [
        "14K Gold",
        "20-inch chain",
        "Freshwater Pearl",
        "Tarnish resistant",
      ],
      category: "Necklaces",
    },
    {
      id: 2,
      name: "Starlight Ring",
      price: 499,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Ring",
      description:
        "A stunning ring with premium cubic zirconia that sparkle like distant stars, perfect for special occasions.",
      details: [
        "White Gold Plated",
        "Size adjustable",
        "Premium CZ stones",
        "Tarnish resistant",
      ],
      category: "Rings",
    },
    {
      id: 7,
      name: "Emerald Glow Ring",
      price: 599,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Emerald",
      description:
        "A bold ring featuring a synthetic emerald, set in a sterling silver band with intricate detailing.",
      details: [
        "Sterling Silver",
        "Size 7",
        "Synthetic Emerald",
        "Polished finish",
      ],
      category: "Rings",
    },
    {
      id: 8,
      name: "Infinity Band Ring",
      price: 249,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Infinity",
      description:
        "A minimalist ring with an infinity symbol, crafted from rose gold for a modern look.",
      details: ["Rose Gold", "Size adjustable", "Engravable", "Lightweight"],
      category: "Rings",
    },
    {
      id: 3,
      name: "Dawn Earrings",
      price: 199,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Earrings",
      description:
        "Beautifully crafted drop earrings that evoke the first light of dawn, adding elegance to any outfit.",
      details: [
        "Rose Gold Finish",
        "Hypoallergenic posts",
        "Lightweight design",
        "1.5 inches",
      ],
      category: "Earrings",
    },
    {
      id: 9,
      name: "Crystal Hoop Earrings",
      price: 279,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Hoops",
      description:
        "Chic hoop earrings encrusted with tiny crystals, perfect for day-to-night transitions.",
      details: [
        "Gold Plated",
        "1-inch diameter",
        "Crystal accents",
        "Secure clasp",
      ],
      category: "Earrings",
    },
    {
      id: 10,
      name: "Sapphire Stud Earrings",
      price: 329,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Studs",
      description:
        "Elegant stud earrings featuring synthetic sapphires, set in white gold for timeless sophistication.",
      details: [
        "White Gold",
        "Synthetic Sapphire",
        "Hypoallergenic",
        "0.5 inches",
      ],
      category: "Earrings",
    },
    {
      id: 4,
      name: "Twilight Bracelet",
      price: 349,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Bracelet",
      description:
        "A versatile bracelet with delicate charms, inspired by the magical moments of twilight.",
      details: [
        "Gold Plated",
        "Adjustable size",
        "Water resistant",
        "Signature clasp",
      ],
      category: "Bracelets",
    },
    {
      id: 11,
      name: "Charm Bangle",
      price: 299,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Bangle",
      description:
        "A sleek bangle with customizable charms, crafted from sterling silver for everyday wear.",
      details: ["Sterling Silver", "Adjustable", "Custom charms"],
      category: "Bracelets",
    },
    {
      id: 12,
      name: "Beaded Bracelet",
      price: 199,
      image: "https://placehold.co/300x300/F8F1E9/D4A373?text=Beaded",
      description:
        "A vibrant bracelet with hand-selected beads, offering a bohemian flair to any outfit.",
      details: [
        "Mixed Materials",
        "Elastic band",
        "Handmade beads",
        "Lightweight",
      ],
      category: "Bracelets",
    },
  ];

  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    const adminLoggedIn = sessionStorage.getItem("adminLoggedIn") === "true";
    setIsAdminLoggedIn(adminLoggedIn);
  }, []);

  // Load products from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("jewelryProducts");
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts);
      const mergedProducts = [
        ...initialProducts,
        ...parsedProducts.filter(
          (saved) => !initialProducts.some((initial) => initial.id === saved.id)
        ),
      ];
      setProducts(mergedProducts);
      console.log("Loaded products on mount:", mergedProducts);
    } else {
      localStorage.setItem("jewelryProducts", JSON.stringify(initialProducts));
      console.log("Initialized localStorage with initialProducts");
    }
  }, []);

  // Listen for localStorage changes (e.g., from /admin)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "jewelryProducts") {
        const savedProducts = event.newValue ? JSON.parse(event.newValue) : [];
        const mergedProducts = [
          ...initialProducts,
          ...savedProducts.filter(
            (saved) =>
              !initialProducts.some((initial) => initial.id === saved.id)
          ),
        ];
        setProducts(mergedProducts);
        console.log("Updated products from storage event:", mergedProducts);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Sync products to localStorage
  useEffect(() => {
    localStorage.setItem("jewelryProducts", JSON.stringify(products));
    console.log("Saved products to localStorage:", products);
  }, [products]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const toggleAdminForm = () => {
    if (isAdminLoggedIn) {
      setShowAdminForm(!showAdminForm);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLogin = (success) => {
    setIsAdminLoggedIn(success);
    setShowAdminLogin(false);
    if (success) {
      sessionStorage.setItem("adminLoggedIn", "true");
      setShowAdminForm(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setShowAdminForm(false);
    sessionStorage.removeItem("adminLoggedIn");
  };

  const addNewProduct = (newProduct) => {
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const productToAdd = {
      ...newProduct,
      id: newId,
      image:
        newProduct.image ||
        `https://placehold.co/300x300/F8F1E9/D4A373?text=${encodeURIComponent(
          newProduct.name
        )}`,
    };
    setProducts([...products, productToAdd]);
    setShowAdminForm(false);
    console.log("Added new product on products page:", productToAdd);
  };

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", "Necklaces", "Rings", "Earrings", "Bracelets"];

  return (
    <div className={styles.productsContainer}>
      <h1>Our Collections</h1>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Category Filter */}
      <div className={styles.categoryFilter}>
        {categories.map((category) => (
          <button
            key={category}
            className={`${styles.categoryButton} ${
              selectedCategory === category ? styles.active : ""
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {isAdminLoggedIn && (
        <div className={styles.adminPanel}>
          <div className={styles.adminHeader}>
            <h2>Admin Panel</h2>
            <button
              className={styles.adminLogoutButton}
              onClick={handleAdminLogout}
            >
              Logout
            </button>
          </div>
          <button
            className={styles.adminToggleButton}
            onClick={() => setShowAdminForm(!showAdminForm)}
          >
            {showAdminForm ? "Hide Product Form" : "Add New Product"}
          </button>
          {showAdminForm && <AdminProductForm onAddProduct={addNewProduct} />}
        </div>
      )}

      {!isAdminLoggedIn && (
        <button
          className={styles.hiddenAdminButton}
          onClick={() => setShowAdminLogin(true)}
          aria-label="Admin Login"
        >
          ⚙️
        </button>
      )}

      {showAdminLogin && (
        <AdminLogin
          onLogin={handleAdminLogin}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {/* Products Grid or No Results Message */}
      {filteredProducts.length > 0 ? (
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={() => handleProductSelect(product)}
            />
          ))}
        </div>
      ) : (
        <p className={styles.noResults}>
          No products found for this category or search query.
        </p>
      )}

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={closeProductDetails}
        />
      )}
    </div>
  );
}
