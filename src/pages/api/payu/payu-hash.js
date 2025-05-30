import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { key, txnid, amount, productinfo, firstname, email } = req.body;
  if (!key || !txnid || !amount || !productinfo || !firstname || !email) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${process.env.PAYU_MERCHANT_SALT}`;
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");
  res.status(200).json({ hash });
}
