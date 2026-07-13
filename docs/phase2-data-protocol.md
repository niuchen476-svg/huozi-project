# 第二期数据协议

第二期围绕“进入历史、身处历史、遇见文献、作出表达、完成本关”建立统一数据层。协议先以可选配置接入，不改变一期关卡运行方式。

## 产品约束

- 单关目标时长为 120 秒，允许范围为 60～180 秒。
- 七个关卡均可自由选择，不设置前置解锁。
- 前六关产生碎片，会宁会师承担数字展台组合。
- 数字展台允许只用一个或多个已获得碎片组成，不要求集齐六块。
- 不记录姓名、学校等个人身份信息。

## 数据源

`backend/src/data` 是唯一源头。修改后运行：

```bash
npm run sync-data
npm run check-data
```

同步脚本会把数据复制到 `frontend/public/data`，供 GitHub Pages 静态构建读取。

## 文件职责

- `levels.json`：自由访问、关卡角色和目标时长。
- `levels/<levelId>/cards.json`：保留一期关卡文案。
- `levels/<levelId>/experience.json`：第二期五阶段、史料、音频、表达和碎片配置。
- `exhibition.json`：会宁数字展台的组合规则。

## 七关统一模板

七个关卡都必须拥有自己的 `experience.json`，并使用完全一致的顶层结构。所有新增阶段默认关闭，Level Host 接入前不参与页面渲染，因此当前玩法和内容不变。

每份模板统一包含：

- `duration`：60～180 秒，目标 120 秒。
- `sourceDrawer`：右上角“本关史料”入口的固定配置。
- `phases`：简报、玩法、史料、表达、完成五阶段。
- `audio`：环境、旁白、交互和完成音乐。
- `fragment`：前六关碎片；会宁固定为 `null`。

每关最多登记 8 份经过筛选的史料，其中最多 3 份真正参与玩法。史料项目统一使用：

```json
{
  "id": "source-level-example",
  "title": "史料名称",
  "type": "document",
  "summary": "一句话摘要",
  "originalExcerpt": "",
  "plainExplanation": "",
  "sourceName": "形成机构或出版来源",
  "sourceUrl": "",
  "rightsStatus": "pending",
  "activeInGameplay": true,
  "visibleInSourceDrawer": true,
  "availableForAiExpression": true
}
```

`rightsStatus` 只能使用 `pending`、`reviewed`、`cleared` 或 `restricted`。旁白必须提供 `transcript`。

表达阶段统一使用 MiMo，但默认关闭。关卡开发者只能填写本关问题、输出类型和固定兜底模板，不能接触 MiMo API Key、公共提示词或调用代码。

两位关卡开发者只能编辑各自关卡目录内的 `experience.json` 和专属资源。协议结构、公共读取接口、Level Host 和数字展台组合逻辑由项目负责人维护。

## 兼容规则

- 现有碎片 ID 不更名，以免本地进度失效。
- 3D 模型未提供时允许 `model` 为 `null`。
- 二维图片未提供时允许使用 `legacyVisualId` 调用现有 CSS 图形。
- 史料入口、史料阶段、音频和表达未准备好时使用 `enabled: false` 或空数组。
- Level Host 接入第二期配置之前，新增数据只被校验和读取，不参与页面渲染。
