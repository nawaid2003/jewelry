import crypto from "crypto";

const PAYU_CONFIG = {
  merchantKey: process.env.NEXT_PUBLIC_PAYU_MERCHANT_KEY,
  merchantSalt: process.env.PAYU_MERCHANT_SALT,
  baseUrl: process.env.NEXT_PUBLIC_PAYU_BASE_URL || "https://secure.payu.in",
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?step=3&payment=success`,
  failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?step=3&payment=failed`,
};

export const generatePayUHash = (params) => {
  const hashString = [
    params.txnid,
    params.amount,
    params.productinfo,
    params.firstname,
    params.email,
    params.udf1,
    params.udf2,
    params.udf3,
    params.udf4,
    params.udf5,
    "||||||",
    PAYU_CONFIG.merchantSalt,
  ].join("|");

  return crypto.createHash("sha512").update(hashString).digest("hex");
};

export const initPayUPayment = async (paymentData) => {
  const {
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    address,
    city,
    state,
    country,
    zipcode,
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = paymentData;

  const hash = generatePayUHash({
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
  });

  return {
    key: PAYU_CONFIG.merchantKey,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    phone,
    surl: PAYU_CONFIG.successUrl,
    furl: PAYU_CONFIG.failureUrl,
    hash,
    address1: address,
    city,
    state,
    country,
    zipcode,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
  };
};

export const verifyPayUPayment = async (paymentResponse) => {
  // This would typically be done on your server for security
  const hashString = [
    PAYU_CONFIG.merchantSalt,
    paymentResponse.status,
    ...Array(9).fill(""), // For other hash params
    paymentResponse.email,
    paymentResponse.firstname,
    paymentResponse.productinfo,
    paymentResponse.amount,
    paymentResponse.txnid,
  ].join("|");

  const calculatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  return {
    isValid: calculatedHash === paymentResponse.hash,
    paymentResponse,
  };
};
