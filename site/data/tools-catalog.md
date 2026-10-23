<!-- Snapshot of plinth skill/plinth-design/TOOLS.md tool catalog (feature/method 0757da9). Refresh: copy the '## Tool catalog' section again. -->
## Tool catalog (generated from the app, 139 tools)
Exact names and parameters (`?` = optional). Full JSON schemas: `tools/list`. Annotations: read-only tools never change anything; destructive ones always ask the user on the phone first.

### Spaces, pairing, widgets, Live Activities, notifications
| Tool | What it does |
|---|---|
| `request_pairing()` | Step 1 of pairing. Shows a 6-digit code on the user's phone (valid 2 minutes). Then ASK THE USER for the code and call pair. |
| `pair(code, agent_kind, agent_name, project?)` | Step 2 of pairing. Send the 6-digit code the user reads from their phone, plus who you are (agent_kind + agent_name). Returns a bearer token and the exact command to save it. |
| `set_project(name)` | Tell Plinth which project you're working on (e.g. your repo or folder name). The phone shows it next to your name in the agents list. Empty string clears it. |
| `status()` | Connection, pairing and phone state (incl. `screen`: busy when another agent is using the screen, with retry_in_s). Works without pairing. |
| `read_guide(name?, section?)` | Returns the Plinth manual as markdown: skill (THE METHOD, design bar, how to talk to the user: read it first), tools (full reference + catalog), recipes (end-to-end walkthroughs), kit (components), or examples/<file>. Same text as the plinth:// resources, for clients that cannot read resources. Works without pairing. |
| `list_spaces()` | All spaces on the phone, newest first. |
| `plan_space(id, goal, scenarios, questions_asked?)` | Call BEFORE create_space for any HTML app: it's how Plinth keeps your user happy. Record the goal (one line), the questions you asked on the phone (≤ 3) and every scenario, each handled or deliberately out of scope (first use/empty, invalid input, errors, offline, repeated taps, background/locked, dark mode, long text, deletion, time passing). Stored with the space (also before it exists); read it back with read_plan. Calling again replaces the plan. |
| `read_plan(id)` | The plan recorded with plan_space for a space (goal, questions asked, scenarios). Use it before changing a space someone planned. |
| `create_space(id, title, app?, collection?, html?, icon?, markdown?, network?, open?, preview_asset?, preview_space?, theme?)` | Create a space on the phone: an HTML page/mini-app (html) or a native quick note (markdown). Read resource plinth://skill first and follow its design system. Max 20 MB of HTML; put images/video/audio in with upload_asset or fetch_asset instead of inlining them. |
| `update_space(id, app?, html?, icon?, markdown?, network?, preview_asset?, preview_space?, theme?, title?)` | Replace a space's content and/or title/icon. Send only what changes. |
| `delete_space(id)` | Delete a space and its stored data from the phone. (destructive) |
| `append_note(space, text, title?)` | Append markdown text to a note space (creates the note if missing). Ideal for quick capture. |
| `open_space(id)` | Open a space full-screen on the phone. |
| `launch_space(id, immersive?)` | Run an app space (create_space/update_space app: true) truly full-screen on the phone: no status bar, no Plinth chrome, edge-to-edge (design with env(safe-area-inset-*)). The ONLY way back is a firm shake (plus accessibility fallbacks); tell the user. immersive: false = just open it (like open_space). |
| `set_widget(title, progress?, space?, subtitle?)` | Update the Plinth home-screen widget (user adds it once from the widget gallery). |
| `start_live_activity(title, ends_at?, progress?, space?, subtitle?)` | Show a Live Activity on the Lock Screen and Dynamic Island (one at a time is ideal). Give ends_at for a self-updating countdown. |
| `update_live_activity(ends_at?, id?, progress?, subtitle?, title?)` | Update the running Live Activity (latest one if id omitted). |
| `end_live_activity(id?, subtitle?)` | End the Live Activity (all of them if id omitted). |
| `notify(title, body, at?, count?, in_s?, level?, repeat_every_s?, space?, tag?)` | Post a local notification now, or schedule it (at / in_s, optionally repeat_every_s + count). Scheduled ones fire even if the app is closed. iOS keeps at most 64 pending. Tapping it opens the space if given. |
| `feedback(kind, summary, detail?, error?, tool?)` | Call this when a Plinth tool fails, a capability is missing, or you have an idea. Stored on the phone; returns a ready gh command + URL to file a public GitHub issue (secrets/IPs stripped). Then run the gh command. |
| `haptic(style)` | Play a haptic on the phone. |

