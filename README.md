# 长征档案行

活字编程课程项目。前端是静态互动站点，本地开发时可连接 Express 后端；部署到 GitHub Pages 后读取静态数据，并通过 Supabase Edge Function 处理 AI 反思。

## 目录边界

```text
frontend/                 前端应用、正式静态素材、GitHub Pages 构建入口
backend/                  本地 Express API；backend/src/data 是关卡数据唯一编辑源
supabase/functions/       生产静态站点调用的 Edge Function
scripts/                  数据同步、数据一致性检查等维护脚本
docs/                     产品文档、交互脚本、参考素材和归档说明
.github/workflows/        GitHub Pages 自动部署
```

## 数据源规则

只直接编辑：

```text
backend/src/data/
```

不要手改这些生成副本：

```text
frontend/public/data/
supabase/functions/reflect/data/levels-data.ts
```

关卡数据改动后运行：

```bash
npm run sync-data
npm run check-data
```

## 素材规则

正式运行素材放在：

```text
frontend/public/assets/
```

参考视频、截帧、临时检查图放在：

```text
docs/references/
```

`docs/references` 不参与 GitHub Pages 构建；不要把参考素材放回 `frontend/public/assets`，否则会被部署到线上站点。

## 本地开发

后端：

```bash
npm run dev:backend
```

前端：

```bash
npm run dev:frontend
```

默认地址：

```text
后端 API：http://localhost:3001
前端预览：http://localhost:5173
```

## 构建和部署

本地普通构建：

```bash
npm run build
```

GitHub Pages 构建：

```bash
npm run build:pages
```

推送到 `main` 后，`.github/workflows/deploy-pages.yml` 会自动部署 `frontend/dist` 到：

```text
https://niuchen476-svg.github.io/huozi-project/
```

## AI 反思

本地后端反思接口依赖 `backend/.env`：

```text
MIMO_API_BASE=...
MIMO_API_KEY=...
MIMO_MODEL=mimo-v2.5
```

GitHub Pages 静态模式下不使用 Express 后端，而是调用 Supabase Edge Function。改动会影响 AI 反思的关卡数据后，需要同步数据并重新部署函数：

```bash
npm run sync-data
npm run deploy-reflect
```

## 会宁 AI 画作

会宁数字展台在 MiMo 生成讲解文字后，可以继续调用 AIHubMix 的 `qwen-image-2.0` 创作 16:9 画作，并由浏览器在右下角叠加玩家署名。其他六关不启用生图。

本地密钥保存在 `backend/.env`，可运行 `scripts/configure-aihubmix-key.ps1` 使用密码弹窗配置：

```text
AIHUBMIX_API_BASE=https://aihubmix.com/v1
AIHUBMIX_API_KEY=...
AIHUBMIX_IMAGE_MODEL=qwen-image-2.0
AIHUBMIX_IMAGE_ENABLED=false
AIHUBMIX_IMAGE_DAILY_LIMIT=1
```

开发时保持 `AIHUBMIX_IMAGE_ENABLED=false`，页面会使用固定纪念画面验证回退和署名，不产生生图费用。需要真实验收时再临时开启。真实请求不会自动重试，本地每日调用记录保存在被 Git 忽略的 `backend/storage/image-usage.json`。

GitHub Pages 使用已部署的 Supabase `artwork` Edge Function。API Key 必须配置为 Supabase Secret，不能写入前端或提交 Git；上线前还需显式设置 `AIHUBMIX_IMAGE_ENABLED=true` 和合适的 `AIHUBMIX_IMAGE_DAILY_LIMIT`：

```bash
npm run deploy-artwork
```
