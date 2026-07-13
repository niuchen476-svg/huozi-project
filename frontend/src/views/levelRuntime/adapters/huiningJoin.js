import { continueLevel } from "../protocol.js";

// 会宁会师当前仍使用统一档案页。未来的会议室、3D碎片合成或
// AI个人展台从这个适配器接入，不需要再修改 LevelHost。
export default {
  id: "huining-join",
  preload() {},
  play() {
    return continueLevel({ actionCompleted: false });
  },
};
