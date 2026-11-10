# Video Loop

Plays every video in the `videos` folder fullscreen, one after another, looping forever.

Google Drive can't stream video to a website (the browser blocks the response), so the videos live in this repo.

## Adding videos

1. Copy the video files (mp4 recommended) into `videos/`. Each file must be under 100 MB.
2. Run `.\update-videos.ps1` to refresh `videos.json` (or edit it by hand).
3. Commit and push. GitHub Pages updates in about a minute.

## Usage

- Videos play in the order listed in `videos.json`, then restart from the first.
- Double-click toggles browser fullscreen (or press F11).
- The page tries to play with sound. If the browser blocks that, it plays muted until the first click or keypress.
- For sound with no interaction, run Chrome in kiosk mode: `chrome --kiosk --autoplay-policy=no-user-gesture-required <url>`.

Open `index.html` through a web server (XAMPP or GitHub Pages), not by double-clicking it.
