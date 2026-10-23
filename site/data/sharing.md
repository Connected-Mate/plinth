People nearby open a link served **by the phone itself** (no cloud): they must be on the **same Wi‑Fi** as the iPhone or on its **Personal Hotspot**, and Plinth must stay **open on screen**. Guests join with a name + emoji, post text and photos, react; everything lands on this phone.

| Tool | Use |
|---|---|
| `share_space(space, permissions?, expires_at?, share_window_ends_at?, auto_delete_at?, max_guests?, title?, welcome?, notify_on_post?, live_activity?, disk_cap_mb?, rotate_link?)` | Share (or update a share, same link). Returns `url`, a **QR PNG** (also saved: `qr_url` = `plinth-asset://assets/<id>.png`) and `how_guests_join` |
| `list_shares()` | Links (current IP), state, guests/posts/photos counts |
| `update_share(space, …, close?)` | Extend/shorten dates, change permissions; `close:true` stops it now (posts kept) |
| `revoke_share(space, delete_data?)` | Kill the link; data kept for a recap unless `delete_data` |
| `list_posts(space, since?, limit?)` | Posts newest first: guest, text, reactions, photo ids/URIs |
| `get_post_asset(space, photo)` | One guest photo (JPEG ≤ 1600 px, location/EXIF stripped). Also resource `plinth://shares/<space>/photos/<id>` |
| `delete_post(space, post)` / `ban_guest(space, guest, delete_posts?)` | Moderation |

- `permissions`: `view` (look only) · `post` (default: join, post, react) · `edit` (post + tick/add lines on a **note** space).
- Dates are ISO-8601 with time zone. `share_window_ends_at` = last moment NEW guests can join (≤ `expires_at`). `expires_at` = everyone sees "closed". `auto_delete_at` (≥ `expires_at`) deletes space + posts: omit it if a recap is wanted.
- Decide every setting yourself from the user's words ("party tonight until 2am" → `expires_at` 02:00, window 23:30, `post`, `live_activity:true`). Never ask the user to configure anything; tell them the link + QR + the Wi‑Fi/hotspot sentence from `how_guests_join`.
- Guests see your HTML space at the top of their page (sandboxed: no network, `plinth.store` in memory only) then the composer and live feed. In your HTML, `plinth.posts.list()` → `Promise<[post]>` and `plinth.posts.onNew(cb)` work **both on the host phone and for guests**: render the feed in your own design (post = `{id, text, created_at, guest:{name, emoji}, photos:[{url, w, h}], reactions:{"❤️":2}}`). Feature-detect `plinth.posts`.
- Host notifications are batched (≤ 1 per 30 s per share); the host moderates from the "Shared" pill in the space header.
- Links in your shared HTML do not open by themselves for guests: the guest page shows "Open <site>" and the guest taps it. No popups, no top navigation.
- `ban_guest` blocks the guest's key, device cookie and network address: best-effort (a different browser on another network can rejoin). Lower `max_guests` or close the share to stop a persistent troll.

Step-by-step party walkthrough: `plinth://recipes`.

## Access scope and hidden spaces
- `PairedAgent.scope`: `all` (default) or a list of space / collection ids (a collection grants everything inside it). Set by the USER: "Share with an agent" on a space (a 10-minute code + ready prompt; pairing with it gives a token limited to that space), or lock mode ("Only agents of this app": every NEW pairing is limited to one space; existing agents unchanged). `status().access` shows yours; `pair` says it too.
- Hidden spaces (`hidden`, user-only, never settable through MCP) are invisible to every agent unless their own id is in that agent's scope; a hidden tile inside a shared collection stays hidden.
- Out of scope ≡ missing, for EVERY tool and resource: `list_spaces`, `list_collection`, `resources/list` omit them; `update_space`, `delete_space`, `open_space`, `launch_space`, `append_note`, `send_to_space`, `read_space_store`, `plan_space` / `read_plan`, `screenshot_space`, assets (`upload_asset`, `fetch_asset`, `list_assets`, `delete_asset`, `plinth-asset://space/…`), shares (`share_space`, `update_share`, `revoke_share`, `list_shares`, `list_posts`, `get_post_asset`, `delete_post`, `ban_guest`, `plinth://shares/…`), collections (`move_to_collection`, `pin_asset`, `update_collection`, `delete_collection`), `notify` / `schedule` / `set_widget*` / `start_live_activity` with `space`, `focus_*` and `engagement_*` answer exactly as for an id that never existed. A visible space inside a collection you cannot see shows at home (no `collection`).
- Creating as a limited agent: new spaces go into your shared collection (if any), else home; either way they join your scope. An id taken by a space you cannot see gives a fresh id (`<id>-2`), never "already exists". `move_to_collection` refuses moves that would take a tile out of your scope.
- Non-space tools for limited agents: kept: ask_user, tell_user, notify, haptic, widgets, Live Activities (your own), focus, native device tools, ids you got yourself from pick_photo / take_photo. Not available: the phone's shared asset library (`list_assets` / `delete_asset` without `space`), other agents (`status` lists only you), other agents' pending plans.

