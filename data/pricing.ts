type planType = {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  link: {
    monthly: string;
    yearly: string;
  };
  priceId: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  limitations: string[];
  popular: boolean;
}[];

export const plans: planType = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for personal use",
    link: {
      monthly: "",
      yearly: "",
    },
    priceId: {
      monthly: "",
      yearly: "",
    },
    features: [
      "Up to 25 documents",
      "Up to 3 public document publications",
      "Up to 2 collaborators per document",
      "No export option",
      "Community support",
    ],
    limitations: [
      "Limited file uploads (5MB)",
      "No collaboration features",
      "Basic export options",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 499, yearly: 4999 },
    description: "Best for individuals and small teams",
    link: {
      monthly: "https://buy.stripe.com/test_fZucN7aCm0IA0ow1PK9R600",
      yearly: "https://buy.stripe.com/test_eVq8wR8ueezqb3a0LG9R601",
    },
    priceId: {
      monthly: "price_1S9SvDSV9utSKyUIZamjOz69",
      yearly: "price_1S9T5oSV9utSKyUIBhivCfGV",
    },
    features: [
      "Up to 200 documents",
      "Up to 15 public document publications",
      "Up to 8 collaborators per document",
      "Basic export option (Markdown)",
      "Community support",
    ],
    limitations: [],
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    price: { monthly: 999, yearly: 9999 },
    description: "Best for professionals and growing teams",
    link: {
      monthly: "https://buy.stripe.com/test_6oU3cxeSCcrignu8e89R602",
      yearly: "https://buy.stripe.com/test_6oU7sNaCmcri6MU9ic9R603",
    },
    priceId: {
      monthly: "price_1S9gQTSV9utSKyUIlCBM5H6A",
      yearly: "price_1S9gSrSV9utSKyUIenWXwQjk",
    },
    features: [
      "Unlimited documents",
      "Unlimited public publications",
      "Unlimited collaborators per document",
      "Advanced export options (PDF, Markdown, HTML)",
      "Community support",
    ],
    limitations: [],
    popular: false,
  },
];

export const customerPortalLink: string =
  "https://billing.stripe.com/p/login/test_fZucN7aCm0IA0ow1PK9R600";
