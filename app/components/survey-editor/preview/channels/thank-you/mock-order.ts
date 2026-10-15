export interface ThankYouPreviewLineItem {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  quantity: number;
  imageUrl: string;
}

export const THANK_YOU_PREVIEW_ORDER = {
  confirmationCode: "DQFDHG5E0",
  customerName: "Jordan",
  contactEmail: "jordan.chen@domain.com",
  shippingAddress: [
    "Jordan Chen",
    "151 O'Connor St",
    "Ottawa, ON, K2P 2L8",
    "Canada",
  ],
  shippingMethod: "Economy",
  paymentLine: "Visa •••• 1234 — $74.00",
  billingAddress: [
    "Jordan Chen",
    "151 O'Connor St",
    "Ottawa, ON, K2P 2L8",
    "Canada",
  ],
  subtotal: "$157.00",
  tax: "$5.00",
  total: "$162.00",
  lineItems: [
    {
      id: "1",
      title: "Monstera plant",
      subtitle: "Concrete pot",
      price: "$59.00",
      quantity: 1,
      imageUrl:
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
    },
    {
      id: "2",
      title: "Snake plant",
      subtitle: "Matte black",
      price: "$49.00",
      quantity: 1,
      imageUrl:
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
    },
    {
      id: "3",
      title: "Watering can",
      subtitle: "Matte black",
      price: "$49.00",
      quantity: 1,
      imageUrl:
        "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-3_large.png",
    },
  ] satisfies ThankYouPreviewLineItem[],
};
