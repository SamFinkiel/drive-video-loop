const player = document.getElementById("player");
const message = document.getElementById("message");

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
  if (!videos.length) {
    message.textContent = "videos.json is empty.";
    return;
  }

  let index = 0;
  let failures = 0;
  const play = () => {
    player.src = "videos/" + encodeURIComponent(videos[index]);
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

  // If autoplay fell back to muted, the first interaction turns sound on.
  const unmute = () => { player.muted = false; };
  document.addEventListener("click", unmute, { once: true });
  document.addEventListener("keydown", unmute, { once: true });

  // Double-click toggles fullscreen.
  document.addEventListener("dblclick", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
}

start();