### Talking to the user, schedules, space data
| Tool | What it does |
|---|---|
| `ask_user(question, allow_free_text?, options?, timeout_s?)` | Ask the person holding the phone a question on a native sheet and wait for the answer. Use it when unsure and ALWAYS before anything destructive. Give 2–4 short options when you can. The user is not technical: plain words. Needs the app open (else "The phone is asleep"). |
| `tell_user(message, kind?)` | Show a quiet in-app message with a light haptic ("Done — your list is on the phone"). If the app is in the background it becomes a notification from you. |
| `cancel_notifications(all?, ids?, tag?)` | Cancel your own pending notifications and app schedules by tag, by ids (notification ids, group ids or schedule ids), or all of yours. (destructive) |
| `list_scheduled()` | Your pending notifications and app schedules, soonest first, plus how many of the 64 iOS slots are used. |
| `schedule(action, at?, count?, every_s?, in_s?, payload?, space?, tag?)` | Run an action later: notify (fires even if the app is closed), live_activity_update (only while Plinth runs; missed updates apply on next open), haptic / open_space (only while the app is on screen; skipped otherwise). |
| `send_to_space(id, data)` | Push JSON data (≤ 256 KB) to an HTML space without reloading it: the page receives it with plinth.on('data', cb). If the space is not open, it is queued and delivered on next open. |
| `read_space_store(id, key?)` | Read what a space saved with plinth.store.set (the user's answers, checklist state…). Whole store, or one key. |

### Native iPhone
| Tool | What it does |
|---|---|
| `device_capabilities()` | What native features this iPhone offers right now (Apple Intelligence, location, photos, contacts, calendar, music, health...) and each permission state. Call this before using a native tool you have not used yet. |
| `ask_device_model(prompt, instructions?, max_tokens?, schema?, temperature?)` | Run Apple's on-device language model (Apple Intelligence, offline, private). Good for short summaries, extraction, classification, rewriting. Small model: ~4K token context, not for world knowledge or long reasoning. Give `schema` (JSON Schema object: string/number/integer/boolean/array/object, enum on strings) for structured JSON output. |
| `show_map(fit?, lat?, lon?, markers?, polylines?, span_m?, title?)` | Open a native map sheet on the phone: one pin (lat, lon) OR several `markers` and `polylines` (routes, tracks) fitted on screen. Returns at once; the map stays until the user closes it. |
| `open_in_maps(directions?, lat?, lon?, name?, query?)` | Open Apple Maps on the phone at a place (query OR lat/lon), optionally with directions from the current location. |
| `geocode(address)` | Turn an address or place name into coordinates (Apple Maps, needs internet on the phone). |
| `reverse_geocode(lat, lon)` | Turn coordinates into a postal address. |
| `get_location()` | Current location of the phone (lat, lon, accuracy). Precise or approximate depending on what the user allowed. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `pick_photo()` | Let the user pick one photo on the phone. Returns the image (JPEG ≤ 2 MB) and an asset URL plinth-asset://assets/<id>.jpg usable in <img> inside spaces. No permission needed. Shows a sheet on the phone and waits up to 120 s for the user. |
| `take_photo()` | Open the camera on the phone; returns the photo like pick_photo. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. Shows a sheet on the phone and waits up to 120 s for the user. |
| `save_photo(asset?, base64?)` | Save an image to the user's Photos (add-only permission). Give `asset` (id from pick_photo/take_photo) or `base64` (JPEG/PNG/HEIC ≤ 8 MB). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `get_asset(id)` | Return a stored asset image by id. |
| `now_playing()` | What the Music app is playing (title, artist, album, state). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `play_music(query)` | Search and play a song/album/artist in the Music app. Searches the user's library first, then the Apple Music catalog (needs an Apple Music subscription). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `music_control(action)` | Control the Music app player. |
| `call(number)` | Start a phone call. iOS always asks the user to confirm. |
| `facetime(handle, audio_only?)` | Start a FaceTime call (iOS asks to confirm). |
| `sms(to, body?)` | Open a prefilled iMessage/SMS composer. The user taps Send; nothing is ever sent in the background. Shows a sheet on the phone and waits up to 120 s for the user. |
| `mail(to, body?, cc?, subject?)` | Open a prefilled email composer. The user taps Send; nothing is sent in the background. Shows a sheet on the phone and waits up to 120 s for the user. |
| `search_contacts(limit?, query?)` | Find contacts by name (returns id, names, phones, emails). Without query: the first contacts, like contacts_list. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `pick_contact()` | Let the user pick one contact; only that contact is shared. No permission needed. Shows a sheet on the phone and waits up to 120 s for the user. |
| `add_event(title, start, all_day?, end?, location?, notes?)` | Add an event to the user's default calendar (write-only permission). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `add_reminder(title, due?, notes?)` | Add a reminder to the default Reminders list. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `list_events(day?, from?, to?)` | Events in a time range (full calendar access permission). Default: today. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `read_clipboard()` | Read the text on the phone's clipboard. The phone shows a sheet with a Paste button; nothing is shared until the user taps it. |
| `set_clipboard(text)` | Put text on the phone's clipboard. |
| `flashlight(on, level?)` | Turn the torch on/off. Safety: it turns itself off 10 s after the last "on" — call on again to keep it lit. |
| `device_info()` | Model, iOS version, battery, brightness, storage, locale, time zone, Low Power Mode, thermal state. |
| `speak(text, language?, rate?)` | Read text aloud on the phone (system voice, works offline). |
| `set_brightness(value)` | Set the screen brightness while Plinth is open. |
| `open_settings(pane?)` | Open Plinth's page in the Settings app (to fix a permission). |
| `read_steps_today()` | Step count since midnight from Apple Health. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `set_widget_checklist(title, items, space?)` | Put a tappable checklist (1–6 items) on the Plinth home-screen widget. The user ticks items right on the Home Screen without opening the app; read the ticks with read_widget. |
| `read_widget()` | What the Plinth widget currently shows, including which checklist items the user ticked. |
| `bluetooth_scan(duration_s?, name_prefix?, services?)` | Find nearby Bluetooth Low Energy devices (name, id, signal rssi, advertised services). Classic Bluetooth (headphones paired in Settings) is not visible to apps. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `bluetooth_connect(id)` | Connect to a scanned peripheral and list its services and characteristics (with read/write/notify properties). 15 s timeout. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `bluetooth_read(id, service, characteristic)` | Read a characteristic value (hex + UTF-8 if printable). Connects first if needed. |
| `bluetooth_write(id, service, characteristic, hex, with_response?)` | Write bytes (hex) to a characteristic. Connects first if needed. |
| `bluetooth_notify(id, service, characteristic, duration_s?)` | Subscribe to a notifying characteristic for a few seconds and return every value received (e.g. heart-rate strap). |
| `bluetooth_disconnect(id)` | Disconnect a peripheral. |
| `discover_services(duration_s?, type?)` | Bonjour scan of the Wi‑Fi network: printers, AirPlay/Chromecast/Sonos speakers, HomeKit/Matter hubs, file shares, other Plinth phones. Returns name, type, host, port, IP. Types allowed: _afpovertcp._tcp, _airplay._tcp, _companion-link._tcp, _daap._tcp, _device-info._tcp, _googlecast._tcp, _hap._tcp, _hap._udp, _homekit._tcp, _http._tcp, _https._tcp, _ipp._tcp, _ipps._tcp, _matter._tcp, _matterc._udp, _pdl-datastream._tcp, _plinth._tcp, _printer._tcp, _raop._tcp, _rfb._tcp, _scanner._tcp, _sftp-ssh._tcp, _smb._tcp, _sonos._tcp, _spotify-connect._tcp, _ssh._tcp, _uscan._tcp. |
| `ping_host(host, count?, port?)` | Is a host reachable from the phone, and how fast? Measures TCP connection time (iOS apps cannot send ICMP ping). |
| `wifi_info()` | Current Wi‑Fi network name (SSID), BSSID, security, plus local IP. iOS only reveals the SSID once the user allows precise location for Plinth. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `local_ip()` | The phone's IP addresses (Wi‑Fi, cellular, VPN) and network path status (wifi/cellular, expensive, constrained). |
| `nfc_read()` | Show the iOS NFC sheet; the user holds the top of the iPhone near an NFC tag. Returns its NDEF records (text, URL, MIME). 60 s timeout. |
| `nfc_write(records)` | Write NDEF records (text and/or URL) to a writable NFC tag the user holds near the phone. Overwrites the tag. |
| `home_list()` | Apple Home: homes, rooms, accessories with their controllable characteristics and current values. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `home_set(accessory, characteristic, value)` | Turn a light on/off, dim it, set color, thermostat, lock, blinds. |
| `health_read(type, limit?, since?, until?)` | Apple Health samples and totals: steps, distance (m), active_energy (kcal), heart_rate (bpm), resting_heart_rate, flights, weight (kg), water (ml), sleep (min, by stage), workouts, mindful (min). iOS never says if reading was denied: no data may mean no permission. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `health_write(type, value, at?)` | Log a sample to Apple Health: steps (count), distance (m), active_energy (kcal), heart_rate (bpm), weight (kg), water (ml), mindful (min). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `motion_sample(duration_s?, hz?)` | Record accelerometer, gyroscope and attitude (pitch/roll/yaw) for a few seconds. Returns averages, peaks and up to 100 samples. No permission needed. |
| `pedometer(since?, until?)` | Steps, distance, floors climbed and cadence from the motion coprocessor (last 7 days available). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `barometer(duration_s?)` | Air pressure (kPa) and relative altitude change over a short window. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `compass_heading()` | Magnetic heading in degrees (and true heading when location is allowed). |
| `record_audio(max_s?)` | Show a recorder sheet: the user taps Record, then Stop (or it stops at max_s). Returns an m4a asset id; transcribe it with transcribe. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. Shows a sheet on the phone and waits up to 120 s for the user. |
| `play_sound(asset?, system?, volume?)` | Play an audio asset (from record_audio / import_file) or a system sound. |
| `stop_sound()` | Stop the audio asset playing. |
| `transcribe(asset, language?)` | Speech-to-text of an audio asset (on-device when the language supports it). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `screenshot_space(id)` | Render a space off-screen at phone size and return the image (and save it as an asset). Lets you check your layout. |
| `set_idle_timer(disabled, minutes?)` | Stop the screen from auto-locking while Plinth is open (timers, recipes, dashboards). Resets automatically after `minutes` and when the app leaves the foreground. |
| `set_appearance(mode)` | Force Plinth light or dark, or follow the system. |
| `import_file()` | The user picks one file in the Files app (iCloud Drive, On My iPhone…); it is copied into Plinth as an asset (≤ 20 MB). Text files ≤ 200 KB are also returned inline. Shows a sheet on the phone and waits up to 120 s for the user. |
| `export_file(asset)` | Let the user save an asset to the Files app (they choose the folder). Shows a sheet on the phone and waits up to 120 s for the user. |
| `list_assets(limit?, space?)` | Files and photos stored in Plinth (id, type, size, date, URL for spaces). With space: that space's media (upload_asset / fetch_asset) and its quota use. |
| `delete_asset(id, space?)` | Delete a stored asset (photo, recording, imported file) from Plinth only. With space: delete one of that space's media. |
| `weather(lat?, lon?)` | Current conditions + next 24 h + 7 days from Apple Weather (WeatherKit). Defaults to the phone's location. |
| `translate(text, to, from?)` | Translate text on the phone with Apple's Translation framework (offline once the language is downloaded; first use may ask the user to download it). |
| `classify_image(asset, limit?)` | What is in an image asset (labels like cat, beach, food with confidence). On-device Vision. |
| `detect_text(asset, languages?)` | Read printed or handwritten text in an image asset (OCR, on-device). |
| `photos_query(query, before?, limit?, scan?)` | Find photos in the user's library by content ("cat", "beach", "receipt", "screenshot", "favorites", "selfie"), newest first. On-device Vision; labels are cached on the phone so repeat searches are fast. Returns photo ids (for photos_set_favorite / photos_delete) and `url` thumbnails (plinth-asset://photo/…, usable in <img> inside spaces, nothing copied). Page with `before` = the returned `next_before`. Named pets/people from Photos' People & Pets are NOT visible to apps: search by kind (cat, dog), not by name. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `photos_list(before?, favorites?, limit?, media?, since?)` | Browse the library newest first without any analysis (fast): ids, dates, favorite, size, location and `url` thumbnails for spaces. For photo sorters / galleries. Page with `before` = next_before. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `photos_set_favorite(ids, favorite?)` | Mark/unmark photos as favorites. The user confirms on the phone first. |
| `photos_delete(ids)` | Move photos to Recently Deleted. The user confirms in Plinth AND in the iOS dialog. |
| `contacts_update(id, add_emails?, add_phones?, family_name?, given_name?, organization?)` | Edit a contact (names, organization; add phones/emails). The user confirms on the phone. Contact notes are not editable (Apple restricts them). |
| `contacts_delete(id?, ids?)` | Delete one or many contacts with ONE confirmation on the phone listing their names. |
| `contacts_merge(keep_id, merge_ids)` | Merge duplicates: phones, emails and missing name/company of merge_ids are added to keep_id, then merge_ids are deleted. One confirmation on the phone. |
| `contacts_list(limit?, offset?)` | Every contact, paged, sorted by name: id, name, organization, phones, emails, has_photo, photo_url (plinth-asset://contact/… for <img> in spaces). iOS gives apps no modification date. Use it instead of many search_contacts calls (e.g. to find duplicates). First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `set_widget_images(images, interval_min?, space?, title?)` | Show photos on the Plinth Home Screen widget (small/medium/large), cycling every interval_min. Sources: asset ids (pick_photo, take_photo, screenshot_space…) or photo ids from photos_query / photos_list. One image = a still photo widget. Images are copied (≤ 800 px) for the widget. |
| `sticker_pack(images, replace?)` | Turn images into the user's own Plinth sticker pack in Messages (App Store icon in the Messages keyboard → Plinth). Sources: asset ids (generate_image, pick_photo, take_photo…) or photo ids. Each becomes a PNG ≤ 618 px, < 500 KB. Max 60 stickers in the pack. |
| `image_playground_status()` | Is Apple Intelligence image generation (Image Playground) available on this phone, and which styles. Genmoji can only be made by the user in the keyboard; apps cannot generate them. |
| `generate_image(prompt, count?, source_asset?, style?)` | Create images on the phone with Apple's Image Playground (Apple Intelligence, on-device): style animation, illustration or sketch. Returns assets (use in spaces, sticker_pack, set_widget_images). No photorealism; people need a source photo. |
| `flashlight_pattern(pulses, level?, off_ms?, on_ms?)` | Blink the torch on the phone with exact timing (runs on-device, no network jitter): pulses × (on_ms + off_ms), ≤ 30 s total. Returns when done. |
| `vision_pose_sample(duration_s?, facing?)` | Open the camera on the phone in a sheet (the user sees themself with a skeleton overlay) for a few seconds and track body joints on-device: person seen %, elbow/knee angle ranges and push-up / squat style reps counted with hysteresis. For live counters inside a space use plinth.camera + plinth.vision.pose. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |
| `audio_level_sample(duration_s?)` | Listen with the microphone for a few seconds: loudness (dBFS), peak, beats detected and estimated tempo (BPM). Hears music playing in the room or on the phone's speaker. First use shows an iOS permission prompt on the phone; if the user declines, the tool returns an error telling them where to enable it in Settings. |

### Media
| Tool | What it does |
|---|---|
| `upload_asset(space, mime, chunk?, data_base64?, filename?, upload_id?)` | Store an image, video, audio, PDF, font, 3D model or small data file IN a space and get a URL its HTML can use (<img>, <video playsinline controls>, <audio>, <object>, @font-face). One shot: data_base64 (≤ 8 MB decoded). Bigger (≤ 200 MB): send chunks {index, total, data_base64} (≤ 2 MB decoded each, 0-based); the first answer gives upload_id, pass it on the next chunks; re-sending a chunk is safe. Quota 1 GB per space. Assets are deleted with the space. |
| `fetch_asset(space, url, filename?)` | The phone downloads an HTTPS file (≤ 200 MB, public internet only) into a space and returns its URL, like upload_asset. Faster than uploading when the file is online. Type comes from the server (or the file extension). |

### Focus apps and re-engagement
| Tool | What it does |
|---|---|
| `focus_pick_apps(prompt?, selection?, space?)` | Shows Apple's Screen Time picker on the phone so the USER chooses which apps, categories and websites a focus session blocks (first time: iOS asks Screen Time permission). Apple never reveals the chosen apps to Plinth or to you: you only get counts. Stored under `selection` (default: the space id, else "default") and reused by focus_start. Needs the app open; waits up to 120 s. |
| `focus_start(allow_breaks?, break_min?, breaks?, duration_min?, live_activity?, notify_end?, replace?, selection?, space?, until?)` | Locks the picked apps behind a Plinth shield screen for a while. Keeps working if Plinth is closed (a Screen Time extension lifts it on time). Shows a Live Activity countdown and a notification at the end. Give duration_min OR until. The user can always end it from Plinth or take the allowed breaks on the shield screen. |
| `focus_end()` | Ends the running focus session now: every app is unlocked, the countdown ends. |
| `focus_status()` | Running focus session (time left, on break, breaks left), Screen Time permission, stored app picks (counts only), and the phone's iOS Focus state (Do Not Disturb, Work…) plus the space bound to it with the Plinth Focus filter. |
| `engagement_plan(adaptive?, badge?, cadence?, copies?, escalation?, every_min?, goal?, language?, max_per_day?, off?, quiet_hours?, space?, streak?, time?, weekdays?)` | Reminds the user to come back to a space (or to Plinth) with kind notifications FROM YOU (your name + logo), scheduled on the phone even when Plinth is closed. Adaptive and private: stops on days the goal is done, backs off after 2 ignored nudges, goes quiet after 6 (one last "I'll stop" message), moves to the hour the user actually comes. Hard limits: quiet hours, ≤ 6 a day (default 3), the user can pause everything in one tap. off=true deletes the plan. Write copies kind, never guilt-tripping. |
| `engagement_stats(space?)` | What happened to the nudges (sent, tapped + median time to tap, dismissed, cleared, still unread in Notification Center, opened the app without tapping, ignored), streaks, opens by hour, back-off state and the next nudges. On-device data, paired agents only. |
| `engagement_pause(paused?, space?)` | Pause or resume your nudges (one plan, or every plan). The user's own pause in Plinth settings always wins; you cannot lift it. |
| `engagement_checkin(space?)` | Tell the phone the user did today's goal (e.g. finished the lesson in your space): counts for the streak and cancels today's remaining nudges. Opening the space already counts. |

### Collections and media tiles
| Tool | What it does |
|---|---|
| `create_collection(id, title, about?, collection?, cover?, cover_asset?, cover_space?, icon?, logo_asset?, logo_space?)` | Make a folder on the phone's home that holds spaces, notes, media tiles (and, one level deep, other collections). Its tile shows a stacked preview of 3 items, or the cover image. Tapping opens a screen with a cover header (image, big title, your description) and the same grid. File things with move_to_collection / pin_asset / create_space(collection). |
| `update_collection(id, about?, cover?, cover_asset?, cover_space?, icon?, logo_asset?, logo_space?, title?)` | Change a collection's title, icon, description or cover. Send only what changes ("" clears about / cover / icon). |
| `move_to_collection(collection, asset?, asset_space?, before?, space?)` | File a tile (space, note, media tile or collection) into a collection, or back home with collection null. Passing `asset` instead pins that media as a new tile there (same as pin_asset). Optional `before` = sibling id to sit in front of (else it goes first). |
| `list_collection(id?)` | What is inside a collection (or, without id, on the home screen): tiles in display order with kind, title, media type and size, plus storage used. |
| `delete_collection(id, keep_children?)` | Delete a collection. keep_children true (default) moves everything inside up one level (home or the parent collection); false deletes everything inside too (spaces, media, notes: cannot be undone). (destructive) |
| `pin_asset(asset?, collection?, icon?, id?, space?, title?, url?)` | Show a media file as its own tile with a native viewer: image (zoom/pan), film (full-screen player, Picture in Picture, AirPlay), PDF, audio (keeps playing in the background). From an existing asset, or give `url` (https, ≤ 200 MB) and the phone downloads it directly (a progress tile shows meanwhile). Great for a personal film/photo library: pin into a collection. |
| `export_asset(asset, space?, to?)` | Let the user save a media file: to Files (they pick the folder) or to Photos (images and videos; add-only permission). Needs the app on screen. |

### Other languages (runtimes)
| Tool | What it does |
|---|---|
| `install_runtime(name)` | Spaces run HTML/CSS/JS natively. For other languages, install an offline WebAssembly runtime ONCE: python (Python 3.14 (Pyodide), 13 MB), lua (Lua 5.4 (wasmoon), 0.4 MB), sqlite (SQLite (sql.js), 0.7 MB), ruby (Ruby 3.4 (ruby.wasm), 29 MB). The phone downloads it from a pinned URL and checks every file's SHA-256; afterwards it works offline in every space via `await plinth.runtime.load('<name>')`. Only when the user wants that language: JS is always lighter. |
| `list_runtimes()` | Language runtimes: installed or not, version, size, license, and the JS to use each in a space. |
| `remove_runtime(name)` | Delete an installed runtime to free space (spaces using it show their "needs runtime" state). (destructive) |

### Sharing with guests
| Tool | What it does |
|---|---|
| `share_space(space, auto_delete_at?, disk_cap_mb?, expires_at?, host_name?, live_activity?, max_guests?, notify_on_post?, permissions?, rotate_link?, share_window_ends_at?, title?, welcome?)` | Share a space with people nearby (party, meeting, class). Returns the guest link (served by the phone itself), a QR code image (also saved as an asset usable in spaces as <img src="plinth-asset://assets/<file>">) and the text to tell guests. Guests open the link in their browser, join with their name and post text/photos; posts land on this phone. Guests must be on the same Wi‑Fi as the phone or on its Personal Hotspot, and Plinth must stay open in the foreground. Calling it again on a shared space updates the settings and keeps the link. |
| `list_shares()` | All shares (open and closed) with links, guest/post/photo counts and dates. |
| `update_share(space, auto_delete_at?, close?, disk_cap_mb?, expires_at?, host_name?, max_guests?, notify_on_post?, permissions?, share_window_ends_at?, title?, welcome?)` | Change a share's settings: extend or shorten dates, change permissions, or close it now (close=true). Send only what changes. |
| `revoke_share(space, delete_data?)` | Kill the guest link immediately. Posts and photos are kept for a recap unless delete_data=true. (destructive) |
| `list_posts(space, limit?, since?)` | Guest posts on a shared space, newest first: author, text, reactions, photo ids. Read a photo with get_post_asset or resource plinth://shares/<space>/photos/<id>. |
| `get_post_asset(space, photo)` | Return one guest photo (JPEG, ≤ 1600 px, metadata stripped) as an image. |
| `delete_post(space, post)` | Remove a guest post and its photos (moderation). (destructive) |
| `ban_guest(space, guest, delete_posts?)` | Block a guest (and their device's address) from this share. Their posts are removed unless delete_posts=false. (destructive) |
