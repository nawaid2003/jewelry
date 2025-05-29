import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { merchantSalt, ...params } = req.body;

    // Validate required parameters
    const requiredFields = [
      "txnid",
      "amount",
      "productinfo",
      "firstname",
      "email",
    ];
    for (const field of requiredFields) {
      if (!params[field]) {
        return res
          .status(400)
          .json({ error: `Missing required field: ${field}` });
      }
    }

    // Generate hash string in PayU's required format
    const hashString = [
      params.txnid,
      params.amount,
      params.productinfo,
      params.firstname,
      params.email,
      params.udf1 || "",
      params.udf2 || "",
      params.udf3 || "",
      params.udf4 || "",
      params.udf5 || "",
      "", // Empty
      "", // Empty
      "", // Empty
      "", // Empty
      "", // Empty
      "", // Empty
      "", // Empty
      merchantSalt,
    ].join("|");

    // Calculate SHA512 hash
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return res.status(200).json({ hash });
  } catch (error) {
    console.error("Hash generation error:", error);
    return res.status(500).json({ error: "Failed to generate payment hash" });
  }
}
