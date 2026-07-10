const EMBEDDED_LEVELS = {
  "sidu-chishui": "embedded/sidu-chishui/index.html",
  "snow-grassland": "embedded/snow-grassland/index.html",
};

export function renderEmbeddedLevel(root, level) {
  const src = embeddedSrc(level.levelId);

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="embedded-level-shell">
        <a class="embedded-level-shell__back" href="#/map">返回路线图</a>
        <iframe class="embedded-level-shell__frame" title="${level.title}" src="${src}" allow="fullscreen"></iframe>
      </div>
    `;

    function handleMessage(event) {
      if (event.data?.type !== "changzheng-level-complete") return;
      if (event.data.levelId !== level.levelId) return;
      window.removeEventListener("message", handleMessage);
      resolve("completed");
    }

    window.addEventListener("message", handleMessage);
  });
}

function embeddedSrc(levelId) {
  const runtimeBase = window.__BASE_PATH__ || import.meta.env?.BASE_URL || "/";
  const normalizedBase = runtimeBase.endsWith("/") ? runtimeBase : `${runtimeBase}/`;
  return `${normalizedBase}${EMBEDDED_LEVELS[levelId]}`;
}
