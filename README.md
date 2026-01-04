# 小六壬算卦网页应用

<thinking>
用户要求分段输出，我需要创建一个完整但不过长的README.md文件。这个文件应该包含项目介绍、功能特性、技术栈、使用方法和部署步骤。我会保持内容简洁明了。
</thinking>

一个基于传统小六壬占卜术的纯前端网页应用，支持自动起卦、详细解读和历史记录保存。

## ✨ 功能特性

- 🎯 **自动起卦**：点击按钮自动获取当前时间并起卦
- 📊 **详细解读**：展示六神含义、吉凶判断和针对性建议
- 💾 **历史记录**：自动保存占卜历史（最多50条）
- 📱 **响应式设计**：支持桌面、平板和手机浏览器
- 🎨 **现代简约**：清爽的界面设计，流畅的动画效果

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式和动画
- **Vanilla JavaScript** - 核心逻辑（无框架依赖）
- **lunar-javascript** - 农历转换库（CDN引入）
- **localStorage** - 本地数据存储

## 📦 项目结构

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
└── README.md              # 项目说明
```

## 🚀 快速开始

### 本地运行

1. 克隆或下载项目到本地
2. 直接用浏览器打开 `index.html` 文件即可使用

**注意**：由于使用了CDN引入的农历库，需要联网才能正常使用。

### 部署到 GitHub Pages

1. 在 GitHub 创建新仓库（例如：`xiaoliuren-web`）

2. 将项目推送到 GitHub：
```bash
cd xiaoliuren-web
git init
git add .
git commit -m "Initial commit: 小六壬算卦网页应用"
git branch -M main
git remote add origin https://github.com/你的用户名/xiaoliuren-web.git
git push -u origin main
```

3. 在 GitHub 仓库设置中启用 Pages：
   - 进入仓库的 **Settings** → **Pages**
   - Source 选择 **main** 分支
   - 点击 **Save**

4. 等待几分钟后，访问：
   ```
   https://你的用户名.github.io/xiaoliuren-web/
   ```

## 📖 使用说明

1. **起卦**：点击"立即起卦"按钮，系统自动获取当前时间并计算卦象
2. **查看结果**：查看月宫、日宫、时宫（主卦）的六神及详细解读
3. **历史记录**：点击"查看历史记录"查看过往占卜记录
4. **删除记录**：点击历史记录项的"删除"按钮可删除单条记录

## 🔮 小六壬简介

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
