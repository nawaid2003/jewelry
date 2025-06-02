export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      `${process.env.ITHINK_BASE_URL}/api_v3/order/add.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...req.body,
          data: {
            ...req.body.data,
            access_token: process.env.ITHINK_API_KEY,
            secret_key: process.env.ITHINK_SECRET_KEY,
          },
        }),
      }
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: `Failed to create order: ${err.message}` });
  }
}
