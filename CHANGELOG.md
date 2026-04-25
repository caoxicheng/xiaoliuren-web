# Changelog

## v1.1.1 - 2026-04-25

### Added

- 新增 Pages Functions 同源 API 入口 `/api/*`，由服务端代理到现有 Worker 的 AI 解读与访问计数逻辑。
- 新增 Pages 项目 `wrangler.toml`，配置 Pages Functions 部署入口。
- 为首屏增加克制的纸卷入场动效，并支持 `prefers-reduced-motion`。

### Changed

- 前端 AI 解读与访问计数请求改为同源 `/api/divination`、`/api/count`，降低中国大陆网络直连 `workers.dev` 的可用性风险。
- 本地 `file://` 打开时保留旧 Worker 地址作为开发 fallback。
- 更新部署文档，说明 Pages 同源 API 代理到现有 Worker。
- 将页脚版本号更新为 `v1.1.1`。

### Notes

- 独立 Worker 保留为服务端代理目标与排障入口，本版本不移除旧服务。

## v1.1.0 - 2026-04-24

### Added

- 新增首页基础 SEO 配置，包括 canonical、Open Graph、Twitter Card、robots 和 theme-color。
- 新增 `WebApplication` 与 `FAQPage` JSON-LD 结构化数据。
- 新增少量可索引静态说明内容，覆盖小六壬简介、支持事项、使用方式和参考说明。
- 新增 `robots.txt` 与 `sitemap.xml`，声明首页正式地址与站点地图。

### Changed

- 重构首页为新中式占课纸风格，强化六神序列、签纸式起卦区和朱砂印章按钮。
- 优化结果摘要信息架构，改为主卦大字、吉凶印章、判词、三宫与宜忌分区。
- 统一卦象依据、综合解读、AI 解读、历史记录与 SEO 内容区的纸面细线视觉风格。
- 将页脚版本号更新为 `v1.1.0`。

### Notes

- 本版本不新增 Open Graph 分享图。
- 本工具仍仅供娱乐和传统文化学习参考，不构成现实决策建议。
