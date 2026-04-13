# 小六壬算卦网页应用

# 小六壬算卦网页应用

一个基于传统小六壬占卜术的纯前端网页应用，支持自动起卦、AI 深度解读和历史记录保存。

## 功能特性

- **自动起卦**：点击按钮自动获取当前时间并起卦
- **事项选择**：支持求财、出行、婚姻、疾病等 8 类事项
- **AI 深度解读**：基于 DeepSeek 大模型，结合事项类型给出专业解读
- **详细解读**：展示六神含义、吉凶判断和针对性建议
- **历史记录**：自动保存占卜历史（最多 50 条）
- **响应式设计**：支持桌面、平板和手机浏览器
- **现代简约**：清爽的界面设计，流畅的动画效果

## 技术栈

- **HTML5 + CSS3 + Vanilla JavaScript**（无框架依赖）
- **lunar-javascript** - 农历转换库（CDN 引入）
- **localStorage** - 本地数据存储
- **Cloudflare Worker** - AI 解读后端代理
- **DeepSeek API** - AI 深度解读

## 项目结构

```
xiaoliuren-web/
├── index.html              # 主页面
├── css/
│   └── main.css           # 样式文件
├── js/
│   ├── data.js            # 六神和事项数据
│   ├── xiaoliuren-core.js # 核心算法
│   ├── storage.js         # 历史记录管理
│   └── app.js             # 主应用逻辑
├── worker/
│   ├── index.js           # Cloudflare Worker（AI 代理）
│   └── wrangler.toml      # Worker 配置
└── README.md
```

## 快速部署

### 1. 部署 Cloudflare Worker（AI 解读后端）

```bash
cd worker
npm install -g wrangler
wrangler login  # 浏览器授权

# 设置 DeepSeek API Key
wrangler secret put DEEPSEEK_API_KEY
# 输入你的 DeepSeek API Key

wrangler deploy
```

Worker 地址：`https://xiaoliuren-ai.<your-subdomain>.workers.dev/api/divination`

### 2. 部署前端到 Cloudflare Pages

```bash
# 在项目根目录
wrangler pages deploy . --project-name=xiaoliuren-web
```

或在 Cloudflare Dashboard 操作：
1. dash.cloudflare.com/pages → Create a project
2. 连接 GitHub，选 `caoxicheng/xiaoliuren-web`
3. Build command 留空，Build output directory 填 `/`
4. Save and Deploy

### 3. 绑定 Worker 到前端

Worker 部署后，Worker 地址需要写入前端代码 `app.js` 的 `fetch('/api/divination', ...)` 地址中。如果 Worker 和 Pages 在同一账号下，可以配置 Custom Domain 让前端直接通过 `/api/divination` 访问 Worker。

## 本地运行

直接用浏览器打开 `index.html` 即可。

## 小六壬简介

小六壬是中国传统占卜术之一，以大安、留连、速喜、赤口、小吉、空亡六神为基础，通过农历月、日、时的推算来判断吉凶。

**起卦方法**：
1. 从大安起正月，顺数到所求月份，得月宫
2. 从月宫起初一，顺数到所求日期，得日宫
3. 从日宫起子时，顺数到所求时辰，得时宫（主卦）

## 📝 开发说明

### 核心算法

小六壬起卦算法（`js/xiaoliuren-core.js`）：
```javascript
const yueGong = (lunarMonth - 1) % 6;
const riGong = (yueGong + lunarDay - 1) % 6;
const shiGong = (riGong + shichenNum - 1) % 6;
```

### 数据来源

- 六神详细数据：基于传统小六壬典籍整理
- 事项解读数据：涵盖求财、出行、婚姻感情等8大类

## ⚠️ 免责声明

本应用仅供娱乐和文化学习参考，不构成任何决策建议。请理性对待占卜结果。

## 📄 许可证

MIT License

## 🙏 致谢

- 感谢 [lunar-javascript](https://github.com/6tail/lunar-javascript) 提供的农历转换功能
- 感谢传统文化的传承者们

---

**祝您使用愉快！** 🎉
