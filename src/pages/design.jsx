import { useState } from "react";
import styles from "../styles/design.module.scss";

export default function Design() {
  const [activeTab, setActiveTab] = useState("custom");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    selectedDesign: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Create preview for image files
      if (selectedFile.type.includes("image")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleDesignSelect = (designId) => {
    setFormData({ ...formData, selectedDesign: designId });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    // Here you would handle the form submission with file upload
    console.log("Custom design submission:", { formData, file });
    alert("Custom design request submitted! We'll contact you soon.");
  };

  const handlePremadeSubmit = (e) => {
    e.preventDefault();
    // Here you would handle the form submission for premade design
    console.log("Premade design selection:", formData);
    alert(
      `Thank you for selecting "${
        premadeDesigns.find((d) => d.id === formData.selectedDesign)?.name
      }"! We'll contact you soon.`
    );
  };

  const clearFileSelection = () => {
    setFile(null);
    setFilePreview(null);
  };

  return (
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
                <label htmlFor="designFile">Upload Design or Inspiration</label>
                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="designFile"
                    name="designFile"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className={styles.fileInput}
                  />
                  <button
                    type="button"
                    className={styles.uploadButton}
                    onClick={() =>
                      document.getElementById("designFile").click()
                    }
                  >
                    Select File
                  </button>
                  <span className={styles.fileName}>
                    {file ? file.name : "No file selected"}
                  </span>
                  {file && (
                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={clearFileSelection}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {filePreview && (
                  <div className={styles.previewContainer}>
                    <img
                      src={filePreview}
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

              <button type="submit" className={styles.submitButton}>
                Submit Custom Request
              </button>
            </form>
          </section>
        ) : (
          <section className={styles.premadeDesigns}>
            <h2>Select from Our Exclusive Designs</h2>
            <p>
              Browse our carefully crafted collection and choose a design we can
              customize for you.
            </p>

            <div className={styles.designGrid}>
              {premadeDesigns.map((design) => (
                <div
                  key={design.id}
                  className={`${styles.designCard} ${
                    formData.selectedDesign === design.id ? styles.selected : ""
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

            <form onSubmit={handlePremadeSubmit} className={styles.premadeForm}>
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

                  <button type="submit" className={styles.submitButton}>
                    Request Selected Design
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
  );
}
