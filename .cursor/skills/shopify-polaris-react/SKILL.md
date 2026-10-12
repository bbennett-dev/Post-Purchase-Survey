---
name: shopify-polaris-react
description: Build this app's embedded admin UI with @shopify/polaris React. Use for Page, Card, BlockStack, TextField, IndexTable, Modal, and survey editor chrome. Prefer React Polaris over s-* Web Components unless the user asks for a specific App Home shell API.
---

# Shopify Polaris React (this repo)

## Default

This workspace is an **embedded Shopify admin app**. Merchant screens and the survey editor use:

- `@shopify/polaris` + `@shopify/polaris-icons`
- `@shopify/app-bridge-react` (`NavMenu`, `TitleBar`, max `Modal`, toasts)

Wrap authenticated routes in both `ShopifyAppProvider` and `PolarisAppProvider` (see `app/routes/app.tsx`). Import Polaris CSS once in `app/root.tsx`.

Docs: [Storybook](https://storybook.polaris.shopify.dev/) · [npm](https://www.npmjs.com/package/@shopify/polaris)

## Do not

- Do not default new UI to `s-page`, `s-stack`, `s-text-field`, `s-button-group`.
- Do not uninstall `@shopify/polaris-types` or App Bridge — they stay for opt-in shell APIs.
- Do not use Polaris React inside checkout UI extensions.
- Do not add `.css` / `.module.css` under `app/components/survey-editor/` — use Polaris components.

## Opt-in Web Components

Only when React has no equivalent (e.g. a platform-only App Home API). Add `// App Home WC: reason` and keep WC out of mixed forms/cards.

## Survey editor (max modal)

- **Max-modal chrome:** `EditorModalProvider` renders `Modal` + `TitleBar` + `SaveBar` as **siblings on the parent page** (grey bar — unsaved / Discard / Save). Editor `src` iframe syncs via `editor-bridge.ts` (`BroadcastChannel`). Do **not** put `SaveBar` only inside the iframe (`saveBar.show is not a function`). **Discard confirm:** `EditorDiscardModal` (Polaris) in iframe — competitor copy, not Save Bar discard UI.
- **Editor body:** `EditorToolbar` + panels only in iframe. Hide `NavMenu` on `/app/surveys/editor`.
- UI: `Box`, `Scrollable`, `InlineGrid`, `BlockStack`, `ButtonGroup`, `RangeSlider`, `DropZone`, `Thumbnail`, `ProgressBar`, etc.
- **No editor CSS files.** Layout exceptions:
  - `EditorFlexLayout.tsx` — flex fill (Polaris `Box` has no flex-grow; not a full-height `Page` shell).
  - `useEditorViewport.ts` — html/body overflow + measured iframe height + drag cursor.
  - `QuestionDragPreview` — inline `left`/`top` only (pointer tracking).
  - HTML5 `draggable` on answer rows / question handles (no Polaris sortable list).
