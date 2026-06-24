# 隔热板个人 Blog

这是一个使用 Astro、Decap CMS 和 GitHub Pages 搭建的个人 Blog，用来记录隔热板相关的现场经验、材料观察、项目复盘和个人观点。

## 本地开发

```bash
npm install
npm run dev
```

开发服务默认运行在 `http://127.0.0.1:4321/`。

## 构建

```bash
npm run build
```

## 内容管理

文章存放在 `src/content/posts`，图片上传目录为 `public/uploads`。

后台入口为 `/admin`。Decap CMS 已配置为使用 GitHub 后端，但正式发布文章前还需要完成 GitHub Pages 与 Decap CMS 所需的身份认证配置。常见做法是配置 Decap CMS 支持的 GitHub OAuth 服务，或部署自己的 OAuth 代理。

## 部署

仓库包含 `.github/workflows/deploy.yml`。在 GitHub 仓库设置中，将 Pages Source 设置为 GitHub Actions，然后推送到 `main` 分支即可触发部署。
