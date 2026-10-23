# Plinth presentation film

Silent 16 s, 1920x1080, 30 fps motion film (FR + EN) drawn frame by frame with Skia (`@napi-rs/canvas`) and encoded by `ffmpeg-static`. No browser.

Re-render (from this folder):

    npm install && node render.mjs          # both languages
    ONLY=fr node render.mjs                 # one language
    FRAMES=3.5,7,12 ONLY=en node render.mjs # also dump debug PNGs (dbg-*.png, delete after)

Outputs go to `../docs/assets/`: `promo-{fr,en}.mp4|webm|vtt`, `poster-{fr,en}.jpg`; `transcript.json` is written here.
Fonts are read from `../../plinth/fonts/`.

Credits: Archivo (Plinth Display), SIL OFL 1.1, see `plinth/fonts/OFL.txt`. ffmpeg-static: build scripts GPL-3.0-or-later, bundled ffmpeg binary GPL (libx264, libvpx). Body text: system SF font, used only for rendering.
