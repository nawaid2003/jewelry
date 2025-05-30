// pages/api/payu-hash.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { key, txnid, amount, productinfo, firstname, email } = req.body;
    if (!key || !txnid || !amount || !productinfo || !firstname || !email) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    res.status(200).json({ hash });
  } catch (error) {
    console.error("Hash generation error:", error);
    res.status(500).json({ error: "Failed to generate hash" });
  }
}
