# 伪 3A 电影化 2.5D 素材接入规范

## 目标

当前项目要从“网页互动卡片”升级为“伪 3A 电影化 2.5D”体验。素材接入的核心目标是：

- 让孩子感觉自己进入了历史现场，而不是在做题。
- 遵义会议偏沉浸推理，重点是会议空间、桌面物件和记录员视角。
- 飞夺泸定桥偏动作压迫，重点是背后跟随、铁索前景、火光弹道和身体动作。
- 新素材优先服务交互，不只做装饰背景。

本规范用于后续接入 ChatGPT / 图像模型生成的图片、透明 PNG、视频片段和 UI 图标。

---

## 总体美术原则

### 推荐风格

- 电影化历史游戏概念图。
- 写实但适合小学生，不血腥、不恐怖。
- 2.5D 分层：背景、人物前景、桌面物件、特效、低干扰 UI 分开。
- 画面有空间纵深，适合镜头推进、轻微缩放、视差移动。
- 低饱和历史质感，暖色马灯 / 火光配冷色夜景 /雨雾。

### 避免

- 不要现代服装、现代建筑、现代枪械、现代字体。
- 不要血腥、尸体特写、恐怖表情。
- 不要大段文字、水印、Logo。
- 不要过度卡通化。
- 不要把关键交互内容画死在背景里。可交互物件尽量单独给透明 PNG。

---

## 推荐目录结构

后续新增素材建议放在以下目录：

```text
frontend/public/assets/levels/zunyi-turn/cinematic/
frontend/public/assets/levels/zunyi-turn/props/
frontend/public/assets/levels/zunyi-turn/effects/

frontend/public/assets/levels/luding-bridge/cinematic/
frontend/public/assets/levels/luding-bridge/props/
frontend/public/assets/levels/luding-bridge/effects/

frontend/public/assets/shared/fragments/
frontend/public/assets/shared/ui/
docs/references/
```

说明：

- `cinematic/`：整张 16:9 场景图或视频背景，用于镜头。
- `props/`：透明 PNG 物件，用于点击、拖拽、摆放。
- `effects/`：透明 PNG 特效，如烟雾、火星、弹道、光晕。
- `shared/fragments/`：通关碎片，如铁索链环、会议记录纸。
- `shared/ui/`：长征行囊、提示框、印章、低干扰 HUD。
- `docs/references/`：参考视频、截帧，不进入 `frontend/public`，不参与 GitHub Pages 正式部署。

---

## 现有素材盘点与可用方式

### 遵义会议现有素材

位置：

```text
frontend/public/assets/levels/zunyi-turn/
```

可用素材：

```text
site-exterior.png
meeting-table-room.png
meeting-painting-wide.png
meeting-room-map.png
meeting-manuscript.png
handwriting-closeup.png
videos/zunyi-intro-01.mp4
videos/zunyi-intro-02.mp4
```

建议用途：

- `site-exterior.png`：门外入场镜头、会址夜景背景。
- `meeting-table-room.png`：记录员站到桌边后的主背景。
- `meeting-painting-wide.png`：会议人物氛围镜头，可做推门后过场。
- `meeting-room-map.png`：地图类推理背景或桌面地图纹理。
- `meeting-manuscript.png`：电报/手稿物件纹理。
- `handwriting-closeup.png`：纸张细节、记录纸、旧文书纹理。
- `zunyi-intro-01.mp4` / `zunyi-intro-02.mp4`：关卡前导视频，可看可跳过。

现有长征物品里可用于遵义会议：

```text
frontend/public/assets/relics/document-letters.png
frontend/public/assets/relics/handwritten-letter.png
frontend/public/assets/relics/kerosene-lamp.png
frontend/public/assets/relics/victory-paper.png
```

建议用途：

- `document-letters.png`：桌面书信组，可作为“史料原件”。
- `handwritten-letter.png`：可拖动线索物件。
- `kerosene-lamp.png`：桌面马灯，增强会议氛围。
- `victory-paper.png`：奖励或最终记录纸参考。

### 飞夺泸定桥现有素材

位置：

```text
frontend/public/assets/levels/luding-bridge/
```

可用素材：

