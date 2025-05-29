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

  const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
  const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;
  const PAYU_BASE_URL = process.env.PAYU_BASE_URL;

  const productInfo = "Jewelry Order";
  const hashString = `${MERCHANT_KEY}|${orderId}|${amount}|${productInfo}|${firstName}|${email}||||||||||${MERCHANT_SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");

  res.status(200).json({
    hash,
    txnid: orderId,
    key: MERCHANT_KEY,
    amount,
    productinfo: productInfo,
    firstname: firstName,
    email,
    phone,
    surl: "https://jewelry-gules.vercel.app/api/payment-success",
    furl: "https://jewelry-gules.vercel.app/api/payment-failure",
    action: PAYU_BASE_URL,
  });
}
