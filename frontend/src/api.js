const API_BASE = "/api";

export async function fetchLevelsIndex() {
  const res = await fetch(`${API_BASE}/levels`);
  if (!res.ok) throw new Error("加载关卡列表失败");
  return res.json();
}

export async function fetchLevel(id) {
  const res = await fetch(`${API_BASE}/levels/${id}`);
  if (!res.ok) throw new Error("加载关卡数据失败");
  return res.json();
}

export async function verifyInference(id, inference) {
  const res = await fetch(`${API_BASE}/levels/${id}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ inference }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "验证请求失败");
  }

  return res.json();
}
