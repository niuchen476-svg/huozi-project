# Frontend view architecture

```text
main.js
└─ views/level.js                 极薄的关卡入口
   ├─ levelRuntime/               统一加载、协议、结算、适配器注册
   └─ levelDossier.js             共用档案、挑战与AI感悟后半段

views/levelRuntime/adapters/      每关一个外部适配器
views/levels/                     完全独立的专属关卡实现
views/action25d/                  瑞金、湘江共用的历史任务引擎
views/action3d/                   保留的3D原型与对象库
public/embedded/                  四渡赤水、雪山草地独立iframe实现
```

## 边界规则

1. `LevelHost` 不出现具体关卡 ID 分支。
2. 每个关卡只通过自己的 adapter 接入统一运行时。
3. 关卡内部不直接发碎片、写通关状态或跳转地图。
4. 共用引擎只放真正复用的交互能力，历史内容留在关卡配置中。
5. 会宁会师从 `huiningJoin.js` 接入，专属实现位于 `views/levels/huiningJoin/`；适配器只负责加载数据并把结果交回 `LevelHost`。
6. 所有结构迁移先保持内容、DOM类名、CSS顺序和交互参数不变。
