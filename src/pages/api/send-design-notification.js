import nodemailer from "nodemailer";
import logo from "../public/logo.png";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message, designType, image, selectedDesign } = req.body;

  // Server-side validation
  if (!name || !email || !message || !designType) {
    return res.status(400).json({ error: "Required fields are missing" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (name.length > 100 || email.length > 100 || message.length > 1000) {
    return res.status(400).json({ error: "Input exceeds maximum length" });
  }
  if (designType === "custom" && !image) {
    return res
      .status(400)
      .json({ error: "Image is required for custom designs" });
  }
  if (designType === "premade" && (!selectedDesign || !selectedDesign.id)) {
    return res
      .status(400)
      .json({ error: "Selected design is required for premade designs" });
  }

  try {
    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Prepare notification email content
    let emailContent = `
      <h2>New Design Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Design Type:</strong> ${designType}</p>
      <p><strong>Message:</strong> ${message}</p>
    `;
    if (designType === "custom") {
      emailContent += `<p><strong>Image URL:</strong> <a href="${image}">${image}</a></p>`;
    } else if (designType === "premade") {
      emailContent += `
        <p><strong>Selected Design:</strong></p>
        <ul>
          <li><strong>ID:</strong> ${selectedDesign.id}</li>
          <li><strong>Name:</strong> ${selectedDesign.name}</li>
          <li><strong>Description:</strong> ${selectedDesign.description}</li>
          <li><strong>Image URL:</strong> <a href="${selectedDesign.image}">${selectedDesign.image}</a></li>
        </ul>
      `;
    }

    // Notification email options (to you)
    const mailOptions = {
      from: `"Silver Lining Designs" <${process.env.GMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `New ${designType} Design Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Design Type: ${designType}
        Message: ${message}
        ${designType === "custom" ? `Image: ${image}` : ""}
        ${
          designType === "premade"
            ? `Selected Design:
          ID: ${selectedDesign.id}
          Name: ${selectedDesign.name}
          Description: ${selectedDesign.description}
          Image: ${selectedDesign.image}`
            : ""
        }
      `,
      html: emailContent,
    };

    // Send notification email to you
    await transporter.sendMail(mailOptions);

    // Confirmation email options (to the user)
    const confirmationMailOptions = {
      from: `"Silver Lining" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Thank You for Your Design Submission",
      text: `Dear ${name},\n\nThank you for your ${designType} design submission. We'll review it and get back to you soon!\n\nBest,\nSilver Lining Team`,
      html: `
        <div style="font-family: 'Lora', serif; color: #333; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1c365d;">Thank You, ${name}!</h1>
          <p><h2 Thank you for your ${designType} design submission. We'll review it and get back to you soon! ></h2></p>
          <p style="margin-top: 20px;">Best,<br>Silver Lining Team</p>
          <img src="images/logoSL.png" alt="Silver Lining Logo" style="max-width: 150px; margin-top: 20px;">
        </div>
      `,
    };

    // Send confirmation email to the user
    await transporter.sendMail(confirmationMailOptions);

    return res
      .status(200)
      .json({ message: "Notification and confirmation sent successfully" });
  } catch (error) {
    console.error("Error sending design notification or confirmation:", error);
    return res
      .status(500)
      .json({ error: "Failed to send notification or confirmation" });
  }
}
