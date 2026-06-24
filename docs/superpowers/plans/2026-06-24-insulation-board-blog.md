# 隔热板个人 Blog 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 初始化一个可部署到 GitHub Pages 的 Astro + Decap CMS 隔热板个人 Blog。

**Architecture:** Astro 负责静态页面生成，内容通过 `src/content/posts` 中的 Markdown 管理。Decap CMS 通过 `public/admin` 提供后台入口，配置文件把文章字段和上传图片目录映射到仓库文件。GitHub Actions 构建并发布 `dist` 到 GitHub Pages。

**Tech Stack:** Astro、TypeScript、Markdown Content Collections、Decap CMS、GitHub Actions、CSS。

---

## 文件结构

- `package.json`：定义 npm 脚本和依赖。
- `package-lock.json`：锁定依赖版本。
- `astro.config.mjs`：Astro 站点配置，设置 GitHub Pages 站点地址。
- `tsconfig.json`：Astro TypeScript 配置。
- `src/content/config.ts`：定义文章内容集合 schema。
- `src/content/posts/*.md`：示例文章内容。
- `src/layouts/BaseLayout.astro`：全站 HTML 外壳、导航、页脚和全局样式入口。
- `src/layouts/PostLayout.astro`：文章详情页排版。
- `src/components/PostCard.astro`：文章卡片。
- `src/components/PhotoMosaic.astro`：首页图片拼贴首屏。
- `src/pages/index.astro`：首页。
- `src/pages/blog/index.astro`：文章列表页。
- `src/pages/blog/[slug].astro`：文章详情页路由。
- `src/pages/about.astro`：关于页面。
- `src/styles/global.css`：全站视觉系统和响应式样式。
- `public/admin/index.html`：Decap CMS 后台入口。
- `public/admin/config.yml`：Decap CMS 配置。
- `public/uploads/.gitkeep`：保留上传目录。
- `public/images/*.svg`：初始占位视觉资源。
- `.github/workflows/deploy.yml`：GitHub Pages 部署工作流。
- `.gitignore`：忽略依赖、构建产物和临时视觉稿。
- `README.md`：中文项目说明、开发命令、部署和 CMS 配置说明。

---

### Task 1: 初始化 Astro 项目骨架

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Modify: `.gitignore`

- [ ] **Step 1: 创建 npm 项目配置**

写入 `package.json`：

```json
{
  "name": "724027324.github.io",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev --host 127.0.0.1",
    "build": "astro check && astro build",
    "preview": "astro preview --host 127.0.0.1"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.4",
    "astro": "^5.0.0",
    "typescript": "^5.6.0"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: 创建 Astro 配置**

写入 `astro.config.mjs`：

```js
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://724027324.github.io",
});
```

- [ ] **Step 3: 创建 TypeScript 配置**

写入 `tsconfig.json`：

```json
{
  "extends": "astro/tsconfigs/strict"
}
```

- [ ] **Step 4: 创建 `.gitignore`**

写入 `.gitignore`：

```gitignore
node_modules/
dist/
.astro/
.env
.env.local
.superpowers/
```

- [ ] **Step 5: 安装依赖**

Run: `npm install`

Expected: 生成 `package-lock.json`，命令退出码为 0。

- [ ] **Step 6: 提交骨架**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore
git commit -m "chore: initialize Astro project"
```

### Task 2: 建立内容模型和示例文章

**Files:**
- Create: `src/content/config.ts`
- Create: `src/content/posts/field-note-edge-detail.md`
- Create: `src/content/posts/material-observation-surface.md`
- Create: `src/content/posts/project-reflection-first-post.md`

- [ ] **Step 1: 定义文章集合 schema**

写入 `src/content/config.ts`：

```ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    cover: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
```

- [ ] **Step 2: 创建现场手记示例文章**

写入 `src/content/posts/field-note-edge-detail.md`：

```markdown
---
title: "从边角细节看隔热板现场质量"
description: "记录一次现场观察：边角处理往往比参数表更能暴露施工习惯。"
publishDate: 2026-06-24
cover: "/images/placeholder-board-detail.svg"
tags:
  - 现场手记
  - 施工观察
---

隔热板项目里，很多质量问题不是出现在材料参数上，而是出现在边角、收口和连接处。

这类细节很适合用照片记录。以后我会把现场看到的问题、处理方式和个人判断整理在这里，方便复盘，也方便和同行交流。
```

