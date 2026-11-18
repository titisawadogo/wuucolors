<p align="center">
  <img src="docs/cover.svg" alt="wuuColors — See the colors behind the design" width="100%">
</p>

<p align="center">
  Explore the colors in images and PDFs, from a quick palette to every decoded pixel.
  <br>
  Everything runs in your browser, on your device.
</p>

<p align="center">
  <strong>Website</strong> · <code>wuucolors.com</code> (planned)
  <br>
  <strong>Built with</strong> · HTML · CSS · JavaScript · Canvas API · PDF.js
  <br>
  <a href="LICENSE">MIT License</a>
</p>

## Preview

![wuuColors desktop workspace with an example image and its color palette](docs/screenshots/desktop-overview.jpg)

<p align="center"><sub>Explore a file and see its palette alongside the image.</sub></p>

<p align="center">
  <img src="docs/screenshots/mobile-selection.jpg" alt="On a phone, a selected area remains visible on the image" width="300">
  &nbsp;
  <img src="docs/screenshots/mobile-colors.jpg" alt="On a phone, the color drawer shows selected-area colors and the full image palette" width="300">
</p>

<p align="center"><sub>Select an area on a touchscreen, then open its colors without leaving the image.</sub></p>

## Features

<table>
  <tr>
    <td width="52"><img src="docs/icons/import.svg" alt="" width="32"></td>
    <td><strong>Open images and PDFs</strong><br>Import PNG, JPEG, WEBP, AVIF, GIF, BMP, SVG, HEIC, HEIF, or PDF files. Processing stays on your device.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/pixels.svg" alt="" width="32"></td>
    <td><strong>See the whole color story</strong><br>Browse dominant and accent palettes, inspect a single pixel, or view every exact HEX color with its pixel count.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/selection.svg" alt="" width="32"></td>
    <td><strong>Focus on an area</strong><br>Draw an area with a mouse. On touchscreens, create a box, move it, resize it, and keep the selection visible while exploring its colors.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/export.svg" alt="" width="32"></td>
    <td><strong>Take the colors with you</strong><br>Copy color values or export a TXT or PDF summary. Download the exact color list as CSV.</td>
  </tr>
</table>

On supported desktop browsers, the screen eyedropper can also pick a color from another visible window. The interface is available in English, French, and Spanish.

## How it works

Your image is decoded, or a PDF page is rendered, in the browser. wuuColors counts the resulting pixels by exact HEX value and groups them into dominant and accent colors. You can then inspect one pixel or a selected area and export the results. Your file stays on your device.
