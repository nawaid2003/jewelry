import crypto from "crypto";
import { PAYU_CONFIG } from "./config";

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
