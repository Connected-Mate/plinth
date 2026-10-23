# Directory listings: prepared, not submitted

## Official MCP Registry (registry.modelcontextprotocol.io)

**Source of truth: `~/Projects/plinth-bridge/server.json`.** It passes the 2025-12-11 schema (checked with ajv by plinth-bridge). It will live in the public repo `Connected-Mate/plinth-bridge`. The old draft that used to sit here was removed so there is only one copy.

Why a bridge: the registry only accepts public HTTPS remotes. Its `IsValidRemoteURL` check rejects non-https URLs, and the docs say "A remote server MUST be publicly accessible". Plinth listens on `http://<phone-ip>:<port>/mcp`, on the local Wi‑Fi only. The npm stdio package `@connected-mate/plinth-bridge` finds the phone over Bonjour (`_plinth._tcp`) and proxies MCP to it.

Still needed before publishing, in this order. Each step is the lead's or Alex's call.
1. Push `Connected-Mate/plinth-bridge` public on GitHub.
2. Run `npm publish --access public` for `@connected-mate/plinth-bridge@1.0.0`. Its `package.json` already has `"mcpName": "io.github.Connected-Mate/plinth"`, which is how the registry verifies ownership. Today `npm view` returns 404: it is not published.
3. From `~/Projects/plinth-bridge`, run:
   ```sh
   brew install mcp-publisher
   mcp-publisher login github     # browser device flow, as Connected-Mate; check the namespace casing it grants
   mcp-publisher publish
   ```
4. After npm publish, add the one-line install to the site's `/agents/` page and `llms.txt`:
   `claude mcp add plinth -- npx -y @connected-mate/plinth-bridge`. It is deliberately not on the site yet, because it would fail until the package exists.

## awesome-mcp-servers (punkpeye)

Its scope is "servers with a public GitHub repository — something you install and run yourself". Plinth's app code is private, but the bridge repo can be the listed one. It becomes **eligible once `Connected-Mate/plinth-bridge` is public**. The line to add under "🏢 Workplace & Productivity", in alphabetical order, would be:

```
- [Connected-Mate/plinth-bridge](https://github.com/Connected-Mate/plinth-bridge) 📇 🏠 🍎 - iPhone app that is an MCP server on your Wi‑Fi: agents pair with a 6-digit code, then push notes, checklists, offline HTML mini-apps, Home Screen widgets, Live Activities and notifications. No server, no account.
```

📇 means TypeScript (the bridge), and 🏠 means local service. Their README syncs with glama.ai, which may then show a score badge.
