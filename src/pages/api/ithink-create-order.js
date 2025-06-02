// pages/api/ithink-create-order.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { orderId, customerInfo, items, shippingInfo, orderSummary } = req.body;

  const ITHINK_CONFIG = {
    apiKey: process.env.ITHINK_API_KEY,
    secretKey: process.env.ITHINK_SECRET_KEY,
    baseUrl:
      process.env.ITHINK_ENV === "production"
        ? "https://www.ithinklogistics.com/api_v3"
        : "https://pre-alpha.ithinklogistics.com/api_v3",
    pickup_pincode: process.env.ITHINK_PICKUP_PINCODE || "110001",
  };

  try {
    // Prepare order data for iThink Logistics
    const shippingOrderData = {
      api_key: ITHINK_CONFIG.apiKey,
      secret_key: ITHINK_CONFIG.secretKey,

      // Order details
      order_id: orderId,
      order_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD format

      // Pickup details (your warehouse)
      pickup_name: "Silver Lining Store", // Replace with your business name
      pickup_phone: "9999999999", // Replace with your phone number
      pickup_pincode: ITHINK_CONFIG.pickup_pincode,
      pickup_address: "Your warehouse address", // Replace with actual address
      pickup_city: "Your City", // Replace with actual city
      pickup_state: "Your State", // Replace with actual state

      // Customer delivery details
      customer_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
      customer_phone: customerInfo.phone,
      customer_email: customerInfo.email,
      customer_address: customerInfo.address,
      customer_city: customerInfo.city,
      customer_state: customerInfo.state,
      customer_pincode: customerInfo.pincode,

      // Shipment details
      weight: shippingInfo.total_weight,
      length: 20, // Default package dimensions - adjust as needed
      breadth: 15,
      height: 10,

      // Product details
      product_name: items.map((item) => item.name).join(", "),
      product_quantity: items.reduce((total, item) => total + item.quantity, 0),

      // Payment details
      total_amount: orderSummary.total,
      payment_mode: "prepaid", // Since you're using PayU

      // Selected courier
      courier_id: shippingInfo.courier_id,

      // Additional options
      is_fragile: 1, // Jewelry is fragile
      is_dangerous: 0,

      // Return address (same as pickup usually)
      return_name: "Silver Lining Store",
      return_phone: "9999999999",
      return_address: "Your warehouse address",
      return_city: "Your City",
      return_state: "Your State",
      return_pincode: ITHINK_CONFIG.pickup_pincode,
    };

    // Create shipping order
    const response = await fetch(`${ITHINK_CONFIG.baseUrl}/create_order.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shippingOrderData),
    });

    const result = await response.json();

    if (result.status === "Success") {
      res.status(200).json({
        success: true,
        ithink_order_id: result.order_id,
        awb_number: result.awb_number,
        tracking_url: result.tracking_url,
        label_url: result.label_url,
        message: "Shipping order created successfully",
      });
    } else {
      console.error("iThink Create Order Error:", result);
      res.status(400).json({
        success: false,
        message: result.message || "Failed to create shipping order",
      });
    }
  } catch (error) {
    console.error("Error creating shipping order:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while creating shipping order",
    });
  }
}
