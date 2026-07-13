# 关卡分工与修改边界

## 建议分配

| 人员 | 负责关卡 | Git分支 |
|---|---|---|
| 小朋友A | 瑞金出发 | `level/ruijin-departure` |
| 小朋友A | 遵义转折 | `level/zunyi-turn` |
| 小朋友A | 四渡赤水 | `level/sidu-chishui` |
| 小朋友B | 湘江血战 | `level/xiangjiang-battle` |
| 小朋友B | 飞夺泸定桥 | `level/luding-bridge` |
| 小朋友B | 雪山草地 | `level/snow-grassland` |
| 项目负责人 | 会宁会师 | `level/huining-join` |

项目共七个关卡，对应七个独立Git分支。会宁会师由项目负责人保留，作为六关碎片、3D模型和AI结局的整合关。

## 各关可修改范围

### 瑞金出发

```text
frontend/src/views/levels/ruijinDeparture/
frontend/src/views/levelRuntime/adapters/ruijinDeparture.js
frontend/src/styles/levels/ruijinDeparture/
frontend/public/assets/levels/ruijin-departure/
backend/src/data/levels/ruijin-departure/
```

### 湘江血战

```text
frontend/src/views/levels/xiangjiangBattle/
frontend/src/views/levelRuntime/adapters/xiangjiangBattle.js
frontend/src/styles/levels/xiangjiangBattle/
frontend/public/assets/levels/xiangjiang-battle/
backend/src/data/levels/xiangjiang-battle/
```

### 遵义转折

```text
frontend/src/views/levels/zunyiTurn/
frontend/src/views/levelRuntime/adapters/zunyiTurn.js
frontend/src/styles/levels/zunyi*.css
frontend/public/assets/levels/zunyi-turn/
backend/src/data/levels/zunyi-turn/
```

### 飞夺泸定桥

```text
frontend/src/views/levels/ludingBridge/
frontend/src/views/levelRuntime/adapters/ludingBridge.js
frontend/src/styles/levels/luding*.css
frontend/public/assets/levels/luding-bridge/
backend/src/data/levels/luding-bridge/
```

### 四渡赤水

```text
frontend/public/embedded/sidu-chishui/
frontend/src/views/levelRuntime/adapters/siduChishui.js
frontend/public/assets/levels/sidu-chishui/
backend/src/data/levels/sidu-chishui/
```

### 雪山草地

```text
frontend/public/embedded/snow-grassland/
frontend/src/views/levelRuntime/adapters/snowGrassland.js
frontend/src/styles/levels/snowGrassland.css
frontend/public/assets/levels/snow-grassland/
backend/src/data/levels/snow-grassland/
```

### 会宁会师

```text
frontend/src/views/levelRuntime/adapters/huiningJoin.js
frontend/src/styles/levels/huiningJoin/
frontend/public/assets/levels/huining-join/
backend/src/data/levels/huining-join/
```

## 公共文件

以下文件由项目负责人统一维护。关卡开发者发现能力不足时提出需求，不直接加入关卡ID判断：

```text
frontend/src/main.js
frontend/src/views/level.js
frontend/src/views/levelDossier.js
frontend/src/views/levelRuntime/LevelHost.js
frontend/src/views/levelRuntime/protocol.js
frontend/src/views/levelRuntime/registry.js
frontend/src/views/action25d/historicalMission25d.js
frontend/src/views/action25d/historicalMissionUi.js
frontend/src/views/action25d/historicalMissionControllers.js
frontend/src/views/action25d/historicalMissionScenes/
frontend/src/styles/core.css
frontend/src/styles/shared/
scripts/
```

## 合并要求

1. 一关一个分支，不把三关混在同一次提交里。
2. 合并前运行 `npm run check-data` 和 `npm run build:pages`。
3. 关卡数据只编辑 `backend/src/data/`，随后运行 `npm run sync-data`。
4. 不修改其他人负责关卡的目录。
5. 公共引擎改动单独开分支和提交，不能夹在关卡提交中。
