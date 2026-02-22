# Personal Poster / Banner Editor

A lightweight browser-based editor for designing personal posters and banners.

## Features
- Presets: Instagram Post, Facebook Post, Instagram Story, Facebook Story, Full Screen Mobile, A4, slide, and social banner.
- Dedicated **Image Tools** tab with import/add image, crop zoom, move, rotate, resize, and blend controls.
- Image styling: solid/gradient tint color, texture overlays (noise/grid), stroke, and shadow controls.
- Editable title + subtitle with size/color controls and one-click PNG export.

## Run locally
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Run on GitHub, test, and launch (GitHub Pages)
1. Push your repository to GitHub.
2. CI workflow (`.github/workflows/ci.yml`) runs smoke tests on PRs and pushes.
3. Pages workflow (`.github/workflows/deploy-pages.yml`) deploys on `main` or manual trigger.
4. In **Settings → Pages**, set source to **GitHub Actions**.
