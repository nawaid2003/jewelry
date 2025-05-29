/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "placehold.co"],
  },
};

module.exports = {
  env: {
    NEXT_PUBLIC_PAYU_MERCHANT_KEY: process.env.PAYU_MERCHANT_KEY,
    NEXT_PUBLIC_PAYU_PAYMENT_URL: "https://secure.payu.in/_payment",
  },
};
