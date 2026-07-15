export function getLevelSources(experience) {
  const sources = experience?.phases?.sources?.items;
  return Array.isArray(sources) ? sources : [];
}

export function getLevelSource(experience, sourceId) {
  if (!sourceId) return null;
  return getLevelSources(experience).find((source) => source?.id === sourceId) || null;
}

export function resolveLevelSource(experience, reference) {
  const sourceId = typeof reference === "string" ? reference : reference?.sourceId;
  if (!sourceId) return reference || null;
  return getLevelSource(experience, sourceId) || reference || null;
}

export function getGameplaySourceIds(experience) {
  const ids = experience?.phases?.gameplay?.sourceIds;
  return Array.isArray(ids) ? ids.filter(Boolean) : [];
}
