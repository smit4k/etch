# ASCII to image

A standalone, browser-only ASCII art image exporter, using IBM Plex Mono and the homepage's system-driven light/dark colors. No build step or runtime dependencies. This folder is independent of the Zola homepage and can be hosted on any static host.

Run from this folder:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080`. Serve over HTTP rather than opening `index.html` directly because the scripts use JavaScript modules.

Paste art, choose a font, background, and margin, then download a 4096 × 4096 PNG, JPEG, or WebP using the dropdown beside the download button. PNG is lossless; JPEG and WebP use the browser's maximum quality setting. Spaces and blank lines are preserved; tabs use eight-column stops. The preview and export use the same renderer. Transparent exports use black text; choosing JPEG switches a transparent background to white.

IBM Plex Mono and Space Mono are bundled with their SIL Open Font Licenses in `fonts/`. Courier uses the available system font; its appearance can vary by device. No text or image is uploaded or stored.

Controls use native HTML with CSS styling. Browsers supporting customizable selects also get styled option menus; other browsers retain their native picker.

Run the layout regression checks with Node:

```sh
node --test render.test.mjs
```
