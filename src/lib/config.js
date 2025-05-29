export const PAYU_CONFIG = {
  merchantKey: process.env.PAYU_MERCHANT_KEY,
  merchantSalt: process.env.PAYU_MERCHANT_SALT,
  baseUrl: process.env.NEXT_PUBLIC_PAYU_BASE_URL || "https://secure.payu.in",
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?step=3&payment=success`,
  failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?step=3&payment=failed`,
};
