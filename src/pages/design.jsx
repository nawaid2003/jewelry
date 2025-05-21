import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Script from "next/script";
import styles from "../styles/design.module.scss";

export default function Design() {
  const [activeTab, setActiveTab] = useState("custom");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    selectedDesign: "",
    image: "", // Store Cloudinary URL for custom designs
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sample pre-made designs (images should be Cloudinary URLs in production)
  const premadeDesigns = [
    {
      id: "design1",
      name: "Eternal Elegance",
      image: "/designs/design1.jpg", // Replace with Cloudinary URL
      description: "A timeless silver pendant with delicate floral elements.",
    },
    {
      id: "design2",
      name: "Ocean Whisper",
      image: "/designs/design2.jpg",
      description: "Wave-inspired silver bracelet with blue gemstone accents.",
    },
    {
      id: "design3",
      name: "Moonlight Serenade",
      image: "/designs/design3.jpg",
      description: "Crescent moon earrings with subtle pearl highlights.",
    },
    {
      id: "design4",
      name: "Royal Heritage",
      image: "/designs/design4.jpg",
      description:
        "Vintage-inspired silver ring with intricate royal patterns.",
    },
    {
      id: "design5",
      name: "Forest Whispers",
      image: "/designs/design5.jpg",
      description:
        "Nature-inspired necklace with leaf motifs and green accents.",
    },
    {
      id: "design6",
      name: "Urban Rhythm",
      image: "/designs/design6.jpg",
      description: "Contemporary geometric silver cuff with minimalist appeal.",
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDesignSelect = (designId) => {
    setFormData({ ...formData, selectedDesign: designId });
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
            folder: "designs",
            multiple: false,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "png", "jpeg", "pdf"],
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

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError("Please upload a design image.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const designData = {
        designType: "custom",
        name: formData.name,
        email: formData.email,
        message: formData.message,
        image: formData.image,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "designs"), designData);
      setSuccess("Custom design request submitted! We'll contact you soon.");
      setFormData({
        name: "",
        email: "",
        message: "",
        selectedDesign: "",
        image: "",
      });
    } catch (err) {
      setError(`Failed to submit design: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePremadeSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedDesign) {
      setError("Please select a design.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const selectedDesign = premadeDesigns.find(
        (d) => d.id === formData.selectedDesign
      );
      const designData = {
        designType: "premade",
        name: formData.name,
        email: formData.email,
        message: formData.message,
        selectedDesign: {
          id: selectedDesign.id,
          name: selectedDesign.name,
          image: selectedDesign.image,
          description: selectedDesign.description,
        },
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "designs"), designData);
      setSuccess(
        `Thank you for selecting "${selectedDesign.name}"! We'll contact you soon.`
      );
      setFormData({
        name: "",
        email: "",
        message: "",
        selectedDesign: "",
        image: "",
      });
    } catch (err) {
      setError(`Failed to submit design: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script
        src="https://widget.cloudinary.com/v2.0/global/all.js"
        strategy="lazyOnload"
      />
      <div className={styles.designContainer}>
        <section className={styles.designHero}>
          <h1>Create Your Masterpiece</h1>
          <p>
            Collaborate with Silver Lining artisans to bring your jewelry dreams
            to life.
          </p>
        </section>

        <div className={styles.designOptions}>
          <div className={styles.tabsContainer}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "custom" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("custom")}
            >
              Upload Your Design
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "premade" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("premade")}
            >
              Choose from Our Designs
            </button>
          </div>

          {activeTab === "custom" ? (
            <section className={styles.designForm}>
              <h2>Share Your Vision With Us</h2>
              <p>
                Upload your design sketches or inspiration images and tell us
                about your dream jewelry piece.
              </p>

              <form onSubmit={handleCustomSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name</label>
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
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.fileUploadSection}>
                  <label>Upload Design or Inspiration</label>
                  <div className={styles.fileInputWrapper}>
                    <button
                      type="button"
                      className={styles.uploadButton}
                      onClick={openUploadWidget}
                    >
                      Select File
                    </button>
                    <span className={styles.fileName}>
                      {formData.image ? "Image uploaded" : "No file selected"}
                    </span>
                    {formData.image && (
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={() => setFormData({ ...formData, image: "" })}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {formData.image && (
                    <div className={styles.previewContainer}>
                      <img
                        src={formData.image}
                        alt="Design preview"
                        className={styles.imagePreview}
                      />
                    </div>
                  )}

                  <p className={styles.fileNote}>
                    Accepted formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Design Vision</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your design ideas, materials preferences, and any special details..."
                    required
                  />
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {success && <p className={styles.success}>{success}</p>}

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Custom Request"}
                </button>
              </form>
            </section>
          ) : (
            <section className={styles.premadeDesigns}>
              <h2>Select from Our Exclusive Designs</h2>
              <p>
                Browse our carefully crafted collection and choose a design we
                can customize for you.
              </p>

              <div className={styles.designGrid}>
                {premadeDesigns.map((design) => (
                  <div
                    key={design.id}
                    className={`${styles.designCard} ${
                      formData.selectedDesign === design.id
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() => handleDesignSelect(design.id)}
                  >
                    <div className={styles.designImageContainer}>
                      <img src={design.image} alt={design.name} />
                      {formData.selectedDesign === design.id && (
                        <div className={styles.selectedOverlay}>
                          <span>✓</span>
                        </div>
                      )}
                    </div>
                    <h3>{design.name}</h3>
                    <p>{design.description}</p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handlePremadeSubmit}
                className={styles.premadeForm}
              >
                {formData.selectedDesign && (
                  <>
                    <h3>Complete Your Selection</h3>
                    <div className={styles.formGroup}>
                      <label htmlFor="premade-name">Name</label>
                      <input
                        type="text"
                        id="premade-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="premade-email">Email</label>
                      <input
                        type="email"
                        id="premade-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="premade-message">
                        Special Requests or Customizations
                      </label>
                      <textarea
                        id="premade-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Any specific customizations or questions about the selected design..."
                      />
                    </div>

                    {error && <p className={styles.error}>{error}</p>}
                    {success && <p className={styles.success}>{success}</p>}

                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : "Request Selected Design"}
                    </button>
                  </>
                )}

                {!formData.selectedDesign && (
                  <div className={styles.selectionPrompt}>
                    <p>Please select a design from above to continue</p>
                  </div>
                )}
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