```text
pov-start.png
pov-mid.png
pov-fire.png
pov-arrival.png
squad-assembly.png
teammate-icon.png
teammate-fall.png
bridge-victory.png
videos/luding-bridge-intro.mp4
```

参考素材：

```text
reference/assault-close-painting.png
reference/assault-painting-wide.png
reference/assault-team-painting.png
reference/assault-victory-painting.png
reference/historic-bridge-deck.png
reference/historic-iron-chains.png
reference/modern-bridge-pov.png
```

建议用途：

- `pov-start.png`：冲桥初段背景。
- `pov-mid.png`：桥中段背景。
- `pov-fire.png`：火力和桥头火光背景。
- `pov-arrival.png`：接近对岸背景。
- `squad-assembly.png`：战前集合、报名突击队。
- `teammate-icon.png`：临时人物占位。
- `teammate-fall.png`：失败/危险反馈，不建议强化血腥。
- `bridge-victory.png`：夺桥成功画面。
- `luding-bridge-intro.mp4`：关卡前导视频。
- `reference/*`：用于风格参考，必要时也可局部裁切做背景占位。

现有长征物品里可用于泸定桥：

```text
frontend/public/assets/relics/bugle.png
frontend/public/assets/relics/rifles.png
frontend/public/assets/relics/ammo-clips.png
frontend/public/assets/relics/grenades.png
frontend/public/assets/relics/red-star-cap.png
frontend/public/assets/relics/uniform-jacket.png
frontend/public/assets/relics/belt.png
frontend/public/assets/relics/canteen-tin.png
```

建议用途：

- `bugle.png`：战前冲锋/集合信号。
- `rifles.png`、`ammo-clips.png`：战斗物件，不直接鼓励射击身体，可表现为压制火力点。
- `red-star-cap.png`、`uniform-jacket.png`、`belt.png`：人物前景、行囊、角色装备参考。
- `canteen-tin.png`：急行军补给道具。

### 参考视频与截帧

位置：

```text
docs/references/
```

已有：

```text
inspiration-gameplay.mp4
chrome-frames/frame-04.png
chrome-frames/frame-08.png
chrome-frames/frame-12.png
chrome-frames/frame-16.png
```

用途：

- `inspiration-gameplay.mp4`：参考“第三人称 3A 电影化”风格。
- `chrome-frames/frame-04.png`：动作战斗参考，背后跟随、弹道、红边、烟火。
- `chrome-frames/frame-08.png`：会议入场参考，第三人称站在门口看会议。
- `chrome-frames/frame-12.png`：会议桌近景参考，马灯、人物、桌面地图。
- `chrome-frames/frame-16.png`：大场景气氛参考，月光、河道、队伍火把。

这些是参考素材，默认不进入正式游戏画面。

---

## 命名规范

### 通用规则

- 使用小写英文和连字符。
- 不使用中文文件名。
- 不使用随机哈希名。
- 背景图用 `scene-` 开头。
- 透明道具用 `prop-` 开头。
- 特效用 `effect-` 开头。
- 人物/身体前景用 `character-` 或 `foreground-` 开头。
- 通关碎片用 `fragment-` 开头。

### 遵义会议推荐命名

```text
scene-exterior-night.png
scene-doorway-entry.png
scene-meeting-room-wide.png
scene-recorder-desk.png

prop-meeting-map.png
prop-letter-stack.png
prop-handwritten-letter.png
prop-telegram.png
prop-loss-report.png
prop-record-book.png
prop-kerosene-lamp.png
prop-teacup.png
prop-pencil.png
prop-stamp.png

effect-door-shadow.png
effect-lamp-glow.png
effect-paper-ink.png

fragment-meeting-record.png
```

### 飞夺泸定桥推荐命名

```text
scene-bridgehead-third-person.png
scene-chain-crawl-pov.png
scene-fire-crossing.png
scene-victory-bridgehead.png

foreground-soldier-back.png
foreground-hands-chain-01.png
foreground-hands-chain-02.png
foreground-hands-chain-03.png
character-teammate-crawl-01.png
character-teammate-crawl-02.png

prop-iron-chain.png
prop-bridge-plank.png
prop-bugle.png

effect-bullet-trail-left.png
effect-bullet-trail-right.png
effect-smoke.png
effect-sparks.png
effect-fire-wall.png
effect-red-damage-edge.png

fragment-iron-chain-link.png
```

