# huozi-project

活字编程 · 复活我们的图书馆 —— 项目脚手架（选题待定）

## 目录结构

```
huozi-project/
├── frontend/     # Vite + 原生 JS 前端，浏览器可直接预览
├── backend/      # Node.js + Express 后端 API
└── docs/         # 课程要求、选题笔记等文档
```

## 快速开始

### 后端

```bash
cd backend
npm install
npm run dev   # http://localhost:3001
```

### 前端

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

前端默认通过 `/api` 前缀请求后端（见 `frontend/vite.config.js` 的 proxy 配置）。

## 推送到 GitHub

```bash
git init
git add .
git commit -m "init: project skeleton"
git branch -M main
git remote add origin <你的仓库地址>
git push -u origin main
```

## 待办

- [ ] 确定选题（六大赛道 + Define 五问）
- [ ] 接入 CADAL / 图书馆真实数据
- [ ] 补充 AI 能力（OCR / RAG / 图像修复等）
