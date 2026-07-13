export const LEVEL_STATUS = Object.freeze({
  CONTINUE: "continue",
  COMPLETED: "completed",
  SKIPPED: "skipped",
  CANCELLED: "cancelled",
});

export function levelResult(status, options = {}) {
  if (!Object.values(LEVEL_STATUS).includes(status)) {
    throw new Error(`未知的关卡返回状态：${status}`);
  }

  return Object.freeze({
    status,
    actionCompleted: options.actionCompleted === true,
    data: options.data || null,
  });
}

export const continueLevel = (options) => levelResult(LEVEL_STATUS.CONTINUE, options);
export const completeLevel = (options) => levelResult(LEVEL_STATUS.COMPLETED, options);
export const skipLevel = (options) => levelResult(LEVEL_STATUS.SKIPPED, options);
export const cancelLevel = (options) => levelResult(LEVEL_STATUS.CANCELLED, options);

export function assertLevelResult(result, levelId) {
  if (!result || !Object.values(LEVEL_STATUS).includes(result.status)) {
    throw new Error(`关卡适配器 ${levelId} 没有返回合法的 LevelResult`);
  }
  return result;
}