- [ ] **Step 3: 创建材料观察示例文章**

写入 `src/content/posts/material-observation-surface.md`：

```markdown
---
title: "隔热板表面状态给我的三个提醒"
description: "从表面状态、运输痕迹和安装前检查三个角度记录材料观察。"
publishDate: 2026-06-18
cover: "/images/placeholder-board-stack.svg"
tags:
  - 材料观察
  - 经验记录
---

材料到场以后，第一眼看到的往往不是完整结论，但会给后续检查提供方向。

我习惯先看表面状态、边缘保护和堆放方式。这些信息不能替代检测报告，却能帮助我们更快判断项目现场是否需要额外关注。
```

- [ ] **Step 4: 创建项目复盘示例文章**

写入 `src/content/posts/project-reflection-first-post.md`：

```markdown
---
title: "为什么想把隔热板经验写下来"
description: "这个 Blog 的第一篇说明：把零散经验沉淀成可回看的记录。"
publishDate: 2026-06-12
cover: "/images/placeholder-worksite.svg"
tags:
  - 个人观点
  - 项目复盘
---

很多现场经验如果不及时记录，很快就会变成模糊印象。

这个 Blog 会用图片和文字记录我对隔热板项目的观察，包括材料、施工、沟通和复盘。它不是产品手册，而是一个长期积累个人判断的地方。
```

- [ ] **Step 5: 运行类型检查**

Run: `npx astro check`

Expected: Astro 初始化完成后检查通过；如果此时页面还不存在导致检查失败，记录错误并在 Task 3 后重新运行。

- [ ] **Step 6: 提交内容模型**

```bash
git add src/content/config.ts src/content/posts
git commit -m "feat: add blog content collection"
```

### Task 3: 实现页面、组件和视觉样式

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/layouts/PostLayout.astro`
- Create: `src/components/PostCard.astro`
- Create: `src/components/PhotoMosaic.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/blog/index.astro`
- Create: `src/pages/blog/[slug].astro`
- Create: `src/pages/about.astro`
- Create: `src/styles/global.css`
- Create: `public/images/placeholder-board-detail.svg`
- Create: `public/images/placeholder-board-stack.svg`
- Create: `public/images/placeholder-worksite.svg`

- [ ] **Step 1: 创建全站布局**

`BaseLayout.astro` 应接收 `title` 和 `description`，渲染顶部导航、主内容插槽和页脚。

- [ ] **Step 2: 创建文章布局**

`PostLayout.astro` 应接收文章 frontmatter，渲染封面图、发布日期、标签和正文插槽。

- [ ] **Step 3: 创建文章卡片组件**

`PostCard.astro` 应接收 `post`，显示封面、标题、摘要、日期和标签，并链接到 `/blog/<slug>/`。

- [ ] **Step 4: 创建首页图片拼贴组件**

`PhotoMosaic.astro` 应使用三张占位图组成响应式图片拼贴，并配合首页文案形成“极简图文式”首屏。

- [ ] **Step 5: 创建页面路由**

实现：

```text
src/pages/index.astro
src/pages/blog/index.astro
src/pages/blog/[slug].astro
src/pages/about.astro
```

首页展示最新三篇文章；Blog 列表页展示全部文章；详情页通过 `getStaticPaths` 生成；关于页说明作者写作目的。

- [ ] **Step 6: 创建全局样式**

`global.css` 应包含：

```css
:root {
  color-scheme: light;
  --ink: #202420;
  --muted: #68726b;
  --paper: #f7f7f1;
  --surface: #ffffff;
  --line: #d8ded6;
  --accent: #b4793f;
  --accent-dark: #40564b;
}
```

并覆盖正文排版、导航、图片、卡片、文章页和移动端布局。

- [ ] **Step 7: 创建 SVG 占位图**

三张 SVG 分别表达板材细节、板材堆放和现场环境，文件名与示例文章 frontmatter 一致。

- [ ] **Step 8: 构建验证页面**

Run: `npm run build`

Expected: `astro check` 和 `astro build` 均通过，并生成 `dist`。

- [ ] **Step 9: 提交页面实现**

```bash
git add src public/images
git commit -m "feat: build image-led blog pages"
```

### Task 4: 配置 Decap CMS 后台

**Files:**
- Create: `public/admin/index.html`
- Create: `public/admin/config.yml`
- Create: `public/uploads/.gitkeep`

- [ ] **Step 1: 创建后台入口**

写入 `public/admin/index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>隔热板 Blog 后台</title>
  </head>
  <body>
    <script src="https://unpkg.com/decap-cms@^3.6.0/dist/decap-cms.js"></script>
  </body>
