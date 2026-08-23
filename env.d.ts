/// <reference types="vite/client" />
/// <reference types="@react-router/node" />

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL?: string;
    DIRECT_URL?: string;
    SHOPIFY_API_KEY?: string;
    SHOPIFY_API_SECRET?: string;
    SCOPES?: string;
    SHOPIFY_APP_URL?: string;
    SHOP_CUSTOM_DOMAIN?: string;
  }
}
