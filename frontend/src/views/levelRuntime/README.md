# Level Runtime

这一层只统一关卡边界，不统一关卡内部玩法。

## 目录职责

```text
LevelHost.js        关卡加载、生命周期、结算、重开和页面状态
protocol.js         所有关卡必须遵守的返回协议
registry.js         关卡 ID 到独立适配器的唯一注册表
assetPreload.js     适配器共用的轻量预加载工具
sourceDrawer.js     右上角“本关史料”抽屉组件
expressionPanel.js  统一“我的表达”面板（史料选择、短输入、结果展示）
adapters/           每关一个文件，只连接本关内容与统一协议
```

## 关卡返回协议

适配器的 `play(context)` 必须返回 `LevelResult`，不要再直接返回字符串：

```js
continueLevel({ actionCompleted: true }); // 进入统一档案/挑战后半段
completeLevel({ actionCompleted: true }); // 本关直接结算、发放碎片
skipLevel({ actionCompleted: false });    // 跳过行动，进入后半段
cancelLevel();                            // 生命周期被中止
```

`context` 统一包含：

```js
{
  root,       // 关卡渲染根节点
  level,      // 当前关卡数据
  levelId,
  signal      // 离开关卡或重开时会 abort
}
```

适配器可以实现：

```js
export default {
  id: "new-level",
  challenge: null,
  preload(context) {},
  play(context) {},
  dispose(context) {},
};
```

## 新增关卡

1. 在 `adapters/` 新建独立适配器文件。
2. 在 `registry.js` 增加一条动态 import。
3. 关卡内部自由选择 DOM、Canvas、Three.js 或 iframe。
4. 完成时只返回统一 `LevelResult`，不要在关卡内部写地图跳转、进度存储或碎片发放。

地图跳转、通关记录、碎片奖励和重开均由 `LevelHost` 负责。

## 本关史料抽屉

`createLevelSourceDrawer()` 是独立公共组件，最多显示 8 份 `visibleInSourceDrawer: true` 的史料。它负责右上角入口、可滚动列表、展开详情、Esc 关闭和焦点循环。

组件只通过 `onOpenChange(open)` 报告开关状态，不直接暂停关卡或控制音频。计时暂停、背景音降低和数据加载将在后续由 `LevelHost` 统一接入。

关卡开发者不复制或修改该组件，只填写本关 `experience.json` 中的史料数据。

## 统一 AI 表达

`createLevelExpressionPanel()` 是独立公共组件。关卡只提供操作选择和
`experience.json` 配置，不直接调用 MiMo，也不能保存或读取 API Key。

统一请求协议：

```js
POST /api/levels/:levelId/expression
{
  sourceIds: ["本关已审核史料 ID"],
  choiceIds: ["本关操作选择 ID"],
  userText: "玩家最多 80 字的表达",
  outputType: "必须与本关配置一致"
}
```

统一响应协议：

```js
{
  title: "我的展品说明",
  text: "整理后的第一人称表达",
  sourceIds: ["实际采用的史料 ID"],
  label: "AI根据玩家选择生成",
  usedFallback: false
}
```

模型超时、断网或密钥未配置时，服务端返回相同结构的固定模板，且
`usedFallback: true`，不会阻断通关。该面板将在下一步由 `LevelHost` 统一挂载。

`huiningJoin.js` 已作为会宁会师的独立挂载点。当前保持档案页行为不变，
后续可直接在该适配器中接入会议室、3D碎片合成和AI个人展台。
