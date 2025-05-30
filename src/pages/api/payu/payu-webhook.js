// pages/api/payu-webhook.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;
    console.log("PayU Webhook Received:", payload);

    // Verify the webhook payload (optional, for security)
    const { status, authpayuId, notificationType, hash } = payload;
    const generatedHash = crypto
      .createHash("sha512")
      .update(
        `${status}|${authpayuId}|${notificationType}||||||${process.env.PAYU_MERCHANT_SALT}`
      )
      .digest("hex");

    if (hash && hash !== generatedHash) {
      return res.status(400).json({ error: "Invalid webhook hash" });
    }

    // Process webhook events (e.g., update Firestore order status)
    if (payload.status === "success") {
      // Update Firestore order with txnid (payload.txnid)
      console.log(`Transaction ${payload.txnid} successful`);
    } else if (payload.status === "failed") {
      console.log(`Transaction ${payload.txnid} failed`);
    }

    // Acknowledge webhook with 200 OK
    res.status(200).json({ status: "received" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
