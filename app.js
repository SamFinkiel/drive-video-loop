const player = document.querySelector('#player');
player.muted = true;
const message = document.querySelector('#message');
const fifteenMinMS = 15 * 60 * 1000;
const time = Date.now();
const runTime = fifteenMinMS - (time % fifteenMinMS);

async function loadList() {
  const res = await fetch("videos.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("Could not load videos.json");
  return res.json();
}

async function start() {
  let videos;
  try {
    videos = await loadList();
  } catch (err) {
    message.textContent = err.message;
    return;
  }
  if (!Array.isArray(videos) || !videos.length) {
    message.textContent = "videos.json is empty.";
    return;
  }

  let index = 0;
  let failures = 0;

  player.addEventListener('loadedmetadata', () => {
    const behind = (Date.now() % fifteenMinMS) / 1000;
    if (index === 0 && behind < player.duration) player.currentTime = behind;
  }, { once: true });
  
  const play = () => {
    player.src = "videos/" + encodeURIComponent(videos[index]);
    player.play().catch(err => {
      if (err.name !== "AbortError") message.textContent = "Autoplay was blocked by the browser.";
    });
  };

  // Advance to next video; wrap to the first after the last.
  player.addEventListener("ended", () => {
    index = (index + 1) % videos.length;
    play();
  });
  player.addEventListener("playing", () => { message.textContent = ""; failures = 0; });
  // Skip a missing/broken video instead of stalling.
  player.addEventListener("error", () => {
    message.textContent = `Could not load "${videos[index]}". Skipping…`;
    index = (index + 1) % videos.length;
    failures++;
    setTimeout(play, failures >= videos.length ? 15000 : 1000);
  });

  message.textContent = "";
  play();

  // Double-click toggles fullscreen.
  document.addEventListener("dblclick", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
}

start();

setTimeout(() => {
  window.location.reload();
}, runTime)