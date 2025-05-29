// pages/api/generate-payu-hash.js
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, amount, firstName, email, phone } = req.body;

  // Validate inputs
  if (!orderId || !amount || !firstName || !email || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Sanitize inputs
  const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9 ]/g, "").trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const formattedAmount = parseFloat(amount).toFixed(2);

  const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
  const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;
  const PAYU_BASE_URL = process.env.PAYU_BASE_URL;

  if (!MERCHANT_KEY || !MERCHANT_SALT || !PAYU_BASE_URL) {
    console.error("Missing PayU configuration:", {
      MERCHANT_KEY: !!MERCHANT_KEY,
      MERCHANT_SALT: !!MERCHANT_SALT,
      PAYU_BASE_URL: !!PAYU_BASE_URL,
    });
    return res.status(500).json({ error: "Server configuration error" });
  }

  const productInfo = "Jewelry Order";
  const hashString = `${MERCHANT_KEY}|${orderId}|${formattedAmount}|${productInfo}|${sanitizedFirstName}|${sanitizedEmail}||||||||||${MERCHANT_SALT}`;

  console.log("Hash String:", hashString);
  console.log(
    "Hash:",
    crypto.createHash("sha512").update(hashString).digest("hex")
  );

  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  res.status(200).json({
    hash,
    txnid: orderId,
    key: MERCHANT_KEY,
    amount: formattedAmount,
    productinfo: productInfo,
    firstname: sanitizedFirstName,
    email: sanitizedEmail,
    phone,
    surl: "https://jewelry-gules.vercel.app/api/payment-success",
    furl: "https://jewelry-gules.vercel.app/api/payment-failure",
    action: PAYU_BASE_URL,
  });
}
