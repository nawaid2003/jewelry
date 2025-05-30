import crypto from "crypto";

export const generatePayUHash = (data, salt) => {
  const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${salt}`;
  return crypto.createHash("sha512").update(hashString).digest("hex");
};

export const generateTxnId = () => {
  return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const formatPayUProductInfo = (items) => {
  return items
    .map(
      (item) =>
        `${item.name}${
          item.ringDetails ? ` (${item.ringDetails.sizeDisplay})` : ""
        }`
    )
    .join(", ")
    .substring(0, 100); // PayU limit
};

export const validatePayUResponse = (responseData, salt, merchantKey) => {
  const {
    status,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    hash: receivedHash,
  } = responseData;

  const hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${merchantKey}`;
  const calculatedHash = crypto
    .createHash("sha512")
    .update(hashString)
    .digest("hex");

  return calculatedHash === receivedHash;
};
