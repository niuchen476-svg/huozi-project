const API_BASE = "/api";
const viteEnv = import.meta.env || {};
const runtimeBase = window.__BASE_PATH__ || viteEnv.BASE_URL || "/";
const DATA_BASE = `${runtimeBase}data`;
const REFLECT_FUNCTION_URL = "https://pfkamgzktfwfotirlocd.supabase.co/functions/v1/reflect";
const SUPABASE_ANON_KEY = "sb_publishable_PPOeqkqKK93vo6ugo_zCoA_6hXrSveM";

// 生产构建（GitHub Pages 静态托管）没有 Express 后端，
// 关卡数据改为读取打包进 frontend/public/data 的静态 JSON，
// AI 点评生成改为调用 Supabase Edge Function。
const STATIC_MODE = window.__STATIC_MODE__ === true || viteEnv.PROD === true;

export async function fetchLevelsIndex() {
  const url = STATIC_MODE ? `${DATA_BASE}/levels.json` : `${API_BASE}/levels`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("加载关卡列表失败");
  return res.json();
}

export async function fetchLevel(id) {
  const url = STATIC_MODE ? `${DATA_BASE}/levels/${id}/cards.json` : `${API_BASE}/levels/${id}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("加载关卡数据失败");
  return res.json();
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
