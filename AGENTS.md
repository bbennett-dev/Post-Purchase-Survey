# Shopify app development

This app is scaffolded from a Shopify app template. See the README for framework-specific details.

**Admin UI:** `@shopify/polaris` React is the default for embedded merchant screens and the survey editor. App Bridge + Polaris Web Components (`s-*`) stay installed for platform shell APIs only — do not build whole pages in Web Components. Checkout UI extensions use `@shopify/ui-extensions`, not Polaris.

Use the [Shopify AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit) for all Shopify API and platform work. If missing, install it in the agent host per that page (or `npx skills add Shopify/shopify-ai-toolkit --list` for skill-compatible hosts) — do not add tooling to this repo.

**Cursor workflow (MCP + skills + subagents):** see [.cursor/SHOPIFY_CURSOR_WORKFLOW.md](.cursor/SHOPIFY_CURSOR_WORKFLOW.md). Shopify Dev MCP is configured in `.cursor/mcp.json`.
