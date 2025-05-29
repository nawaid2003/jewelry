// pages/api/payment-success.js
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import crypto from "crypto";

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

  const {
    status,
    mihpayid,
    txnid,
    hash,
    amount,
    firstname,
    email,
    productinfo,
  } = req.body;
  const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

  // Format amount to match hash calculation
  const formattedAmount = parseFloat(amount).toFixed(2);
  const hashString = `${MERCHANT_SALT}|${status}||||||||||${email}|${firstname}|${productinfo}|${formattedAmount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;

  // Log hash string for debugging (remove in production)
  console.log("Success Hash String:", hashString);

  const calculatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  if (calculatedHash === hash && status === "success") {
    try {
      const ordersRef = db.collection("orders");
      const query = ordersRef.where("orderId", "==", txnid).limit(1);
      const querySnapshot = await query.get();

      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        await orderDoc.ref.update({
          paymentInfo: {
            method: req.body.mode || "unknown",
            status: "success",
            transactionId: txnid,
            payuId: mihpayid,
            paymentDetails: req.body,
          },
          orderStatus: "confirmed",
          updatedAt: new Date().toISOString(),
        });
      }
      res.redirect(
        301,
        `https://yourdomain.com/order-confirmation?orderId=${txnid}`
      );
    } catch (err) {
      console.error("Error updating Firestore:", err);
      res.redirect(
        301,
        `https://yourdomain.com/payment-failure?orderId=${txnid}`
      );
    }
  } else {
    console.error("Hash verification failed or payment failed");
    res.redirect(
      301,
      `https://yourdomain.com/payment-failure?orderId=${txnid}`
    );
  }
}