### 通用 UI 推荐命名

```text
ui-memory-satchel.png
ui-hint-paper.png
ui-route-progress.png
ui-red-stamp-complete.png
ui-ai-guide-avatar.png
```

---

## 素材规格

### 场景背景

推荐：

```text
1920x1080
16:9
PNG 或 JPG
```

要求：

- 画面中心不要放满文字。
- 重要交互区域尽量留空间。
- 背景不要把可交互物件画死，如果物件需要拖拽，应单独输出透明 PNG。
- 允许有电影黑边感，但正式素材最好不自带黑边，由前端控制。

### 透明 PNG 道具

推荐：

```text
512x512 到 1600x1600
PNG
透明背景
```

要求：

- 物体完整，边缘干净。
- 不要白底、黑底、阴影硬边。
- 最好保留自然投影，但投影也应透明渐变。
- 桌面物件建议稍微俯视角，方便放在会议桌上。

### 人物/前景身体

推荐：

```text
PNG
透明背景
高度 900px 以上
```

要求：

- 背影、半身、手臂、趴伏动作都可以。
- 飞夺泸定桥至少需要 2-3 张动作帧：准备、前扑、压低。
- 遵义会议可以用剪影或虚化背影，不需要具体历史人物肖像。

### 特效素材

推荐：

```text
PNG 序列或单张透明 PNG
```

要求：

- 弹道、烟雾、火星、火光、灯光都需要透明背景。
- 火光不要覆盖整张图，方便前端叠加。
- 特效可偏抽象，但不能太卡通。

### 视频素材

推荐：

```text
MP4
16:9
1080p
时长 10-30 秒
```

要求：

- 用于关卡导入或短过场。
- 最好无字幕、无水印。
- 如果有字幕，字幕不要遮挡交互区域。
- 可选跳过，不能强迫孩子长时间观看。

---

## 遵义会议接入方案

### 最终体验结构

```text
视频导入
  ↓
门外夜景：参会者走向会场
  ↓
推门进入：看到会议桌与人物
  ↓
记录员桌面视角：开始整理史料
  ↓
拖动真实物件到会议记录纸
  ↓
盖章 / 获得会议记录纸碎片
```

### 现有素材占位组合

第一版可以这样使用：

- 门外背景：`site-exterior.png`
- 会议入场：`meeting-painting-wide.png`
- 桌面背景：`meeting-table-room.png`
- 桌面马灯：`relics/kerosene-lamp.png`
- 书信：`relics/document-letters.png`
- 手写信：`relics/handwritten-letter.png`
- 纸张纹理：`meeting-manuscript.png`、`handwriting-closeup.png`

### 新素材优先级

最高优先级：

```text
scene-recorder-desk.png
prop-meeting-map.png
prop-record-book.png
prop-telegram.png
prop-loss-report.png
fragment-meeting-record.png
```

第二优先级：

```text
scene-doorway-entry.png
prop-teacup.png
prop-pencil.png
prop-stamp.png
effect-lamp-glow.png
```

### 交互物件映射

| 交互含义 | 推荐素材名 | 当前可用替代 |
| --- | --- | --- |
| 湘江损失 | `prop-loss-report.png` | CSS 旧报告纸 |
| 人数锐减 | `prop-loss-report.png` | CSS 记录纸 |
| 敌军追击 | `prop-meeting-map.png` | `meeting-room-map.png` |
| 遵义休整机会 | `prop-telegram.png` | `meeting-manuscript.png` |
| 错误指挥 | `prop-telegram.png` | CSS 电报纸 |
| 干扰说法 | `prop-note-paper.png` | CSS 便签纸 |
| 新方向 | `prop-record-book.png` | CSS 方案纸 |

---

## 飞夺泸定桥接入方案

### 最终体验结构

```text
视频导入
  ↓
桥头第三人称背影：报名突击队 / 战前集合
  ↓
铁索桥冲锋：背后跟随或近距离趴伏视角
  ↓
空格前扑爬行，左右方向压低躲避
  ↓
弹道、烟雾、火光、镜头震动
  ↓
冲过火墙 / 获得铁索链环碎片
```

### 现有素材占位组合

