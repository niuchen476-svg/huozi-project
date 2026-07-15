import { renderHistoricalMission25d } from "../../action25d/historicalMission25d.js";
import { RUIJIN_MISSION } from "./mission.js";
 
export function renderRuijinDepartureAction25d(root, level, experience) {
  return renderHistoricalMission25d(root, level, RUIJIN_MISSION, experience);
}
