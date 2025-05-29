import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error("Firebase environment variables are missing");
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { txnid, error_Message } = req.body;

  try {
    const ordersRef = db.collection("orders");
    const query = ordersRef.where("orderId", "==", txnid).limit(1);
    const querySnapshot = await query.get();

    if (!querySnapshot.empty) {
      const orderDoc = querySnapshot.docs[0];
      await orderDoc.ref.update({
        paymentInfo: {
          status: "failed",
          transactionId: txnid,
          error: error_Message || "Payment failed",
        },
        orderStatus: "failed",
        updatedAt: new Date().toISOString(),
      });
    }
    res.redirect(
      301,
      `https://jewelry-gules.vercel.app/payment-failure?orderId=${txnid}`
    );
  } catch (err) {
    console.error("Error updating Firestore:", err);
    res.redirect(
      301,
      `https://jewelry-gules.vercel.app/payment-failure?orderId=${txnid}`
    );
  }
}
