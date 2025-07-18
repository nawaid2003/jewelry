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

  // Construct customer email content
  const {
    customerInfo,
    items,
    orderSummary,
    specialRequest,
    orderId,
    paymentInfo,
  } = orderData;
  const itemList = items
    .map(
      (item) => `
        <li style="margin-bottom: 15px; display: flex; align-items: center;">
          <img src="${item.image || "/images/fallback-product.jpg"}" alt="${
        item.name
      }" style="width: 100px; height: auto; margin-right: 15px; border: 1px solid #ddd;" />
          <div>
            <strong>${item.name}</strong> ${
        item.ringDetails?.sizeDisplay ? `(${item.ringDetails.sizeDisplay})` : ""
      }<br>
            Quantity: ${item.quantity}<br>
            Price: ₹${(item.price * item.quantity).toFixed(2)}
          </div>
        </li>
      `
    )
    .join("");

  // Capitalize payment method for display
  const paymentMethodDisplay =
    paymentInfo.method.charAt(0).toUpperCase() + paymentInfo.method.slice(1);

  const customerEmailContent = `
    <h2 style="color: #333;">Thank You for Your Order!</h2>
    <p>Dear ${customerInfo.firstName} ${customerInfo.lastName},</p>
    <p>Thank you for shopping with Silverlining! Your order (ID: ${orderId}) has been successfully placed.</p>
    <h3 style="color: #333;">Order Details</h3>
    <ul style="list-style: none; padding: 0;">${itemList}</ul>
    ${
      specialRequest
        ? `<h3 style="color: #333;">Special Request</h3><p>${specialRequest}</p>`
        : ""
    }
    <h3 style="color: #333;">Order Summary</h3>
    <p>Subtotal: ₹${orderSummary.subtotal.toFixed(2)}</p>
    <p>Shipping: ₹${orderSummary.shipping.toFixed(2)}</p>
    ${
      orderSummary.codFee > 0
        ? `<p>COD Fee: ₹${orderSummary.codFee.toFixed(2)}</p>`
        : ""
    }
    <p>Payment Method: ${paymentMethodDisplay}</p>
    <p><strong>Total: ₹${orderSummary.total.toFixed(2)}</strong></p>
    <h3 style="color: #333;">Shipping Information</h3>
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
