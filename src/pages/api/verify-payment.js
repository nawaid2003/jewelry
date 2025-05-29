import { verifyPayUPayment } from "../../lib/payu";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { paymentResponse, orderId } = req.body;

    // Verify payment
    const { isValid, paymentResponse: verifiedResponse } =
      await verifyPayUPayment(paymentResponse);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid payment response" });
    }

    // Update Firestore with payment details
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      "paymentInfo.status": verifiedResponse.status,
      "paymentInfo.transactionId": verifiedResponse.txnid,
      "paymentInfo.bankRef": verifiedResponse.bank_ref_num || null,
      "paymentInfo.mode": verifiedResponse.mode || null,
      "paymentInfo.gateway": "PayU",
      orderStatus:
        verifiedResponse.status === "success" ? "confirmed" : "failed",
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return res.status(500).json({ error: "Payment verification failed" });
  }
}
