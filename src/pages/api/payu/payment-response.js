import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      status,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      hash: receivedHash,
      payuMoneyId,
      mihpayid,
    } = req.body;

    const salt = process.env.PAYU_SALT_KEY;

    // Verify hash for security
    const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY}`;
    const calculatedHash = crypto
      .createHash("sha512")
      .update(hashString)
      .digest("hex");

    if (calculatedHash !== receivedHash) {
      return res.status(400).json({ error: "Invalid hash", success: false });
    }

    // Payment successful
    if (status === "success") {
      res.status(200).json({
        success: true,
        message: "Payment successful",
        paymentData: {
          txnid,
          payuMoneyId,
          mihpayid,
          amount,
          status,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment failed or cancelled",
        status,
      });
    }
  } catch (error) {
    console.error("Payment response error:", error);
    res
      .status(500)
      .json({ error: "Payment verification failed", success: false });
  }
}
