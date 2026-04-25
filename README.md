# 小六壬算卦

基于传统小六壬占卜术的网页应用，自动起卦 + AI 深度解读，支持 DeepSeek 流式输出。

[在线体验](https://xiaoliuren-web.pages.dev) · [卦象解释](#小六壬简介) · [快速部署](#快速部署) · [发布部署手册](./DEPLOY.md) · [更新日志](./CHANGELOG.md)

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 自动起卦 | 基于农历月、日、时，三宫推算 |
| 事项选择 | 求财、出行、婚姻、疾病等 8 类 |
| AI 解读 | DeepSeek 模型，Pages 同源 API 流式返回，支持 markdown |
| 传统解读 | 六神五行、吉凶判断、歌诀释义 |
| 历史记录 | localStorage 持久化，最多 50 条 |
| 访问计数 | 独立计数 API |

---

## 技术栈

- **前端**：HTML5 + CSS3 + Vanilla JS（零框架依赖）
- **农历**：lunar-javascript（CDN）
- **AI 后端**：Cloudflare Pages Functions 同源代理 + Cloudflare Worker + DeepSeek API
- **部署**：Cloudflare Pages + Workers

---

## 项目结构

```
xiaoliuren-web/
├── index.html              # 主页面
├── css/main.css           # 样式
├── js/
│   ├── app.js             # 主应用逻辑
│   ├── data.js            # 六神数据、事项解读
│   ├── storage.js         # 历史记录
│   └── xiaoliuren-core.js # 核心算法
├── functions/
│   └── api/[[path]].js    # Pages 同源 API 代理入口
└── worker/
    ├── index.js           # Cloudflare Worker（AI 代理）
    └── wrangler.toml      # 配置
```

---

## 快速部署

详细发布流程、版本号更新、tag、Cloudflare 认证与部署说明请见：

- [DEPLOY.md](./DEPLOY.md)

### 1. 配置 Pages AI 环境

当前正式站通过 `/api/*` 同源访问 AI 服务，Pages Functions 会在服务端代理到现有 Worker，避免浏览器直接请求 `workers.dev`。

### 2. 部署 AI Worker（兼容/备用）

```bash
cd worker
npm install -g wrangler
wrangler login

# 设置 DeepSeek API Key
wrangler secret put DEEPSEEK_API_KEY

wrangler deploy
```

### 3. 部署前端

```bash
wrangler pages deploy . --project-name=xiaoliuren-web
```

或在 Cloudflare Dashboard：连接 GitHub → Build command 留空 → Build output 填 `/`

部署后，线上 AI 请求应走 `https://xiaoliuren-web.pages.dev/api/*`。旧 Worker 地址保留为 Pages 服务端代理目标、本地 `file://` fallback 和排障入口。

---

## 本地运行

直接用浏览器打开 `index.html` 即可（AI 解读需要部署 Worker 后使用）。

---

## 小六壬简介

小六壬是中国传统占卜术，以大安、留连、速喜、赤口、小吉、空亡六神为基础，通过农历月、日、时的推算来判断吉凶。

**起卦方法**：
1. 从大安起正月，顺数到所求月份，得月宫
2. 从月宫起初一，顺数到所求日期，得日宫
3. 从日宫起子时，顺数到所求时辰，得时宫（主卦）

### 六神一览

| 六神 | 五行 | 吉凶 | 代表含义 |
|------|------|------|----------|
| 大安 | 木 | 吉 | 稳定安宁，诸事顺遂 |
| 留连 | 木 | 平 | 拖延纠缠，事多反复 |
| 速喜 | 火 | 吉 | 喜事临门，好消息至 |
| 赤口 | 金 | 凶 | 口舌是非，争执不断 |
| 小吉 | 水 | 小吉 | 小有收获，利于合作 |
| 空亡 | 土 | 凶 | 落空虚无，求谋不遂 |

---

## 核心算法

```javascript
const yueGong = (lunarMonth - 1) % 6;
const riGong = (yueGong + lunarDay - 1) % 6;
const shiGong = (riGong + shichenNum - 1) % 6;
```

---

## 免责声明

本应用仅供娱乐和文化学习参考，不构成任何决策建议。请理性对待占卜结果。

---

## 许可证

MIT License
