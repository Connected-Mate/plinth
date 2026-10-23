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