第一版可以这样使用：

- 战前集合：`squad-assembly.png`
- 冲桥阶段背景：`pov-start.png`、`pov-mid.png`、`pov-fire.png`、`pov-arrival.png`
- 胜利画面：`bridge-victory.png`
- 临时人物：`teammate-icon.png`
- 临时坠落/危险反馈：`teammate-fall.png`
- 桥体参考：`reference/historic-iron-chains.png`、`reference/modern-bridge-pov.png`

### 新素材优先级

最高优先级：

```text
foreground-soldier-back.png
foreground-hands-chain-01.png
foreground-hands-chain-02.png
foreground-hands-chain-03.png
effect-bullet-trail-left.png
effect-bullet-trail-right.png
effect-smoke.png
effect-fire-wall.png
fragment-iron-chain-link.png
```

第二优先级：

```text
scene-bridgehead-third-person.png
scene-chain-crawl-pov.png
character-teammate-crawl-01.png
character-teammate-crawl-02.png
effect-sparks.png
effect-red-damage-edge.png
```

### 动作状态映射

| 玩家操作 | 画面反馈 | 推荐素材 |
| --- | --- | --- |
| 空格前进 | 身体前扑，镜头轻震 | `foreground-hands-chain-02.png` |
| 左躲 | 身体压向左侧铁索 | `foreground-hands-chain-03.png` 或 CSS transform |
| 右躲 | 身体压向右侧铁索 | `foreground-hands-chain-03.png` 或 CSS mirror |
| 火力出现 | 弹道从左/右划过 | `effect-bullet-trail-left/right.png` |
| 受击警告 | 红边、震动、烟尘 | `effect-red-damage-edge.png`、`effect-smoke.png` |
| 冲过火墙 | 火光增强，画面变亮 | `effect-fire-wall.png` |

---

## 通关碎片与行囊

项目主线需要“碎片收集”感。建议统一放到：

```text
frontend/public/assets/shared/fragments/
```

推荐碎片：

```text
fragment-meeting-record.png
fragment-iron-chain-link.png
```

通用行囊：

```text
frontend/public/assets/shared/ui/ui-memory-satchel.png
```

表现建议：

- 通关时碎片从场景中飞入行囊。
- 遵义会议碎片从会议记录纸折出。
- 飞夺泸定桥碎片从铁索链环中亮起。
- 行囊不要做成商店背包，要像长征档案袋/布挎包。

---

## 给图像模型的交付建议

### 每次生成不要太多

建议每轮只生成一类：

1. 遵义会议桌面场景。
2. 遵义会议桌面物件。
3. 泸定桥战士前景。
4. 泸定桥特效。
5. 碎片和 UI。

### 每张图生成后请保存为规范命名

例如：

```text
scene-recorder-desk.png
prop-meeting-map.png
foreground-soldier-back.png
effect-bullet-trail-left.png
fragment-iron-chain-link.png
```

### 如果模型不能生成透明 PNG

可以先生成白底/黑底，但后续需要抠图。推荐在提示词中明确：

```text
transparent background PNG, isolated object, clean edges
```

---

## 最小可用素材包

如果只想最快进入下一轮开发，优先给这些：

### 遵义会议最小包

```text
scene-recorder-desk.png
prop-meeting-map.png
prop-loss-report.png
prop-telegram.png
prop-record-book.png
fragment-meeting-record.png
```

### 飞夺泸定桥最小包

```text
foreground-soldier-back.png
foreground-hands-chain-01.png
foreground-hands-chain-02.png
effect-bullet-trail-left.png
effect-bullet-trail-right.png
effect-smoke.png
effect-fire-wall.png
fragment-iron-chain-link.png
```

拿到这两组后，前端就可以先做出明显接近参考视频的 2.5D 电影化版本。

---

## 接入检查清单

新素材进入项目时，按这个顺序检查：

1. 文件名是否符合英文连字符规范。
2. 是否放在正确目录。
3. 背景是否 16:9。
4. 透明 PNG 是否真的透明。
5. 是否有水印、文字、现代元素。
6. 物件边缘是否干净。
7. 是否适合小学生观看。
8. 是否能对应具体交互动作。

只有满足这些条件，素材才应该进入正式关卡。
