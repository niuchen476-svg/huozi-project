export const challenge = {
  type: "supply",
  title: "物资取舍",
  debrief: "你已经完成机要编组、隐蔽转移和渡口接应。现在回到关卡任务：在出发前做一次关键取舍。",
  prompt: "只能优先带 3 件，选出最能支撑战略转移的物资。",
  required: ["map", "radio", "medical"],
  successTitle: "出发准备完成",
  successText: "地图保证路线判断，电台维持联络，急救包保护伤员。队伍可以继续向于都河推进。",
  errorText: "再想一想：长距离隐蔽转移最需要路线、联络和救护，不只是多带沉重物件。",
  options: [
    { id: "map", label: "苏区地图", detail: "辨认渡河点和封锁线" },
    { id: "radio", label: "电台电池", detail: "维持队伍联络" },
    { id: "medical", label: "急救包", detail: "照护伤员和病号" },
    { id: "cabinet", label: "沉重木柜", detail: "拖慢夜间行军" },
    { id: "copper", label: "多余铜锅", detail: "占用背包空间" },
    { id: "banner", label: "庆典彩旗", detail: "容易暴露目标" },
  ],
};
