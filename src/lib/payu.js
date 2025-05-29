import crypto from "crypto";
import { PAYU_CONFIG } from "./config";

export const generatePayUHash = (params) => {
  // Ensure all parameters are strings and handle empty values
  const hashString = [
    params.txnid || "",
    params.amount || "",
    params.productinfo || "",
    params.firstname || "",
    params.email || "",
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "", // Empty
    "", // Empty
    "", // Empty
    "", // Empty
    "", // Empty
    "", // Empty
    "", // Empty
    PAYU_CONFIG.merchantSalt,
  ].join("|");

  console.log("Hash String:", hashString); // For debugging
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

export const initPayUPayment = async (paymentData) => {
  // Ensure all required fields have values
  const requiredFields = [
    "txnid",
    "amount",
    "productinfo",
    "firstname",
    "email",
  ];
  for (const field of requiredFields) {
    if (!paymentData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  const hash = generatePayUHash({
    txnid: paymentData.txnid.toString(),
    amount: paymentData.amount.toString(),
    productinfo: paymentData.productinfo,
    firstname: paymentData.firstname,
    email: paymentData.email,
    udf1: paymentData.udf1 || "",
    udf2: paymentData.udf2 || "",
    udf3: paymentData.udf3 || "",
    udf4: paymentData.udf4 || "",
    udf5: paymentData.udf5 || "",
  });

  return {
    key: PAYU_CONFIG.merchantKey,
    txnid: paymentData.txnid.toString(),
    amount: paymentData.amount.toString(),
    productinfo: paymentData.productinfo,
    firstname: paymentData.firstname,
    email: paymentData.email,
    phone: paymentData.phone || "",
    surl: PAYU_CONFIG.successUrl,
    furl: PAYU_CONFIG.failureUrl,
    hash,
    address1: paymentData.address || "",
    city: paymentData.city || "",
    state: paymentData.state || "",
    country: paymentData.country || "India",
    zipcode: paymentData.zipcode || "",
    udf1: paymentData.udf1 || "",
    udf2: paymentData.udf2 || "",
    udf3: paymentData.udf3 || "",
    udf4: paymentData.udf4 || "",
    udf5: paymentData.udf5 || "",
  };
};
