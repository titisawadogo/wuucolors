# wuuColors

**See the colors behind the design.**

wuuColors makes it easy to find colors in images and PDFs. Open a file to see its palette, inspect an exact pixel, or select a smaller area to study its colors. A screen eyedropper is available in browsers that support it.

**Planned domain:** `wuucolors.com`

![wuuColors website preview](docs/preview.jpg)

## What you can do

- Explore dominant colors in PNG, JPG, WEBP, AVIF, GIF, BMP, SVG, and PDF files.
- Click a pixel to read its HEX, RGB, and HSL values.
- Select an area to see a focused palette, with the selected region kept visible on the image.
- Pick a color from another visible window with the browser's screen eyedropper, when supported.
- Copy colors or download a TXT or PDF summary.
- Use the interface in English, French, or Spanish on desktop, tablet, or phone.

Files are analyzed in your browser. The app has no account or server component, and your files are not uploaded.

## Run it locally

You need Python 3 or any static file server. No install or build step is required.

```bash
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000` in your browser. Choose **Try an example** to explore the interface without a file.

## Project files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Interface and page metadata |
| `dist/styles.css` | Responsive design |
| `dist/app.js` | File handling, color analysis, selection, and exports |
| `dist/i18n.js` | English, French, and Spanish text |
| `dist/pdf.min.mjs`, `dist/pdf.worker.min.mjs` | Local PDF rendering |
| `dist/fonts/` | Bundled typefaces and their licenses |
| `docs/preview.jpg` | Website preview |

The bundled PDF and font license notices are included beside their assets in `dist/`.

## Browser notes

The screen eyedropper requires browser support and a secure context. Image and PDF inspection work without it. Files are limited to 25 MB, and very large images are scaled for inspection.
