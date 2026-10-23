# Directory listings: prepared, not submitted

## Official MCP Registry (registry.modelcontextprotocol.io)

`server.draft.json` validates against the 2025-12-11 server schema. It is **not publishable yet**, for the reasons below. They come from the registry's own rules (`docs/modelcontextprotocol-io/remote-servers.mdx`, `internal/validators/utils.go`).

1. **A remote must be public HTTPS.** `IsValidRemoteURL` rejects any URL that is not `https`, and the docs say "A remote server MUST be publicly accessible". Plinth listens on `http://<phone-ip>:<port>/mcp`, local Wi‑Fi only, so it cannot be a `remotes` entry.
2. **The only valid path is a package.** The draft assumes a small stdio bridge published to npm as `@connected-mate/plinth-bridge`. It would find the phone over Bonjour (`_plinth._tcp`) and proxy MCP to it. **This package does not exist yet.** Someone has to build and publish it. The npm `package.json` must contain `"mcpName": "io.github.Connected-Mate/plinth"`, because that is how the registry checks package ownership.
3. **Namespace.** GitHub login gives `io.github.Connected-Mate/*`. Check the exact casing that `mcp-publisher login github` grants before publishing.
4. **Publish.** Rename the file to `server.json` next to the bridge package, then run:
   ```sh
   brew install mcp-publisher
   mcp-publisher login github     # browser device flow, as Connected-Mate
   mcp-publisher publish
   ```

## awesome-mcp-servers (punkpeye)

Its scope is "servers with a public GitHub repository — something you install and run yourself". Plinth's app code is private, so it is **not eligible until** the code, or the bridge above, is public. The line to add under "🏢 Workplace & Productivity", in alphabetical order, would be:

```
- [Connected-Mate/plinth](https://github.com/Connected-Mate/plinth) 🏠 🍎 - iPhone app that is an MCP server on your Wi‑Fi: agents pair with a 6-digit code, then push notes, checklists, offline HTML mini-apps, Home Screen widgets, Live Activities and notifications. No server, no account.
```

There is no Swift language emoji in their legend; add 📇 if the TypeScript bridge ships. Their README syncs with glama.ai, which may then show a score badge.
