# Privacy Policy

**Effective date:** [Effective date]  
**App name:** Post-Purchase Survey (HDYHAU)  
**Data controller for buyer data:** The Shopify merchant using this app  
**App provider / processor:** [Legal entity name]

> This document is a template for your app and App Store listing. It is not legal advice. Have qualified counsel review before publication.

## 1. Introduction

[Legal entity name] ("we", "us") provides the Post-Purchase Survey application for Shopify merchants. Merchants use the app to collect post-purchase feedback from their customers. This policy explains how we process personal data when merchants install and use the app.

## 2. Roles

- **Merchants** are the data controllers for their customers' personal data collected through surveys.
- **We** act as a data processor on behalf of merchants, storing and displaying survey responses and related order context as instructed by the merchant through the app.

## 3. Data we process

### 3.1 Merchant staff (Shopify admin users)

- Shop domain, OAuth session tokens (stored securely for app operation)
- Actions taken in the embedded admin app

### 3.2 Customers (buyers)

When a customer submits a survey on the Thank you or Order status experience, we may process:

- Survey answers (choices, text, ratings, dates, uploaded file URLs when merchants enable upload questions)
- Order identifier and order name
- Email address, customer name, and customer id (when permitted by Shopify protected customer data access)
- Product and variant context, country/region, device type, completion metrics
- Channel and page metadata (e.g. thank-you vs order-status)

We enrich some fields using the Shopify Admin API (orders, customers, products) when the merchant has granted scopes and a valid app session exists.

### 3.3 Data we do not sell

We do not sell personal data. We do not use buyer data for third-party advertising.

## 4. Purposes

- Provide survey collection, storage, and reporting to the merchant
- Operate checkout UI extensions and admin features
- Analytics and performance measurement for the app (aggregated where possible)
- Comply with legal obligations and Shopify mandatory webhooks

## 5. Legal bases (merchant relationship)

Merchants install the app under Shopify's terms and our app terms. Processing of buyer data is for the merchant's legitimate business purposes in running surveys and understanding post-purchase feedback.

## 6. Retention and deletion

- Data is retained while the app is installed and as needed to provide the service.
- When the merchant uninstalls the app, shop survey configuration and responses are deleted from our systems (and Shopify `shop/redact` is honored).
- Customer erasure requests are handled via Shopify `customers/redact` webhooks and merchant support processes.
- On `customers/data_request`, we compile survey responses we hold for that customer and support the merchant in fulfilling the request within 30 days.

## 7. Subprocessors

We use infrastructure providers to host the app and database (for example cloud hosting and managed PostgreSQL). Shopify hosts checkout and admin surfaces. A current list is available on request at [Support email].

## 8. Security

We use HTTPS in transit, access controls for production systems, webhook HMAC verification, and Shopify session token authentication for admin routes. Checkout submissions require a valid Shopify checkout session token.

## 9. International transfers

Data may be processed in regions where our hosting providers operate. We use appropriate safeguards as required by applicable law.

## 10. Your rights (buyers)

Buyers should contact the **merchant** first for access, correction, or deletion. Merchants may contact us at [Support email] for assistance exporting or deleting survey data we store for their shop.

## 11. Merchant contact

**Email:** [Support email]  
**Address:** [Physical address or registered office]

## 12. Changes

We may update this policy. We will post the revised version at `https://[your-production-domain]/privacy` and update the effective date.
