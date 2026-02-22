# Personal Poster / Banner Editor

Mobile-first poster/banner editor with layer controls and bottom taskbar tools.

## Features
- Smartphone-friendly UI.
- Top-right **Layers** panel with: select layer, hide/unhide, lock/unlock, duplicate, delete, and add layer.
- Bottom horizontal toolbar (footer taskbar style) with 3 toggles: **Background**, **Image**, **Text**.
- Click a bottom button to show/hide that tool panel.
- Canvas export to PNG.
- Splash opening screen with logo + app name (`RITESH GAIKWAD`).
- New-user login/onboarding page with photo, name, position, phone number, and save.
- Third page gallery with preloaded daily event banners and date labels.

## Run locally
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Host the app (GitHub Pages)
This repository already includes GitHub Actions workflows for CI and Pages deploy.

### 1) Push to GitHub
```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

### 2) Enable Pages deployment
1. Open your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set source to **GitHub Actions**.

### 3) Trigger hosting
- Push to `main`, or
- Run **Actions → Deploy to GitHub Pages → Run workflow**.

### 4) Open live URL
Your hosted app URL will be:

`https://<your-username>.github.io/<your-repo>/`

### 5) Quick hosted checks
```bash
curl -I https://<your-username>.github.io/<your-repo>/
curl -fsS https://<your-username>.github.io/<your-repo>/ | grep -q "Poster / Banner Editor"
```


> Replace `assets/start-logo.svg` with your provided transparent logo image (same filename or update `index.html`).
