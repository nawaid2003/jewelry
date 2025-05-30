// pages/api/payu-webhook.js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const { txnid, status } = req.body;
    console.log(`Webhook received: Transaction ${txnid} - Status ${status}`);
    // Update order status in Firestore if needed
    res.status(200).json({ status: "received" });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
