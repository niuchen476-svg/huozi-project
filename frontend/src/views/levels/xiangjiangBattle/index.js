import { renderHistoricalMission25d } from "../../action25d/historicalMission25d.js";
import { XIANGJIANG_MISSION } from "./mission.js";
 
export function renderXiangjiangBattleAction25d(root, level) {
  return renderHistoricalMission25d(root, level, XIANGJIANG_MISSION);
}
