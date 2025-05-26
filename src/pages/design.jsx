// pages/design.jsx
import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import Script from "next/script";
import styles from "../styles/design.module.scss";

export default function Design() {
  const [activeTab, setActiveTab] = useState("custom");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", // New phone field
    message: "",
    selectedDesign: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cloudinaryLoaded, setCloudinaryLoaded] = useState(false);

  // Check if Cloudinary is loaded
  useEffect(() => {
    const checkCloudinary = () => {
      if (window.cloudinary) {
        setCloudinaryLoaded(true);
      } else {
        setTimeout(checkCloudinary, 100);
      }
    };
    checkCloudinary();
  }, []);

  // Sample pre-made designs
  const premadeDesigns = [
    {
      id: "design1",
      name: "Eternal Elegance",
      image: "/designs/design1.jpg",
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

  // Open Cloudinary Upload Widget with better error handling
  const openUploadWidget = () => {
    if (!cloudinaryLoaded || !window.cloudinary) {
      setError(
        "Image upload service is still loading. Please wait a moment and try again."
      );
      return;
    }

    try {
      window.cloudinary
        .createUploadWidget(
          {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            folder: "designs",
            multiple: false,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "png", "jpeg", "pdf"],
            maxFileSize: 5000000, // 5MB
            sources: ["local", "url", "camera"],
            showAdvancedOptions: false,
            cropping: false,
            theme: "minimal",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary error:", error);
              setError(
                `Image upload failed: ${error.message || "Please try again."}`
              );
            } else {
              handleImageUpload(result);
              setError(""); // Clear any previous errors
            }
          }
        )
        .open();
    } catch (err) {
      console.error("Widget creation error:", err);
      setError(
        "Failed to open upload dialog. Please refresh the page and try again."
      );
    }
  };

  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setError("Please upload a design image.");
      return;
    }
    // Basic phone number validation (10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Store in Firestore
      const designData = {
        designType: "custom",
        name: formData.name,
        email: formData.email,
        phone: formData.phone, // Include phone
        message: formData.message,
        image: formData.image,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "designs"), designData);

      // Send email notification
      const response = await fetch("/api/send-design-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send notification");
      }

      setSuccess("Custom design request submitted! We'll contact you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "", // Reset phone
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
    // Basic phone number validation (10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const selectedDesign = premadeDesigns.find(
        (d) => d.id === formData.selectedDesign
      );
      // Store in Firestore
      const designData = {
        designType: "premade",
        name: formData.name,
        email: formData.email,
        phone: formData.phone, // Include phone
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

      // Send email notification
      const response = await fetch("/api/send-design-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send notification");
      }

      setSuccess(
        `Thank you for selecting "${selectedDesign.name}"! We'll contact you soon.`
      );
      setFormData({
        name: "",
        email: "",
        phone: "", // Reset phone
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
        strategy="beforeInteractive"
        onLoad={() => setCloudinaryLoaded(true)}
        onError={() =>
          setError(
            "Failed to load image upload service. Please refresh the page."
          )
        }
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
          {!cloudinaryLoaded && (
            <div className={styles.loadingNotice}>
              <span>🔄 Loading upload service, please wait...</span>
            </div>
          )}

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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    placeholder="1234567890"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.fileUploadSection}>
                  <label>Upload Design or Inspiration</label>
                  <div className={styles.fileInputWrapper}>
                    <button
                      type="button"
                      className={styles.uploadButton}
                      onClick={openUploadWidget}
                      disabled={isSubmitting || !cloudinaryLoaded}
                    >
                      {!cloudinaryLoaded
                        ? "Please wait, loading upload service..."
                        : "Select File"}
                    </button>
                    <span className={styles.fileName}>
                      {formData.image ? "Image uploaded" : "No file selected"}
                    </span>
                    {formData.image && (
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={() => setFormData({ ...formData, image: "" })}
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="premade-phone">Phone Number</label>
                      <input
                        type="tel"
                        id="premade-phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        pattern="[0-9]{10}"
                        placeholder="1234567890"
                        required
                        disabled={isSubmitting}
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