</html>
```

- [ ] **Step 2: 创建 CMS 配置**

写入 `public/admin/config.yml`：

```yaml
backend:
  name: github
  repo: 724027324/724027324.github.io
  branch: main

locale: zh_Hans
media_folder: public/uploads
public_folder: /uploads

collections:
  - name: posts
    label: 文章
    folder: src/content/posts
    create: true
    slug: "{{slug}}"
    extension: md
    format: frontmatter
    fields:
      - { label: 标题, name: title, widget: string }
      - { label: 摘要, name: description, widget: text }
      - { label: 发布日期, name: publishDate, widget: datetime, format: "YYYY-MM-DD" }
      - { label: 封面图片, name: cover, widget: image }
      - { label: 标签, name: tags, widget: list, required: false }
      - { label: 正文, name: body, widget: markdown }
```

- [ ] **Step 3: 保留上传目录**

创建空文件 `public/uploads/.gitkeep`。

- [ ] **Step 4: 检查 CMS 路径**

Run:

```powershell
Test-Path public/admin/index.html
Test-Path public/admin/config.yml
Test-Path public/uploads/.gitkeep
Select-String -Path public/admin/config.yml -Pattern "src/content/posts|public/uploads|/uploads"
```

Expected: 三个 `Test-Path` 输出 `True`，`Select-String` 找到三条路径。

- [ ] **Step 5: 提交 CMS 配置**

```bash
git add public/admin public/uploads
git commit -m "feat: configure Decap CMS admin"
```

### Task 5: 配置 GitHub Pages 部署和中文 README

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

- [ ] **Step 1: 创建部署工作流**

写入 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: 重写 README**

README 应用中文说明：

```markdown
# 隔热板个人 Blog

这是一个使用 Astro、Decap CMS 和 GitHub Pages 搭建的个人 Blog，用来记录隔热板相关的现场经验、材料观察、项目复盘和个人观点。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 内容管理

文章存放在 `src/content/posts`，图片上传目录为 `public/uploads`。

后台入口为 `/admin`。Decap CMS 已配置为使用 GitHub 后端，但正式发布文章前还需要完成 GitHub Pages 与 Decap CMS 所需的身份认证配置。常见做法是配置 Decap CMS 支持的 GitHub OAuth 服务，或部署自己的 OAuth 代理。

## 部署

仓库包含 `.github/workflows/deploy.yml`。在 GitHub 仓库设置中，将 Pages Source 设置为 GitHub Actions，然后推送到 `main` 分支即可触发部署。
```

- [ ] **Step 3: 验证 README 中文说明**

Run: `Select-String -Path README.md -Pattern "后台入口|GitHub Actions|src/content/posts|public/uploads"`

Expected: 找到四个关键说明。

- [ ] **Step 4: 提交部署和文档**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "docs: add deployment and CMS instructions"
```

### Task 6: 最终验证

**Files:**
- Read: all created project files

- [ ] **Step 1: 安装依赖**

Run: `npm install`

Expected: 退出码为 0。

- [ ] **Step 2: 运行构建**

Run: `npm run build`

Expected: `astro check` 和 `astro build` 成功。

- [ ] **Step 3: 启动开发服务器**

Run: `npm run dev -- --port 4321`

Expected: 本地服务启动在 `http://127.0.0.1:4321/`。

- [ ] **Step 4: 检查关键文件**

Run:

```powershell
Test-Path dist/index.html
Test-Path dist/blog/index.html
Test-Path dist/admin/index.html
Test-Path public/admin/config.yml
```

Expected: 全部输出 `True`。

- [ ] **Step 5: 检查 Git 状态**

Run: `git status --short --branch`

Expected: 除 `.superpowers/` 临时视觉稿外，没有未提交的项目代码变更。

---

## 自查结果

- 规格覆盖：计划覆盖首页、Blog 列表、文章详情、关于页、Decap CMS、上传目录、GitHub Pages 部署、README 和验证命令。
- 占位扫描：计划没有遗留占位标记或未定义范围。
- 类型一致性：文章字段统一为 `title`、`description`、`publishDate`、`cover`、`tags` 和 Markdown 正文。
