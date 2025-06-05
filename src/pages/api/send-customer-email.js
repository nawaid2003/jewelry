import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderData } = req.body;

  // Configure your email transporter (e.g., using Gmail, SendGrid, etc.)
  const transporter = nodemailer.createTransport({
    service: "gmail", // Or your preferred email service
    auth: {
      user: process.env.GMAIL_USER, // Your email address
      pass: process.env.GMAIL_APP_PASSWORD, // Your email password or app-specific password
    },
  });

  // Construct customer email content
  const { customerInfo, items, orderSummary, specialRequest, orderId } =
    orderData;
  const itemList = items
    .map(
      (item) => `
        <li>
          ${item.name} ${
        item.ringDetails?.sizeDisplay ? `(${item.ringDetails.sizeDisplay})` : ""
      }
          - Quantity: ${item.quantity}
          - Price: ₹${(item.price * item.quantity).toFixed(2)}
        </li>
      `
    )
    .join("");

  const customerEmailContent = `
    <h2>Thank You for Your Order!</h2>
    <p>Dear ${customerInfo.firstName} ${customerInfo.lastName},</p>
    <p>Thank you for shopping with Silverlining! Your order (ID: ${orderId}) has been successfully placed.</p>
    <h3>Order Details</h3>
    <ul>${itemList}</ul>
    ${specialRequest ? `<h3>Special Request</h3><p>${specialRequest}</p>` : ""}
    <h3>Order Summary</h3>
    <p>Subtotal: ₹${orderSummary.subtotal.toFixed(2)}</p>
    <p>Shipping: ₹${orderSummary.shipping.toFixed(2)}</p>
    <p><strong>Total: ₹${orderSummary.total.toFixed(2)}</strong></p>
    <h3>Shipping Information</h3>
    <p>${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${
    customerInfo.pincode
  }</p>
    <p>Phone: ${customerInfo.phone}</p>
    <p>Email: ${customerInfo.email}</p>
    <p>We will notify you with tracking details once your order is shipped.</p>
    <p>Best regards,<br>Silverlining Team</p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: customerInfo.email,
    subject: `Thank You for Your Order! (Order ID: ${orderId})`,
    html: customerEmailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ message: "Customer email sent successfully" });
  } catch (error) {
    console.error("Error sending customer email:", error);
    return res.status(500).json({ error: "Failed to send customer email" });
  }
}
