// pages/api/payu-webhook.js
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const payload = req.body;
    console.log("PayU Webhook Received:", payload);

    // Verify webhook hash (optional, if PayU provides it)
    const { status, authpayuId, notificationType, hash } = payload;
    if (hash) {
      const generatedHash = crypto
        .createHash("sha512")
        .update(
          `${status}|${authpayuId}|${notificationType}||||||${process.env.PAYU_MERCHANT_SALT}`
        )
        .digest("hex");
      if (hash !== generatedHash) {
        return res.status(400).json({ error: "Invalid webhook hash" });
      }
    }

    // Update Firestore based on transaction status
    if (payload.status === "success") {
      const orderRef = doc(db, "orders", payload.txnid);
      await updateDoc(orderRef, {
        paymentInfo: { method: payload.mode, status: "completed" },
        orderStatus: "confirmed",
        updatedAt: new Date().toISOString(),
      });
    } else if (payload.status === "failed") {
      const orderRef = doc(db, "orders", payload.txnid);
      await updateDoc(orderRef, {
        paymentInfo: { method: payload.mode, status: "failed" },
        orderStatus: "failed",
        updatedAt: new Date().toISOString(),
      });
    }

    res.status(200).json({ status: "received" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}
