# yyb 的 Blog

这是一个使用 Astro、Decap CMS 和 GitHub Pages 搭建的个人 Blog，用来记录 yyb 相关的现场经验、材料观察、项目复盘和个人观点。

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

公开网站入口是 `/`，普通访客直接访问公开页面，不需要登录。后台入口是 `/admin`，不会显示在网站导航中；它只给作者管理内容使用。Decap CMS 已配置为使用 GitHub 后端，因此进入后台发布文章或上传图片时需要 GitHub 登录和对应仓库权限。

## 部署

仓库包含 `.github/workflows/deploy.yml`。在 GitHub 仓库设置中，将 Pages Source 设置为 GitHub Actions，然后推送到 `main` 分支即可触发部署。
