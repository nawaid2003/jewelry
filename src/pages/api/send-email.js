import nodemailer from "nodemailer";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, message } = req.body;

  // Server-side validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  if (name.length > 100 || email.length > 100 || message.length > 1000) {
    return res.status(400).json({ error: "Input exceeds maximum length" });
  }

  try {
    // Store in Firestore
    const contactData = {
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, "contactMessages"), contactData);

    // Set up Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Email options
    const mailOptions = {
      from: `"Silver Lining Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      replyTo: email,
      subject: `New Contact Message from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
}
