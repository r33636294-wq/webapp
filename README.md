# Personal Poster / Banner Editor

A lightweight browser-based editor for designing posters, banners, and social creatives.

## Features
- Social presets: Instagram/Facebook post & story, full-screen mobile, A4, slide, banner.
- Advanced **Text Tools**: add text, resize, solid/gradient fill, texture image fill, stroke, inner/outer shadow, inner/outer glow.
- On-canvas text interactions with mouse and touch: drag to move and handle-drag to resize.
- Advanced **Image Tools**: import/add image, crop zoom, rotate, resize, blend modes, texture, stroke, shadow.
- PNG export.

## Run locally
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Run on GitHub, test, and launch (GitHub Pages)
1. Push repository to GitHub.
2. CI workflow (`.github/workflows/ci.yml`) runs smoke tests.
3. Deploy workflow (`.github/workflows/deploy-pages.yml`) publishes to Pages.
4. In **Settings → Pages**, set source to **GitHub Actions**.

## Test hosted app on the web
```bash
curl -I https://<your-username>.github.io/<your-repo>/
curl -fsS https://<your-username>.github.io/<your-repo>/ | grep -q "Poster / Banner Editor"
```
