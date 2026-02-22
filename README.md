# Personal Poster / Banner Editor

Mobile-first banner editor with splash, new-user onboarding, and automatic profile footer generation.

## Features
- Splash opening screen with logo + app name (`RITESH GAIKWAD`).
- New-user login/onboarding form (photo, name, position, phone) and save.
- Editor-only workflow (removed old footer toolbar buttons and removed old size preset dropdown).
- **Banner Preset buttons** (`1,2,3,4,5...`) to switch preloaded daily banner backgrounds.
- **Footer Preset buttons** (`1,2,3,4,5...`) to change footer style; selecting a banner preset auto-updates footer preset.
- Banner footer auto-fills from login data (photo, name, position, phone).
- Profile photo is auto-framed with circular clipping for clean footer presentation.

## Run locally
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Host the app (GitHub Pages)
Use existing workflows:
- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`
