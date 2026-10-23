# Plinth — setup guide for coding agents

You are a coding agent. Your user wants you to connect to **Plinth**, an iPhone app that runs a small MCP server on their local Wi‑Fi, so you can push notes, checklists, small HTML apps, widgets, Live Activities and notifications onto their phone. Follow these steps in order. Ask the user only what is strictly needed.

## Prerequisites
- The Plinth app is installed and **open in the foreground** on the user's iPhone. Plinth only answers while it is open.
- The iPhone and the computer you run on are on the **same Wi‑Fi** network (no guest network isolation).
- You can add an MCP server over **HTTP** (Streamable HTTP). Claude Code: `claude mcp add --transport http`. Other agents: add it as a remote/HTTP MCP server in their config.

## 1. Find the phone's address
Fastest: ask the user to tap the round black button on the Plinth home screen and paste you what it copies. That text contains the exact endpoint, e.g. `http://192.168.1.23:7777/mcp`. The address is also shown in Plinth's settings (long-press the big PLINTH title).

Or discover it yourself on macOS (Plinth advertises itself over Bonjour as `_plinth._tcp`):
```sh
dns-sd -B _plinth._tcp local.          # Ctrl-C after a second: lists "Plinth"
dns-sd -L Plinth _plinth._tcp local.   # prints "<host>.local.:<port>"
```
The default port is `7777`; Plinth picks another one if it is busy, so always use what you discovered. Endpoint = `http://<ip-or-host>:<port>/mcp`.

## 2. Connect
```sh
claude mcp add --transport http plinth http://<phone-ip>:<port>/mcp
```
If the `plinth` tools do not appear, ask the user to restart you (or reload MCP servers in your agent).

## 3. Pair (once)
1. Call `request_pairing()`. A 6-digit code appears on the phone (valid 2 minutes).
2. Ask the user for the code, then call `pair(code, agent_kind, agent_name)`. `agent_kind` is one of claude-code, claude-desktop, codex, chatgpt, cursor, copilot, gemini, windsurf, mistral, perplexity or other. `agent_name` is a short name for yourself. The phone shows them.
3. `pair` returns a bearer token **and the exact command to save it** (it re-adds the server with an `Authorization: Bearer …` header). Run that command exactly, so you stay paired next time. Never print the token anywhere else.

Too many wrong codes lock pairing for a short while: wait, then call `request_pairing` again.

## 4. Prove it works
1. Call `status()`: it must say you are paired.
2. Read the resource `plinth://skill` and follow **THE METHOD**. If your client cannot read MCP resources, call `read_guide({name: "skill"})` instead; it works before pairing. In short: understand what would make the user happy, ask at most 3 short questions on the phone (`ask_user`), cover every scenario, build it, prove it works (`screenshot_space`), then tell the user on the phone how to use it (`tell_user`).
3. Create a tiny test space, for example `create_space(id: "hello", title: "Hello", markdown: "# Hello\n\n- [ ] It works", open: true)`, then `tell_user("Hello from your agent", "success")`. Ask on the phone with `ask_user("Keep the test note?", ["Delete it", "Keep it"])`, and `delete_space("hello")` only if they choose Delete.

## Troubleshooting
| Symptom | Fix |
|---|---|
| Connection refused / timeout | Plinth is closed, in the background, or on another network. Ask the user to open it on the same Wi‑Fi. |
| "Not paired" | Run step 3 again. |
| A tool fails or something is missing | Call `feedback(kind, summary, error?, tool?)` and run the `gh` command it returns. The report shows on https://connected-mate.github.io/plinth/en/logs/ |
| "This token was revoked on the phone" | The user revoked you in Plinth's settings. Pair again and save the new command. |
| Address changed | Phone got a new IP. Repeat step 1, then re-run the saved command with the new address. |

## The user is not technical
Talk to them on the phone, in plain words, one question at a time. Always ask with `ask_user` before anything destructive. If it times out or is dismissed, that means no.

## Uninstall
```sh
claude mcp remove plinth
```
On the phone, the user can revoke you in Plinth's settings (long-press the PLINTH title), or delete the app.

## Privacy
Everything stays between this computer and the phone on the local network. No server, no account, no analytics.
