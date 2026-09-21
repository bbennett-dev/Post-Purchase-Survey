# PROJECT_CONTEXT.md — Post-Purchase Survey & Attribution (HDYHAU)

## 1. Product Identity & Business Strategy
- **Studio Brand**: 
- **Founder / Persona**: (@dev)
- **App Listing Name**:  Free Post Purchase Survey & HDYHAU
- **Value Proposition**: 100% free, zero-bloat post-purchase attribution survey app that captures real customer acquisition channels right on the order confirmation page[cite: 1, 6].
- **Core Wedge**: Free forever with unlimited responses to easily acquire active DTC merchants, capture market share from expensive incumbents (KnoCommerce, Grapevine), and collect 5-star reviews[cite: 1, 6].

---

## 2. Technical Stack & Current Status
- **Framework**: Official Shopify React Router App Template (`@shopify/shopify-app-react-router` running React Router v7 on Vite)[cite: 1].
- **Admin UI System**: `@shopify/polaris` design components + `@shopify/app-bridge-react` v4[cite: 1].
- **Storefront Block**: Shopify Checkout UI Extension (`@shopify/ui-extensions-react/checkout`) targeting `purchase.thank-you.block.render`[cite: 1].
- **Backend Routing**: Node.js & TypeScript full-stack routes (`loader` and `action` architecture)[cite: 1].
- **Current State**: App template is scaffolded, authenticated via Shopify CLI, and connected to the Partner Development Dashboard[cite: 1]. Core template authentication (`shopify.server.ts` and `app/routes/app.tsx`) is operational and untouched[cite: 1].

---

## 3. Strict Architectural Directive: UI-First Approach
> **CRITICAL INSTRUCTION FOR CODING AGENT / CURSOR:**
> **Do NOT define or lock in the database schema, Prisma models, or persistence logic yet.**
> 
> We are using **Schema-Driven UI Design (UI-First)**:
> 1. We will first build and iterate on the complete Merchant Admin UI (`app/routes/app._index.tsx`) and Checkout Extension UI using **mocked data**.
> 2. We will analyze competitor features, screen layouts, form inputs, toggles, and analytics cards to finalize the visual experience and required fields.
> 3. Only once the UI and merchant workflows are finalized will we derive the PostgreSQL / ORM schema and build the persistent backend APIs.

---

## 4. Feature Blueprint (To Be Mocked First)

### A. Merchant Admin Dashboard (`app/routes/app._index.tsx`)
1. **Survey Configuration**:
   - Active status toggle (enable/disable the widget on the Thank You page)[cite: 1].
   - Custom survey question header (default: *"How did you hear about us?"*)[cite: 1].
   - Preset channel options list (e.g., TikTok, Instagram, Facebook, Google, YouTube, Friend/Word of Mouth, Other)[cite: 1].
   - Add, edit, delete, and reorder controls for survey options[cite: 1].
   - Optional open-text field toggle when a customer picks "Other"[cite: 1].
2. **Attribution Analytics & Reporting**:
   - Top KPI summary cards: Total Responses, Top Performing Channel, Response Rate (%)[cite: 1].
   - Visual breakdown: Channel distribution table or percentage list[cite: 1].
   - Recent responses table: Order ID, Selected Channel, Custom Text, Timestamp[cite: 1].
   - "Export to CSV" action button[cite: 1].

### B. Thank You Page Checkout Extension (`extensions/*/src/Checkout.tsx`)
- Lightweight, zero-bloat block rendered on `purchase.thank-you.block.render`[cite: 1].
- Strictly uses `@shopify/ui-extensions-react/checkout` components (ChoiceList/Select, TextField, Button, Banner, BlockStack)[cite: 1].
- Zero DOM/HTML elements (no `<div>`, `<button>`, `<input>`, or CSS stylesheets)[cite: 1].
- Displays submitted state (`<Banner status="success">`) to prevent duplicate entries on page refresh[cite: 1].

---

## 5. Development Invariants & Engineering Standards
1. **Polaris UI Strictly in Admin**: Never render standard HTML primitives (`<div>`, `<span>`, `<p>`, `<button>`) inside `app/routes/app.*.tsx`. Always use Polaris layout components (`Page`, `Layout`, `Card`, `BlockStack`, `InlineStack`, `Text`, `Button`, `TextField`)[cite: 1].
2. **App Bridge Integration**: Use `@shopify/app-bridge-react` for merchant alerts and native toast notifications[cite: 1].
3. **TypeScript Strictness**: Use clean TypeScript interfaces for all mock states, component props, and loaders. Avoid `any`.
4. **Single-Feature Cadence**: Stabilize each UI section with clean loading and empty states before moving to the next.