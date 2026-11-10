# Drive Video Loop

Plays every video in a public Google Drive folder, fullscreen, one after another, looping forever.

## Setup

1. Share the Drive folder as **Anyone with the link → Viewer**.
2. Create a Google API key: Google Cloud Console → new project → enable **Google Drive API** → Credentials → Create API key.
   Restrict it to the Drive API and (after deploying) to your site's URL.
3. Put the key in `config.js` (`API_KEY`). Set `FOLDER_ID` if using a different folder.
4. Open `index.html` through a web server (e.g. XAMPP, or GitHub Pages).

## Usage

- Videos play in filename order, then restart from the first.
- Double-click toggles browser fullscreen (or press F11).
- The page tries to play with sound. If the browser blocks that, it plays muted until the first click or keypress.
- For sound with no interaction, run Chrome in kiosk mode: `chrome --kiosk --autoplay-policy=no-user-gesture-required <url>`.

## Hosting on GitHub Pages

Repo → Settings → Pages → Deploy from branch → `main` / root.
