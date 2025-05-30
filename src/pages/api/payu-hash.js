// pages/api/payu-hash.js
export default async function handler(req, res) {
  // Set CORS headers if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { key, txnid, amount, productinfo, firstname, email } = req.body;

    // Log the incoming request for debugging
    console.log("Received payment hash request:", {
      key: key ? "***" : "missing",
      txnid,
      amount,
      productinfo,
      firstname,
      email,
    });

    if (!key || !txnid || !amount || !productinfo || !firstname || !email) {
      console.error("Missing required parameters:", {
        key: !!key,
        txnid: !!txnid,
        amount: !!amount,
        productinfo: !!productinfo,
        firstname: !!firstname,
        email: !!email,
      });
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Check if PAYU_MERCHANT_SALT is available
    if (!process.env.PAYU_MERCHANT_SALT) {
      console.error("PAYU_MERCHANT_SALT environment variable is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;

    // Log hash string for debugging (without salt)
    console.log(
      "Hash string (without salt):",
      `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||***`
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    console.log("Hash generated successfully");
    res.status(200).json({ hash });
  } catch (error) {
    console.error("Hash generation error:", error);
    res
      .status(500)
      .json({ error: "Failed to generate hash", details: error.message });
  }
}
