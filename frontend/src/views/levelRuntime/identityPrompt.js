const LEVEL_IDENTITIES = Object.freeze({
  "ruijin-departure": {
    title: "今天，你是秘密转移队伍的行动联络员。",
    description: "确认物资、守住消息，把队伍安全带到于都河畔。",
    action: "接受任务",
  },
  "xiangjiang-battle": {
    title: "今天，你是湘江渡口的行动协调员。",
    description: "抢修通道、判断火力窗口，帮助队伍渡过湘江。",
    action: "进入战场",
  },
  "sidu-chishui": {
    title: "今天，你是机动作战路线的参谋员。",
    description: "观察敌情与渡口变化，理解四次转向怎样争取主动。",
    action: "开始推演",
  },
  "luding-bridge": {
    title: "今天，你是泸定桥突击队的行动记录员。",
    description: "在有限时间里选择队伍、突破铁索，并记录这场行动。",
    action: "进入战场",
  },
  "snow-grassland": {
    title: "今天，你是雪山草地行军队伍的同行者。",
    description: "照顾体力与同伴，从具体人物理解极端环境中的坚持。",
    action: "踏上征途",
  },
  "huining-join": {
    title: "今天，你是三大主力会师的接应员。",
    description: "辨认会师节点，把分散的路线和碎片汇入最终展台。",
    action: "前往会宁",
  },
});

export function getLevelIdentity(levelId) {
  return LEVEL_IDENTITIES[levelId] || null;
}

export function showLevelIdentityPrompt({ levelId, level, signal } = {}) {
  const identity = getLevelIdentity(levelId);
  if (!identity) return Promise.resolve(true);

  const prompt = document.createElement("div");
  prompt.className = "level-identity-prompt";
  prompt.setAttribute("role", "dialog");
  prompt.setAttribute("aria-modal", "true");
  prompt.setAttribute("aria-labelledby", "level-identity-prompt-title");
  prompt.innerHTML = `
    <div class="level-identity-prompt__card">
      <p>身份确认 · ${escapeHtml(level?.title || "重走长征路")}</p>
      <h2 id="level-identity-prompt-title">${escapeHtml(identity.title)}</h2>
      <span>${escapeHtml(identity.description)}</span>
      <button type="button" data-confirm-level-identity>${escapeHtml(identity.action)}</button>
    </div>
  `;
  document.body.appendChild(prompt);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (accepted) => {
      if (settled) return;
      settled = true;
      prompt.remove();
      resolve(accepted);
    };
    prompt.querySelector("[data-confirm-level-identity]")?.addEventListener("click", () => finish(true), { once: true });
    signal?.addEventListener("abort", () => finish(false), { once: true });
    window.requestAnimationFrame(() => prompt.querySelector("button")?.focus());
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
