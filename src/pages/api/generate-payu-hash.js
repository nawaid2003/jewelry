import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .setHeader("Allow", ["POST"])
      .status(405)
      .json({ error: `Method ${req.method} not allowed` });
  }

  try {
    const { merchantSalt, ...params } = req.body;

    if (!merchantSalt) {
      return res.status(400).json({ error: "Merchant salt is required" });
    }

    // Validate numeric fields
    if (isNaN(parseFloat(params.amount))) {
      return res.status(400).json({ error: "Amount must be a number" });
    }

    const hashString = [
      params.txnid || "",
      params.amount || "",
      params.productinfo || "",
      params.firstname || "",
      params.email || "",
      params.udf1 || "",
      params.udf2 || "",
      params.udf3 || "",
      params.udf4 || "",
      params.udf5 || "",
      "",
      "",
      "",
      "",
      "",
      "", // Empty fields
      merchantSalt,
    ].join("|");

    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return res.status(200).json({
      hash,
      debug: process.env.NODE_ENV === "development" ? hashString : undefined,
    });
  } catch (error) {
    console.error("Hash generation error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
