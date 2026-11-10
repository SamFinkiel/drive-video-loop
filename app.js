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

const videoUrl = (id) => `${api}/${id}?alt=media&key=${CONFIG.API_KEY}`;

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
  const play = () => {
    player.src = videoUrl(videos[index].id);
    // Try with sound; if the browser blocks it, fall back to muted.
    player.play().catch(() => {
      player.muted = true;
      player.play().catch(() => {});
    });
  };

  // Advance to next video; wrap to the first after the last.
  player.addEventListener("ended", () => {
    index = (index + 1) % videos.length;
    play();
  });
  // Skip a broken video instead of stalling.
  player.addEventListener("error", () => {
    index = (index + 1) % videos.length;
    setTimeout(play, 1000);
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
