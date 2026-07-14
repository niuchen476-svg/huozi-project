function compactText(value, maxLength = 180) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).replace(/[，、；：\s]+$/u, "")}……`;
}

export function getCompletionRecapData({ level = {}, experience = {}, result = {}, debrief = "" } = {}) {
  const completion = experience?.phases?.completion || {};
  const historicalMeaning = experience?.fragment?.historicalMeaning
    || level.significance
    || level.scenario
    || "回到史料中，看看刚才的行动为什么会成为长征路上的关键一步。";
  const actionDebrief = debrief
    || result?.data?.debrief
    || level.actionDebrief
    || "你已经完成本关行动。接下来，用史料重新理解刚才作出的判断。";

  return {
    eyebrow: "行动完成 · 历史复盘",
    title: completion.reviewTitle || `${level.title || "本关"}：回到历史现场`,
    debrief: compactText(actionDebrief, 150),
    historicalMeaning: compactText(historicalMeaning, 220),
    date: String(level.date || "").trim(),
    location: String(level.location || "").trim(),
  };
}

export function createCompletionRecap(options = {}) {
  const data = getCompletionRecapData(options);
  const section = document.createElement("section");
  section.className = `level-completion-recap${options.variant ? ` level-completion-recap--${options.variant}` : ""}`;
  section.dataset.levelCompletionRecap = "";

  const eyebrow = document.createElement("p");
  eyebrow.className = "level-completion-recap__eyebrow";
  eyebrow.textContent = data.eyebrow;
  const title = document.createElement("h1");
  title.textContent = data.title;
  const debrief = document.createElement("p");
  debrief.className = "level-completion-recap__debrief";
  debrief.textContent = data.debrief;

  section.append(eyebrow, title, debrief);

  if (data.date || data.location) {
    const facts = document.createElement("p");
    facts.className = "level-completion-recap__facts";
    facts.textContent = [data.date, data.location].filter(Boolean).join(" · ");
    section.appendChild(facts);
  }

  const history = document.createElement("div");
  history.className = "level-completion-recap__history";
  const historyLabel = document.createElement("strong");
  historyLabel.textContent = "这一行动为什么重要";
  const historyText = document.createElement("p");
  historyText.textContent = data.historicalMeaning;
  history.append(historyLabel, historyText);
  section.appendChild(history);

  return section;
}
