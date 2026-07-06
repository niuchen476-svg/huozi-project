const AUDIO_SRC = "/assets/audio/theme.mp3";

export function setupBgm() {
  const audio = document.querySelector("#bgm");
  const toggle = document.querySelector("#bgm-toggle");
  if (!audio || !toggle) return;

  audio.src = AUDIO_SRC;
  audio.volume = 0.5;

  let playing = false;

  function setPlaying(value) {
    playing = value;
    toggle.textContent = playing ? "⏸ 暂停音乐" : "♪ 播放音乐";
  }

  async function tryPlay() {
    try {
      await audio.play();
      setPlaying(true);
      return true;
    } catch (err) {
      console.error("[bgm] 播放失败:", err.name, err.message, "audio.error:", audio.error);
      return false;
    }
  }

  // 浏览器通常会拦截页面刚加载时的自动播放（需要用户先与页面产生一次交互），
  // 这里先尝试直接自动播放；不行的话，监听全局第一次点击/按键/触摸，一旦发生就立刻播放。
  tryPlay().then((ok) => {
    if (ok) return;

    const startOnFirstInteraction = () => {
      tryPlay();
      window.removeEventListener("click", startOnFirstInteraction);
      window.removeEventListener("keydown", startOnFirstInteraction);
      window.removeEventListener("touchstart", startOnFirstInteraction);
    };

    window.addEventListener("click", startOnFirstInteraction);
    window.addEventListener("keydown", startOnFirstInteraction);
    window.addEventListener("touchstart", startOnFirstInteraction);
  });

  toggle.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    const ok = await tryPlay();
    if (!ok) toggle.textContent = "音乐文件未就绪";
  });
}
