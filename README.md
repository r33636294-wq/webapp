# Personal Poster / Banner Editor

A lightweight browser-based editor for designing personal posters and banners.

## Features
- Preset sizes for social banners, square posts, A4 posters, and slides.
- Background color and optional background image upload.
- Editable title + subtitle with color and size controls.
- Overlay strength slider for text readability.
- One-click PNG export.

## Run locally
Because this is a static app, any simple web server works:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Run on GitHub, test, and launch (GitHub Pages)

### 1) Push this repo to GitHub
```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

### 2) Automated testing on GitHub Actions
This repo includes `.github/workflows/ci.yml`.
On every push to `main` and every pull request, CI will:
- start a local static server,
- fetch the homepage and verify expected UI text,
- fetch `styles.css` and `app.js` as smoke checks.

You can view results in **GitHub → Actions → CI**.

### 3) Launch on GitHub Pages
This repo includes `.github/workflows/deploy-pages.yml`.
To enable Pages deployment:
1. Go to **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as source.
3. Push to `main` (or run the deploy workflow manually from **Actions**).

After deployment, your app will be live at:
`https://<your-username>.github.io/<your-repo>/`

### 4) Verify launch
- Open the Pages URL.
- Change text/colors in the editor.
- Click **Download PNG** and confirm image exports.
