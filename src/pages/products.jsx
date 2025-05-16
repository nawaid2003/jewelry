import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";
import { db } from "../lib/firebase";
import ProductCard from "../components/ProductCard";
import ProductDetails from "../components/ProductDetails";
import styles from "../styles/Products.module.scss";

export default function Products() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([
    // Necklaces
    {
      id: "n1",
      name: "Golden Leaf Necklace",
      category: "Necklaces",
      description: "A delicate gold necklace with a leaf pendant.",
      price: 89.99,
      image:
        "https://images.unsplash.com/photo-1611652351235-7a78d8c68eb4?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: [
        "Material: 18K Gold",
        "Pendant Size: 1.5cm",
        "Chain Length: 45cm",
      ],
    },
    {
      id: "n2",
      name: "Pearl Strand Necklace",
      category: "Necklaces",
      description: "Elegant strand of freshwater pearls.",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1606760227091-3dd44d7e6723?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: [
        "Material: Freshwater Pearls",
        "Length: 50cm",
        "Clasp: Sterling Silver",
      ],
    },
    {
      id: "n3",
      name: "Emerald Choker",
      category: "Necklaces",
      description: "A bold choker with an emerald centerpiece.",
      price: 149.99,
      image:
        "https://images.unsplash.com/photo-1608043152295-203a036e503c?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: ["Material: 14K Gold", "Stone: 2ct Emerald", "Length: 40cm"],
    },
    // Rings
    {
      id: "r1",
      name: "Sapphire Ring",
      category: "Rings",
      description: "A stunning ring with a deep blue sapphire gemstone.",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1608042314453-ec68cdcf2fe0?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: ["Material: 14K White Gold", "Stone: 1.5ct Sapphire", "Size: 7"],
    },
    {
      id: "r2",
      name: "Diamond Band",
      category: "Rings",
      description: "A sleek band encrusted with small diamonds.",
      price: 199.99,
      image:
        "https://images.unsplash.com/photo-1589234219434-1a4b5f5e6150?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: ["Material: 18K Gold", "Stones: 0.5ct Diamonds", "Width: 3mm"],
    },
    {
      id: "r3",
      name: "Rose Gold Ring",
      category: "Rings",
      description: "A minimalist rose gold ring with a subtle gem.",
      price: 79.99,
      image:
        "https://images.unsplash.com/photo-1608057954357-5a7b7b8334a8?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: [
        "Material: Rose Gold",
        "Stone: 0.1ct Cubic Zirconia",
        "Size: 6",
      ],
    },
    // Earrings
    {
      id: "e1",
      name: "Pearl Earrings",
      category: "Earrings",
      description: "Classic pearl drop earrings for timeless elegance.",
      price: 49.99,
      image:
        "https://images.unsplash.com/photo-1611652351303-6a13d2b9d44e?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: [
        "Material: Sterling Silver",
        "Pearl Size: 8mm",
        "Drop Length: 2cm",
      ],
    },
    {
      id: "e2",
      name: "Gold Hoop Earrings",
      category: "Earrings",
      description: "Bold gold hoops for a statement look.",
      price: 69.99,
      image:
        "https://images.unsplash.com/photo-1606761568499-6d378555723e?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: ["Material: 14K Gold", "Diameter: 3cm", "Thickness: 2mm"],
    },
    {
      id: "e3",
      name: "Diamond Stud Earrings",
      category: "Earrings",
      description: "Sparkling diamond studs for everyday wear.",
      price: 99.99,
      image:
        "https://images.unsplash.com/photo-1608042314473-ec68cdcf2fe0?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: [
        "Material: 14K White Gold",
        "Stones: 0.3ct Diamonds",
        "Post Back",
      ],
    },
    // Bracelets
    {
      id: "b1",
      name: "Silver Charm Bracelet",
      category: "Bracelets",
      description: "A customizable silver bracelet with charm slots.",
      price: 69.99,
      image:
        "https://images.unsplash.com/photo-1606760227091-3dd44d7e6723?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: ["Material: Sterling Silver", "Length: 20cm", "Charm Slots: 5"],
    },
    {
      id: "b2",
      name: "Beaded Cuff",
      category: "Bracelets",
      description: "A vibrant beaded cuff with colorful patterns.",
      price: 59.99,
      image:
        "https://images.unsplash.com/photo-1611652351235-7a78d8c68eb4?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: ["Material: Glass Beads", "Width: 2cm", "Adjustable"],
    },
    {
      id: "b3",
      name: "Gold Bangle",
      category: "Bracelets",
      description: "A sleek gold bangle for understated luxury.",
      price: 109.99,
      image:
        "https://images.unsplash.com/photo-1608043152295-203a036e503c?ixlib=rb-4.0.3&fit=crop&w=200&h=200",
      details: ["Material: 14K Gold", "Diameter: 6.5cm", "Thickness: 1.5mm"],
    },
  ]);

  // Fetch products from Firestore with real-time updates
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const firestoreProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Firestore products:", firestoreProducts);
        setProducts((prevProducts) => {
          const uniqueProducts = [
            ...prevProducts,
            ...firestoreProducts.filter(
              (fp) => !prevProducts.some((pp) => pp.id === fp.id)
            ),
          ];
          return uniqueProducts;
        });
      },
      (error) => {
        console.error("Error fetching products:", error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Filter products by category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (typeof product.description === "string" &&
            product.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (Array.isArray(product.description) &&
            product.description.some((desc) =>
              desc.toLowerCase().includes(searchQuery.toLowerCase())
            ));
    return matchesCategory && matchesSearch;
  });

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  const handleGoToCart = () => {
    router.push("/cart");
  };

  const categories = ["All", "Necklaces", "Rings", "Earrings", "Bracelets"];

  return (
    <div className={styles.productsContainer}>
      <h1 className={styles.productsTitle}>Our Collections</h1>

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

      {/* Floating Cart Button */}
      <button onClick={handleGoToCart} className={styles.floatingCartButton}>
        Go to Cart
      </button>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={closeProductDetails}
        />
      )}
    </div>
  );
}
