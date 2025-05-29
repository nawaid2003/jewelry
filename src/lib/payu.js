//lib/payu.js
import crypto from "crypto";
import { PAYU_CONFIG } from "./config";

export const generatePayUHash = (params) => {
  // Correct hash string format according to PayU documentation:
  // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
  const hashString = [
    PAYU_CONFIG.merchantKey, // ← This was missing in your original code
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1 || "",
    params.udf2 || "",
    params.udf3 || "",
    params.udf4 || "",
    params.udf5 || "",
    "",
    "",
    "",
    "",
    "",
    "", // Six empty fields for unused parameters
    PAYU_CONFIG.merchantSalt,
  ].join("|");

  console.log("Hash string:", hashString); // For debugging - remove in production
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

export const initPayUPayment = async (paymentData) => {
  const hash = generatePayUHash({
    txnid: paymentData.txnid,
    amount: paymentData.amount,
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
    txnid: paymentData.txnid,
    amount: paymentData.amount,
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

// Optional: Function to verify response hash (reverse hashing)
export const verifyPayUResponse = (responseData) => {
  // Reverse hash format: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
  const hashString = [
    PAYU_CONFIG.merchantSalt,
    responseData.status || "",
    "",
    "",
    "",
    "",
    "",
    "", // Six empty fields
    responseData.udf5 || "",
    responseData.udf4 || "",
    responseData.udf3 || "",
    responseData.udf2 || "",
    responseData.udf1 || "",
    responseData.email,
    responseData.firstname,
    responseData.productinfo,
    responseData.amount,
    responseData.txnid,
    PAYU_CONFIG.merchantKey,
  ].join("|");

  const calculatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");
  return calculatedHash === responseData.hash;
};
