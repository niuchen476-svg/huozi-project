# Level Runtime

这一层只统一关卡边界，不统一关卡内部玩法。

## 目录职责

```text
LevelHost.js        关卡加载、生命周期、结算、重开和页面状态
protocol.js         所有关卡必须遵守的返回协议
registry.js         关卡 ID 到独立适配器的唯一注册表
assetPreload.js     适配器共用的轻量预加载工具
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

`huiningJoin.js` 已作为会宁会师的独立挂载点。当前保持档案页行为不变，
后续可直接在该适配器中接入会议室、3D碎片合成和AI个人展台。
