# Definitive 1# PC — Windows Desktop

Desktop version of the Android app (originally `NightCity.apk`, a Capacitor web app), wrapped with Electron, plus a local **Media Vault** for thousands of wallpapers, GIFs and 4K GIFs.

## Run / build
```bash
npm install
npm start          # run in dev
npm run dist       # builds dist/Definitive-1-PC-1.0.0-win-x64.exe  (+ portable .exe)
```
Build on Windows (or let GitHub Actions do it — see below).

## Media Vault
Created automatically at `%USERPROFILE%\Pictures\Definitive 1 PC Vault\`:

```
wallpapers/   jpg png webp bmp avif
gifs/         gif webp
gifs-4k/      gif webp mp4 webm   (4K animated; mp4/webm recommended — 10-50x smaller than GIF)
```
- Open it with **Ctrl+Shift+V** (File → Open Vault).
- Add files via buttons, drag & drop, or copy straight into the folders.
- Lazy-loaded grid with search: handles tens of thousands of files.
- Use another drive: set env var `NIGHTCITY_VAULT=D:\NightCityVault`.

## GitHub
```bash
git init && git add . && git commit -m "Definitive 1# PC"
git branch -M main
git remote add origin https://github.com/<you>/definitive-1-pc.git
git push -u origin main
git tag v1.0.0 && git push --tags     # triggers the Windows build + Release
```
**Where to keep the media itself?** Not in the repo. Options: keep it local (the vault folder), a cloud drive/NAS, GitHub **Releases** (up to 2 GB per file), or Git LFS (paid beyond 1 GB). Pack large sets as `.zip` and unzip into the vault folder.

## Notes
- The original app's code lives in `app/index.html` (unchanged).
- Only add media you own or have rights to use.

## Uploading to GitHub (hidden files fix)
Folders starting with a dot (`.github`) are **hidden**, so drag & drop upload often skips them and the build workflow is missing. Two easy fixes:

**A) Website upload:** upload everything, then on GitHub click **Add file > Create new file**, type the name
`.github/workflows/build-windows.yml` (typing `/` creates the folders), paste the content of `WORKFLOW-build-windows.yml`, and Commit.

**B) Git / command line:** double-click `fix-hidden-files.bat` (or copy `WORKFLOW-build-windows.yml` to `.github/workflows/build-windows.yml`), then `git add .`.

After that: **Actions** tab > *Build Definitive 1# PC (Windows)* > **Run workflow**, or push a tag `v1.0.0`.
