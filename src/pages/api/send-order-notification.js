import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderData } = req.body;

  // Configure your email transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  // Construct admin email content
  const { customerInfo, items, orderSummary, specialRequest, orderId } =
    orderData;
  const itemList = items
    .map(
      (item) => `
        <li>
          <strong>Product:</strong> ${item.name} ${
        item.ringDetails?.sizeDisplay ? `(${item.ringDetails.sizeDisplay})` : ""
      }<br>
          <strong>Quantity:</strong> ${item.quantity}<br>
          <strong>Price:</strong> ₹${(item.price * item.quantity).toFixed(
            2
          )}<br>
          <strong>HSN Code:</strong> ${item.hsn_code}<br>
          <strong>Weight:</strong> ${item.weight} g<br>
          <strong>Category:</strong> ${item.category || "N/A"}<br>
          <strong>Type:</strong> ${item.type || "N/A"}
        </li>
      `
    )
    .join("");

  const adminEmailContent = `
    <h2>New Order Received (Order ID: ${orderId})</h2>
    <p>A new order has been placed and requires manual shipment creation on iThink Logistics.</p>
    <h3>Customer Information</h3>
    <p><strong>Name:</strong> ${customerInfo.firstName} ${
    customerInfo.lastName
  }</p>
    <p><strong>Email:</strong> ${customerInfo.email}</p>
    <p><strong>Phone:</strong> ${customerInfo.phone}</p>
    <p><strong>Address:</strong> ${customerInfo.address}, ${
    customerInfo.city
  }, ${customerInfo.state} ${customerInfo.pincode}</p>
    ${specialRequest ? `<h3>Special Request</h3><p>${specialRequest}</p>` : ""}
    <h3>Order Items</h3>
    <ul>${itemList}</ul>
    <h3>Order Summary</h3>
    <p><strong>Subtotal:</strong> ₹${orderSummary.subtotal.toFixed(2)}</p>
    <p><strong>Shipping:</strong> ₹${orderSummary.shipping.toFixed(2)}</p>
    <p><strong>GST (3%):</strong> ₹${orderSummary.gst.toFixed(2)}</p>
    <p><strong>Total:</strong> ₹${orderSummary.total.toFixed(2)}</p>
    <h3>Shipment Creation Instructions</h3>
    <p>Please create a shipment on iThink Logistics with the following details:</p>
    <ul>
      <li><strong>Order ID:</strong> ${orderId}</li>
      <li><strong>Customer Name:</strong> ${customerInfo.firstName} ${
    customerInfo.lastName
  }</li>
      <li><strong>Address:</strong> ${customerInfo.address}, ${
    customerInfo.city
  }, ${customerInfo.state} ${customerInfo.pincode}</li>
      <li><strong>Phone:</strong> ${customerInfo.phone}</li>
      <li><strong>Total Weight:</strong> ${items
        .reduce((total, item) => total + item.weight * item.quantity, 0)
        .toFixed(2)} g</li>
      <li><strong>HSN Codes:</strong> ${items
        .map((item) => item.hsn_code)
        .join(", ")}</li>
      <li><strong>Item Count:</strong> ${orderSummary.itemCount}</li>
      <li><strong>Special Instructions:</strong> ${
        specialRequest || "None"
      }</li>
    </ul>
    <p>Log in to the iThink Logistics dashboard and enter these details to generate the AWB number and assign a courier.</p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.RECEIVER_EMAIL, // Your admin email address
    subject: `New Order Notification (Order ID: ${orderId})`,
    html: adminEmailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Admin email sent successfully" });
  } catch (error) {
    console.error("Error sending admin email:", error);
    return res.status(500).json({ error: "Failed to send admin email" });
  }
}
