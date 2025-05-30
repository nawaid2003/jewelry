import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { key, txnid, amount, productinfo, firstname, email } = req.body;
    const salt = process.env.PAYU_SALT_KEY;

    if (!salt) {
      return res.status(500).json({ error: "PayU configuration missing" });
    }

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    res.status(200).json({ hash });
  } catch (error) {
    console.error("Hash generation error:", error);
    res.status(500).json({ error: "Hash generation failed" });
  }
}
