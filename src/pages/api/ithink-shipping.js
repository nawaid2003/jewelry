// pages/api/ithink-shipping.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    destination_pincode,
    weight = 0.5, // Default weight in kg
    length = 10, // Default dimensions in cm
    breadth = 10,
    height = 5,
    cod_amount = 0,
  } = req.body;

  const ITHINK_CONFIG = {
    apiKey: process.env.ITHINK_API_KEY,
    secretKey: process.env.ITHINK_SECRET_KEY,
    baseUrl:
      process.env.ITHINK_ENV === "production"
        ? "https://www.ithinklogistics.com/api_v3"
        : "https://pre-alpha.ithinklogistics.com/api_v3",
    pickup_pincode: process.env.ITHINK_PICKUP_PINCODE || "110001", // Your warehouse pincode
  };

  try {
    // Get shipping rates from iThink Logistics
    const rateResponse = await fetch(
      `${ITHINK_CONFIG.baseUrl}/rate_calculator.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: ITHINK_CONFIG.apiKey,
          secret_key: ITHINK_CONFIG.secretKey,
          pickup_pincode: ITHINK_CONFIG.pickup_pincode,
          destination_pincode: destination_pincode,
          weight: weight,
          length: length,
          breadth: breadth,
          height: height,
          cod_amount: cod_amount,
        }),
      }
    );

    const rateData = await rateResponse.json();

    if (rateData.status === "Success") {
      // Filter and format the shipping options
      const shippingOptions = rateData.data
        .filter((option) => option.rate > 0) // Only show options with valid rates
        .map((option) => ({
          courier_name: option.courier_name,
          rate: parseFloat(option.rate),
          estimated_delivery_days: option.estimated_delivery_days || "N/A",
          cod_available: option.cod_available === "yes",
          service_type: option.service_type || "Standard",
          courier_id: option.courier_id,
        }))
        .sort((a, b) => a.rate - b.rate); // Sort by price, lowest first

      res.status(200).json({
        success: true,
        shipping_options: shippingOptions,
        default_option: shippingOptions[0] || null,
      });
    } else {
      console.error("iThink API Error:", rateData);
      res.status(400).json({
        success: false,
        message: rateData.message || "Failed to get shipping rates",
      });
    }
  } catch (error) {
    console.error("Shipping API Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
