import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Debug: Log what we received
    console.log("PayU Hash API called with:", req.body);

    // Get environment variables (server-side, no NEXT_PUBLIC_ needed)
    const merchantSalt = process.env.PAYU_MERCHANT_SALT;
    const merchantKey = process.env.PAYU_MERCHANT_KEY;

    // Debug: Check if environment variables are set
    console.log("Environment check:", {
      merchantKey: merchantKey ? "Set" : "Not set",
      merchantSalt: merchantSalt ? "Set" : "Not set",
    });

    if (!merchantSalt || !merchantKey) {
      console.error("Missing environment variables");
      return res.status(500).json({
        error: "Server configuration error",
        details: "Missing PayU credentials",
      });
    }

    const {
      key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      pg,
    } = req.body;

    // Validate required fields
    if (!key || !txnid || !amount || !productinfo || !firstname || !email) {
      console.error("Missing required fields:", req.body);
      return res.status(400).json({
        error: "Missing required payment parameters",
      });
    }

    // Verify merchant key matches
    if (key !== merchantKey) {
      console.error("Merchant key mismatch");
      return res.status(400).json({
        error: "Invalid merchant key",
      });
    }

    // Create hash string (PayU format)
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${merchantSalt}`;

    // Debug: Log hash string (remove in production)
    console.log("Hash string:", hashString.replace(merchantSalt, "***SALT***"));

    // Generate SHA512 hash
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    console.log("Hash generated successfully");

    return res.status(200).json({ hash });
  } catch (error) {
    console.error("PayU hash generation error:", error);
    return res.status(500).json({
      error: "Server configuration error",
      details: error.message,
    });
  }
}
