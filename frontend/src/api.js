const API_BASE = "/api";
const viteEnv = import.meta.env || {};
const runtimeBase = window.__BASE_PATH__ || viteEnv.BASE_URL || "/";
const DATA_BASE = `${runtimeBase}data`;
const REFLECT_FUNCTION_URL = "https://pfkamgzktfwfotirlocd.supabase.co/functions/v1/reflect";
const EXPRESSION_FUNCTION_URL = "https://pfkamgzktfwfotirlocd.supabase.co/functions/v1/expression";
const SPEECH_FUNCTION_URL = "https://pfkamgzktfwfotirlocd.supabase.co/functions/v1/speech";
const ARTWORK_FUNCTION_URL = "https://pfkamgzktfwfotirlocd.supabase.co/functions/v1/artwork";
const SOUVENIR_FUNCTION_URL = "https://pfkamgzktfwfotirlocd.supabase.co/functions/v1/souvenir";
const SUPABASE_ANON_KEY = "sb_publishable_PPOeqkqKK93vo6ugo_zCoA_6hXrSveM";

// 生产构建（GitHub Pages 静态托管）没有 Express 后端，
// 关卡数据改为读取打包进 frontend/public/data 的静态 JSON，
// AI 点评生成改为调用 Supabase Edge Function。
const STATIC_MODE = window.__STATIC_MODE__ === true || viteEnv.PROD === true;
let levelsIndexPromise = null;
const levelPromises = new Map();
const levelExperiencePromises = new Map();
let exhibitionPromise = null;

function fetchJson(url, errorMessage) {
  return fetch(url, { cache: STATIC_MODE ? "no-cache" : "default" }).then((res) => {
    if (!res.ok) throw new Error(errorMessage);
    return res.json();
  });
}

function createApiError(payload, fallbackMessage) {
  const error = new Error(payload?.error || fallbackMessage);
  error.code = payload?.code || null;
  error.requestId = payload?.requestId || null;
  error.providerStatus = payload?.providerStatus || null;
  error.providerDetail = payload?.providerDetail || null;
  return error;
}

export async function fetchLevelsIndex() {
  const url = STATIC_MODE ? `${DATA_BASE}/levels.json` : `${API_BASE}/levels`;
  levelsIndexPromise ||= fetchJson(url, "加载关卡列表失败").catch((err) => {
    levelsIndexPromise = null;
    throw err;
  });
  return levelsIndexPromise;
}

export async function fetchLevel(id) {
  const url = STATIC_MODE ? `${DATA_BASE}/levels/${id}/cards.json` : `${API_BASE}/levels/${id}`;
  if (!levelPromises.has(id)) {
    levelPromises.set(
      id,
      fetchJson(url, "加载关卡数据失败").catch((err) => {
        levelPromises.delete(id);
        throw err;
      })
    );
  }
  return levelPromises.get(id);
}

export async function fetchLevelExperience(id) {
  const url = STATIC_MODE
    ? `${DATA_BASE}/levels/${id}/experience.json`
    : `${API_BASE}/levels/${id}/experience`;
  if (!levelExperiencePromises.has(id)) {
    levelExperiencePromises.set(
      id,
      fetchJson(url, "加载第二期关卡配置失败").catch((err) => {
        levelExperiencePromises.delete(id);
        throw err;
      })
    );
  }
  return levelExperiencePromises.get(id);
}

export async function fetchExhibition() {
  const url = STATIC_MODE ? `${DATA_BASE}/exhibition.json` : `${API_BASE}/exhibition`;
  exhibitionPromise ||= fetchJson(url, "加载数字展台配置失败").catch((err) => {
    exhibitionPromise = null;
    throw err;
  });
  return exhibitionPromise;
}

export function preloadLevelsIndex() {
  fetchLevelsIndex().catch(() => {});
}

export function preloadLevel(id) {
  fetchLevel(id).catch(() => {});
}

export async function submitReflection(id, reflection, form) {
  const res = STATIC_MODE
    ? await fetch(REFLECT_FUNCTION_URL, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ levelId: id, reflection, form }),
      })
    : await fetch(`${API_BASE}/levels/${id}/reflect`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reflection, form }),
      });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "请求失败");
  }

  return res.json();
}

export async function submitLevelExpression(id, payload) {
  const res = STATIC_MODE
    ? await fetch(EXPRESSION_FUNCTION_URL, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ levelId: id, ...payload }),
      })
    : await fetch(`${API_BASE}/levels/${id}/expression`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw createApiError(err, "表达生成失败，请稍后重试");
  }
  return res.json();
}

export async function submitLevelSpeech(id, text) {
  const res = STATIC_MODE
    ? await fetch(SPEECH_FUNCTION_URL, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ levelId: id, text }),
      })
    : await fetch(`${API_BASE}/levels/${id}/speech`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "语音生成失败，请稍后重试");
  }
  return res.json();
}

export async function submitLevelArtwork(id, payload) {
  const res = STATIC_MODE
    ? await fetch(ARTWORK_FUNCTION_URL, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ levelId: id, ...payload }),
      })
    : await fetch(`${API_BASE}/levels/${id}/artwork`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw createApiError(err, "画作生成失败，请稍后重试");
  }
  return res.json();
}

export async function saveSouvenir(payload) {
  const res = await fetch(SOUVENIR_FUNCTION_URL, {
    method: "POST",
    headers: { "content-type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw createApiError(err, "作品暂时无法保存");
  }
  return res.json();
}

export async function fetchSouvenir(token) {
  const url = `${SOUVENIR_FUNCTION_URL}?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY }, cache: "no-store" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw createApiError(err, "作品暂时无法打开");
  }
  return res.json();
}
