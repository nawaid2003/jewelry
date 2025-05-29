import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
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
    const missingFields = requiredFields.filter((field) => !params[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
        receivedData: params,
      });
    }

    // Validate amount is a positive number
    if (isNaN(parseFloat(params.amount)) || parseFloat(params.amount) <= 0) {
      return res.status(400).json({
        error: "Amount must be a positive number",
        receivedAmount: params.amount,
      });
    }

    // Prepare hash string (PayU's exact required format)
    const hashString = [
      params.txnid.toString().trim(),
      parseFloat(params.amount).toFixed(2),
      params.productinfo.toString().substring(0, 100).trim(),
      params.firstname.toString().trim(),
      params.email.toString().trim(),
      params.udf1?.toString().trim() || "",
      params.udf2?.toString().trim() || "",
      params.udf3?.toString().trim() || "",
      params.udf4?.toString().trim() || "",
      params.udf5?.toString().trim() || "",
      "",
      "",
      "",
      "",
      "",
      "", // Empty fields as per PayU requirements
      merchantSalt.toString().trim(),
    ].join("|");

    // Generate hash
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    return res.status(200).json({
      success: true,
      hash,
      // Debug info only shown in development
      ...(process.env.NODE_ENV === "development" && {
        debug: {
          hashString,
          receivedParams: params,
        },
      }),
    });
  } catch (error) {
    console.error("Hash generation error:", error);
    return res.status(500).json({
      error: "Internal server error",
      ...(process.env.NODE_ENV === "development" && {
        details: error.message,
      }),
    });
  }
}
