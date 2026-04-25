# DEPLOY.md

## 目的

记录本项目的标准发版与部署流程，避免下次重复摸索认证方式、部署命令和顺序。

当前项目部署目标：

- 前端：Cloudflare Pages
- Worker：Cloudflare Workers

## 当前线上地址

- 前端正式地址：[https://xiaoliuren-web.pages.dev](https://xiaoliuren-web.pages.dev)
- Worker 地址：[https://xiaoliuren-ai.dove-justdoit.workers.dev](https://xiaoliuren-ai.dove-justdoit.workers.dev)
- AI 同源 API：[https://xiaoliuren-web.pages.dev/api/divination](https://xiaoliuren-web.pages.dev/api/divination)

## 发布顺序

推荐顺序如下：

1. 检查工作区状态
2. 更新版本号
3. 提交 release commit
4. 创建 git tag
5. 部署前端 Pages
6. 部署 Worker
7. 验证线上结果

## 版本发布步骤

### 1. 检查工作区

在项目根目录执行：

```bash
git status --short
```

要求：

- 工作区应明确可控
- 避免把未确认的临时改动一起发版

### 2. 更新版本号

当前版本号写在：

- `index.html` 页脚

例如把：

```html
v1.0.1
```

更新为：

```html
v1.0.2
```

### 3. 创建发布提交

```bash
git add "index.html"
git commit -m "release: v1.0.2"
```

如果本次发版不仅有版本号改动，也可以把对应功能变更一起提交，但要保证提交语义清晰。

### 4. 创建 tag

```bash
git tag -a v1.0.2 -m "v1.0.2"
```

检查 tag：

```bash
git tag --list
```

## 前端部署

### 前端环境要求

Pages Functions 会将 `/api/*` 同源请求代理到现有 Worker，避免浏览器直接请求 `workers.dev`。

AI 密钥仍配置在 Worker 项目中，Pages 项目不需要单独配置 `DEEPSEEK_API_KEY`。

在项目根目录执行：

```bash
wrangler pages deploy "." --project-name=xiaoliuren-web
```

成功后会返回一个预览/部署地址，例如：

```text
https://xxxxxxxx.xiaoliuren-web.pages.dev
```

说明：

- 该命令可直接复用本机现有 Wrangler 登录态
- 不需要单独设置 `CLOUDFLARE_API_TOKEN`，前提是 Wrangler 当前 OAuth 登录态有效
- 根目录 `wrangler.toml` 已配置 Pages Functions

## Worker 部署

在 `worker/` 目录执行：

```bash
wrangler deploy
```

成功后会返回：

- Worker 地址
- 当前版本 ID

例如：

```text
https://xiaoliuren-ai.dove-justdoit.workers.dev
Current Version ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 认证说明

本项目当前可用的认证方式是：

- Wrangler OAuth 登录态

本机登录态位置：

```text
/Users/lindo/Library/Preferences/.wrangler/config/default.toml
```

### 重要注意事项

如果在**非交互环境**下执行 `wrangler deploy`，可能会出现：

```text
In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN
```

这不一定表示本机没有登录，而是表示：

- 当前 OAuth 登录态无法在该次非交互调用中自动刷新

### 推荐做法

优先复用当前 Wrangler OAuth 登录态，并以**可交互方式**执行 Worker 部署。

已验证可行：

```bash
wrangler whoami
wrangler deploy
```

如果 `wrangler whoami` 能正常返回当前账号信息，通常就可以继续用同一登录态部署。

### 如果 OAuth 失效

执行：

```bash
wrangler login
```

重新登录后再部署。

### 如果必须走非交互环境

则需要显式提供：

```bash
CLOUDFLARE_API_TOKEN=...
```

但当前项目日常手工发布，优先继续使用本机 Wrangler OAuth 登录态，不必强制切 token 模式。

## 发布后验证

至少验证以下内容：

### 前端

- 首页可正常打开
- 起卦按钮可正常工作
- 结果摘要、卦象依据、综合解读、AI 区块显示正常
- 历史记录可展开查看

### Worker

- AI 解读请求成功
- 访问计数接口可正常读取
- 起卦后计数只增加一次，不重复累加
- 正式站浏览器 Network 中 AI 请求应指向 `https://xiaoliuren-web.pages.dev/api/divination`
- `https://xiaoliuren-web.pages.dev/api/count` 应返回 `{ "count": number }`

## 推送到远端

如果需要把发布提交和 tag 推到远端：

```bash
git push
git push origin v1.0.2
```

## 常用检查命令

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse --short HEAD
git tag --list
wrangler whoami
```

## 本次已验证的发布样例

- 版本号：`v1.0.2`
- release commit：`758bb25`
- tag：`v1.0.2`
- Pages 部署成功
- Worker 部署成功

后续发版时，优先按本文件顺序执行，不再临时试错。
