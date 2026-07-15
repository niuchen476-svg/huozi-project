const EMBEDDED_LEVELS = {
  "sidu-chishui": {
    document: "embedded/sidu-chishui/index.html",
    firstImage: "embedded/sidu-chishui/assets/chishui-route.jpg",
  },
  "snow-grassland": {
    document: "embedded/snow-grassland/index.html",
    firstImage: "embedded/snow-grassland/assets/snow-main.jpg",
  },
};

const documentPreloads = new Map();
const imagePreloads = new Map();

export function preloadEmbeddedLevel(levelId) {
  const config = EMBEDDED_LEVELS[levelId];
  if (!config) return Promise.resolve();

  const documentUrl = embeddedAssetSrc(config.document);
  const imageUrl = embeddedAssetSrc(config.firstImage);
  if (!documentPreloads.has(documentUrl)) {
    documentPreloads.set(documentUrl, fetch(documentUrl, { cache: "force-cache" }).catch(() => null));
  }
  if (!imagePreloads.has(imageUrl)) {
    imagePreloads.set(imageUrl, new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = "high";
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = imageUrl;
    }));
  }

  return Promise.all([documentPreloads.get(documentUrl), imagePreloads.get(imageUrl)]);
}

export function renderEmbeddedLevel(root, level, runtime) {
  const src = embeddedSrc(level.levelId);
  preloadEmbeddedLevel(level.levelId);

  return new Promise((resolve) => {
    root.innerHTML = `
      <div class="embedded-level-shell embedded-level-shell--loading">
        <a class="embedded-level-shell__back" href="#/map">返回路线图</a>
        <div class="embedded-level-shell__loader" aria-live="polite">
          <span></span>
          <p>正在进入历史现场</p>
        </div>
        <iframe class="embedded-level-shell__frame" title="${level.title}" src="${src}" loading="eager" tabindex="0" allow="fullscreen"></iframe>
      </div>
    `;

    const shell = root.querySelector(".embedded-level-shell");
    const frame = root.querySelector(".embedded-level-shell__frame");
    frame.addEventListener("load", () => {
      shell.classList.remove("embedded-level-shell--loading");
      window.requestAnimationFrame(() => frame.focus({ preventScroll: true }));
    }, { once: true });

    function handleMessage(event) {
      if (event.source !== frame.contentWindow) return;
      if (event.data?.levelId !== level.levelId) return;
      if (event.data?.type === "changzheng-level-phase") {
        runtime?.setPhase(event.data.phase);
        return;
      }
      if (event.data?.type !== "changzheng-level-complete") return;
      window.removeEventListener("message", handleMessage);
      resolve("completed");
    }

    window.addEventListener("message", handleMessage);
  });
}

function embeddedSrc(levelId) {
  return embeddedAssetSrc(EMBEDDED_LEVELS[levelId].document);
}

function embeddedAssetSrc(path) {
  const runtimeBase = window.__BASE_PATH__ || import.meta.env?.BASE_URL || "/";
  const normalizedBase = runtimeBase.endsWith("/") ? runtimeBase : `${runtimeBase}/`;
  return `${normalizedBase}${path}`;
}
