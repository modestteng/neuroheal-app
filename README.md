# 智愈莘莘 NeuroHeal

面向高校学生的脑电情绪监测与心理健康干预演示应用。项目包含：

- React + TypeScript + Vite 前端
- DeepSeek AI 陪聊后端代理
- 本地开发模式
- 可部署到 Render 的一体化生产模式

## 本地开发

```bash
npm install
npm run api
npm run dev
```

浏览器打开：

```text
http://127.0.0.1:5173
```

本地 `.env` 可参考 `.env.example`：

```bash
DEEPSEEK_API_KEY=你的_DeepSeek_Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_PORT=8787
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

## 生产部署方案

项目现已支持“一体化上线”：

- `npm run build` 生成前端 `dist/`
- `npm run start` 启动 Node 服务
- 同一个服务同时提供：
  - `/`
  - 静态前端资源
  - `/api/chat`
  - `/api/health`

### 推荐平台

推荐使用 Render Web Service。

### Render 配置

- Build Command

```bash
npm install && npm run build
```

- Start Command

```bash
npm run start
```

- Environment Variables

```bash
DEEPSEEK_API_KEY=你的新 Key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
NODE_VERSION=20
```

Render 会自动提供 `PORT`，项目已经兼容，无需手动设置。

### 部署后验证

先打开：

```text
你的线上地址/api/health
```

如果返回：

```json
{
  "ok": true,
  "configured": true
}
```

说明后端环境变量和接口已就绪。

之后再打开网站首页，测试：

- AI 聊天是否有真实回复
- 页面交互是否正常
- 头像、通知、商城、小游戏是否都可访问

## 上传 GitHub 后的推荐流程

1. 将项目推送到 GitHub
2. 打开 Render
3. 新建 Web Service
4. 选择该 GitHub 仓库
5. 填入上面的 Build / Start 命令
6. 配置环境变量
7. 等待部署完成
8. 复制 Render 分配的公开网址发给别人

## 重要安全提醒

不要把真实 DeepSeek Key 提交到 GitHub。

你之前在聊天里展示过一枚 Key，正式上线前建议：

1. 去 DeepSeek 平台废弃旧 Key
2. 新建一枚新的 Key
3. 只把新 Key 配到 Render 环境变量里

## 常用命令

```bash
npm run build
npm run start
npm run build:single
```

- `build`：正式生产构建
- `start`：生产服务启动
- `build:single`：生成离线演示包，不适合真实 AI 联网体验
