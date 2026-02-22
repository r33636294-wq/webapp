# Personal Poster / Banner Editor

Mobile-first banner editor with splash, onboarding, draggable elements, and reusable footer presets.

## Features
- Splash opening screen with logo + app name (`RITESH GAIKWAD`).
- New-user onboarding/login form (photo, name, position, phone) and save.
- Editor supports selecting, dragging, moving, and resizing **text, image, and shape** elements directly on banner.
- Add **Text / Image / Shape** with dedicated tools.
- Text editing tools: text, size, font style, color, alignment.
- Image editing tools: import/replace and size scale.
- Banner preset buttons (`1,2,3,4,5...`) to load preloaded daily banner backgrounds.
- Footer preset buttons (`1,2,3,4,5...`) with auto-switch on banner preset click.
- Save footer preset for future banners (stored in localStorage).
- Footer auto-generates from onboarding profile data (photo, name, position, phone).

## Run locally
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Host the app (GitHub Pages)
Use existing workflows:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`
