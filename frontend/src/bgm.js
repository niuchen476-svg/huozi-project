const AUDIO_SRC = "/assets/audio/theme.mp3";
let suspendedByMedia = false;

export function suspendBgmForMedia() {
  const audio = document.querySelector("#bgm");
  if (!audio || audio.paused) {
    suspendedByMedia = false;
    return;
  }
  suspendedByMedia = true;
  audio.pause();
}

export function resumeBgmAfterMedia() {
  const audio = document.querySelector("#bgm");
  if (!audio || !suspendedByMedia) return;
  suspendedByMedia = false;
  audio.play().catch(() => {});
}

export function setupBgm() {
  const audio = document.querySelector("#bgm");
  const toggle = document.querySelector("#bgm-toggle");
  if (!audio || !toggle) return;

  audio.src = AUDIO_SRC;
  audio.volume = 0.5;

  function setPlaying(value) {
    toggle.textContent = value ? "⏸ 暂停音乐" : "♪ 播放音乐";
    toggle.classList.toggle("bgm-toggle--playing", value);
    toggle.setAttribute("aria-pressed", String(value));
  }

  async function tryPlay() {
    try {
      await audio.play();
      return true;
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        console.warn("[bgm] 播放失败:", err.name, err.message, "audio.error:", audio.error);
      }
      return false;
    }
  }

  audio.addEventListener("play", () => setPlaying(true));
  audio.addEventListener("pause", () => setPlaying(false));
  audio.addEventListener("ended", () => setPlaying(false));
  audio.addEventListener("error", () => {
    setPlaying(false);
    toggle.textContent = "音乐文件未就绪";
  });

  toggle.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (!audio.paused) {
      audio.pause();
      return;
    }
    const ok = await tryPlay();
    if (!ok) toggle.textContent = "音乐文件未就绪";
  });

  setPlaying(false);
}
