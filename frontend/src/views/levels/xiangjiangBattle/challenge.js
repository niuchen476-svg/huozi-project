export const challenge = {
  type: "sequence",
  title: "渡江行动排序",
  debrief: "你已经抢修浮桥、组织队列通过火力窗口并转移江滩伤员。现在回到关卡任务：把抢渡行动排成正确顺序。",
  prompt: "按真实战斗逻辑排列 4 个行动环节。",
  required: ["seize", "bridge", "cover", "cross"],
  successTitle: "渡江组织完成",
  successText: "先抢占渡口，再架设通路，两翼阻击掩护，主力才能抓住窗口渡过湘江。",
  errorText: "顺序还不稳：湘江抢渡要先打开渡口和通路，再用阻击掩护主力过江。",
  options: [
    { id: "cover", label: "两翼阻击", detail: "拖住追击与压迫" },
    { id: "cross", label: "主力渡江", detail: "中央纵队与大部队通过" },
    { id: "seize", label: "抢占渡口", detail: "先把通道入口拿下来" },
    { id: "bridge", label: "架设通路", detail: "搭设和修复渡江通道" },
  ],
};
