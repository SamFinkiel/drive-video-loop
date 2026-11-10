const player = document.getElementById("player");
const message = document.getElementById("message");

const api = "https://www.googleapis.com/drive/v3/files";

async function listVideos() {
  const q = encodeURIComponent(`'${CONFIG.FOLDER_ID}' in parents and mimeType contains 'video/' and trashed = false`);
  const url = `${api}?q=${q}&orderBy=name&pageSize=1000&fields=files(id,name)&key=${CONFIG.API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Drive API error ${res.status}. Check API key and that the folder is shared publicly.`);
  return (await res.json()).files;
}

// Two ways to stream a public Drive file; the second is tried if the first fails.
const sources = [
  (id) => `${api}/${id}?alt=media&key=${CONFIG.API_KEY}`,
  (id) => `https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`,
];

async function start() {
  if (CONFIG.API_KEY.startsWith("PASTE")) {
    message.textContent = "Add your Google API key to config.js";
    return;
  }

  let videos;
  try {
    videos = await listVideos();
  } catch (err) {
    message.textContent = err.message;
    return;
  }
  if (!videos.length) {
    message.textContent = "No videos found in the folder.";
    return;
  }

  let index = 0;
  let source = 0;
  let failures = 0;
  const play = () => {
    player.src = sources[source](videos[index].id);
    // Try with sound; if the browser blocks it, fall back to muted.
    player.play().catch(() => {
      player.muted = true;
      player.play().catch(() => {});
    });
  };

  // Advance to next video; wrap to the first after the last.
  player.addEventListener("ended", () => {
    index = (index + 1) % videos.length;
    source = 0;
    failures = 0;
    play();
  });
  player.addEventListener("playing", () => { message.textContent = ""; failures = 0; });
  // Try the next source, then skip a broken video instead of stalling.
  player.addEventListener("error", () => {
    const code = player.error ? player.error.code : "?";
    message.textContent = `Could not load "${videos[index].name}" (media error ${code}). Trying next…`;
    if (source < sources.length - 1) {
      source++;
    } else {
      source = 0;
      index = (index + 1) % videos.length;
      failures++;
    }
    // If every video has failed, slow down instead of hammering Google.
    setTimeout(play, failures >= videos.length ? 15000 : 1000);
  });

  message.textContent = "";
  play();

  // If autoplay fell back to muted, the first interaction turns sound on.
  const unmute = () => { player.muted = false; };
  document.addEventListener("click", unmute, { once: true });
  document.addEventListener("keydown", unmute, { once: true });

  // Click anywhere for fullscreen.
  document.addEventListener("dblclick", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
}

start();
