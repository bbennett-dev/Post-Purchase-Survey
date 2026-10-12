# Shopify development in Cursor (this repo)

How MCP, plugins, skills, rules, and subagents fit together for **Post-Purchase Survey**.

## What you already have (no install required)

| Layer | Location | Status |
|-------|----------|--------|
| **Shopify Dev MCP** | `.cursor/mcp.json` + `.mcp.json` → `npx @shopify/dev-mcp@latest` | Configured |
| **Shopify plugin + `/shopify` skill** | Cursor → Plugins → Shopify (bundled skill + doc search/validate scripts) | Enable in Cursor UI if needed |
| **Repo rules** | `.cursor/rules/*.mdc` | Always on (Polaris hybrid, checkout guardrails, stabilization loop) |
| **Repo skill** | `.cursor/skills/shopify-polaris-react/SKILL.md` | Polaris React for this app |
| **Commerce subagent** | `shopify-expert` (Cursor agent type) | Invoke with `/shopify-expert` or ask for Shopify audit |
| **Personal skills** | Your user store (`shopify-admin-graphql`, `shopify-app-api-patterns`, etc.) | Agent uses when relevant |

Official MCP docs: [Shopify Dev MCP](https://shopify.dev/docs/apps/build/devmcp)

---

## 1. Shopify Dev MCP — what it does

The MCP server gives the **agent** tools (not you directly in the terminal):

| Tool | Purpose |
|------|---------|
| `learn_shopify_api` | **Call first.** Picks API surface (`admin`, `custom-data`, `polaris-checkout-extensions`, …) and returns a `conversationId`. |
| `search_docs_chunks` | Searches **shopify.dev** for current docs (use your API version, e.g. `2026-07`). |
| `validate` | Checks GraphQL, checkout extension JSX, etc. against Shopify schemas (reduces hallucinated fields). |
| `feedback` | Agent reports whether MCP helped (telemetry for Shopify). |

**You do not run MCP manually** in normal dev. In **Agent** chat, ask Shopify questions; the agent should call MCP when writing Admin API, metafields, or checkout extension code.

### Verify MCP in Cursor

1. **Cursor Settings → MCP** (or Features → MCP).
2. Confirm **shopify-dev-mcp** is listed and **green / ready** (project config loads from `.cursor/mcp.json`).
3. If it shows **needs auth**, run the auth flow once when the agent calls `mcp_auth`.
4. In Agent chat, try:  
   `Use Shopify Dev MCP: learn_shopify_api for custom-data, then search how metafieldsSet works for shop-owned $app metafields at 2026-07.`

---

## 2. Shopify plugin + `/shopify` skill

The **Shopify plugin** ships the **`shopify` skill** (routing table: Admin, checkout extensions, Liquid, CLI, app store review, …).

| How to invoke | What happens |
|---------------|--------------|
| Type **`/shopify`** or attach **`@shopify`** skill in chat | Agent reads `SKILL.md`, runs `search_docs.mjs` / `validate.mjs` from the plugin cache with the **correct API topic**. |
| Natural language + “use Shopify skill” | Same, if the skill is attached or listed in available skills. |

**Best for:** choosing the right API surface, validated GraphQL, checkout extension targets, TOML/metafield patterns.

**Not a replacement for:** `shopify app dev`, your Remix loaders, or running tests — use CLI locally for that.

---

## 3. Repo rules + repo skill (automatic)

| Asset | When it applies |
|-------|-----------------|
| `.cursor/rules/03-admin-ui-hybrid.mdc` | All `app/` UI → **Polaris React**; WC only for TitleBar/modal shell. |
| `.cursor/rules/02-checkout-extension-guardrails.mdc` | `extensions/thank-you-survey/` |
| `.cursor/skills/shopify-polaris-react/SKILL.md` | Survey editor + admin pages |

Mention in chat when you want them explicit:  
`Follow shopify-polaris-react skill and hybrid admin rule.`

---

## 4. Subagents (`shopify-expert`, `explore`, …)

Subagents are **separate agent runs** the main agent can spawn.

| Invoke | Subagent | Use when |
|--------|----------|----------|
| **`/shopify-expert`** | `shopify-expert` | Audit, architecture, publish/metafields, BFS, API version alignment |
| “Use explore agent to find …” | `explore` | Fast codebase search |

**Parallelism:** The main agent can start **one subagent** while continuing work, but **avoid two agents editing the same files at once**. Safer pattern:

1. **Main chat** = single feature (your stabilization rule).
2. **Subagent** = read-only audit or research, then main agent implements.

---

## 5. Recommended workflow (one feature at a time)

```text
You: /shopify-expert — audit publish merge for multi-survey metafields

Agent: MCP learn_shopify_api(custom-data) → search_docs → report → stop for your OK

You: Implement merge publish only. Use admin GraphQL skill patterns. typecheck when done.

Agent: Code in app/lib/survey/* → validate via MCP → npm run typecheck
```

---

## 6. Copy-paste examples (this project)

### Admin + metafields (MCP + skill)

```text
/shopify
Fix publish so saving one survey merges into shop checkout_surveys without wiping others.
Use custom-data + admin at 2026-07. Validate GraphQL before returning code.
```

### Checkout extension submit

```text
/shopify
Add thank-you survey response submit per polaris-checkout-extensions target
purchase.thank-you.block.render — enable network_access pattern from docs.
Follow .cursor/rules/02-checkout-extension-guardrails.mdc.
```

### Polaris editor UI only (no MCP required)

```text
Follow shopify-polaris-react skill. Match competitor editor layout using Polaris only;
no new CSS under survey-editor.
```

### Full audit (subagent)

```text
/shopify-expert
Audit repo for App Store readiness: GDPR webhooks, scopes in shopify.app.toml,
checkout E2E, hybrid UI policy.
```

### CLI / config validation

```text
/shopify
use-shopify-cli topic: validate shopify.app.toml and extensions/thank-you-survey/shopify.extension.toml before deploy.
```

---

## 7. Optional setup checklist

- [ ] **Node 18+** and **`shopify`** CLI installed (`shopify version`).
- [ ] **Cursor MCP**: shopify-dev-mcp **ready** (see §1).
- [ ] **Cursor Plugins**: Shopify plugin **enabled** (Settings → Plugins).
- [ ] **Personal skills** synced in Cursor (User store skills you already added).
- [ ] **Dev loop**: `shopify app dev` in terminal; Agent chat for Shopify-specific code/docs.

---

## 8. What not to expect

- MCP does **not** replace **`shopify app dev`** or OAuth — it helps the **agent** write correct Shopify code and read docs.
- **`/shopify`** does not automatically run subagents; use **`/shopify-expert`** explicitly for deep audits.
- True **parallel edits** from multiple agents on one branch are risky; use subagents for **research/audit**, main chat for **implementation**.
