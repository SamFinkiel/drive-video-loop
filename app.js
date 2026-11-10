const player = document.getElementById("player");
const message = document.getElementById("message");
const unmuteBtn = document.getElementById("unmute");

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
    player.play().catch(() => {});
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

  // Browsers block autoplay with sound, so start muted and offer a toggle.
  unmuteBtn.hidden = false;
  unmuteBtn.addEventListener("click", () => {
    player.muted = false;
    unmuteBtn.hidden = true;
  });

  // Click anywhere for fullscreen.
  document.addEventListener("dblclick", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
}

start();
