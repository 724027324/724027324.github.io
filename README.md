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

公开网站入口是 `/`，普通访客直接访问公开页面，不需要登录。后台入口是 `/admin`，不会显示在网站导航中；它只给作者管理内容使用。

## 后台登录

Decap CMS 已配置为使用 GitHub 后端。GitHub Pages 是静态托管，不能直接完成 GitHub OAuth 登录，所以后台需要一个 OAuth Proxy。

当前后台配置在 `public/admin/config.yml`：

```yaml
backend:
  name: github
  repo: 724027324/724027324.github.io
  branch: main
  base_url: https://yyb-decap-oauth.YOUR_WORKERS_SUBDOMAIN.workers.dev
  auth_endpoint: /auth
```

你需要先部署一个 GitHub OAuth Proxy，然后把 `base_url` 替换成真实地址。未替换前，后台不能完成 GitHub 登录。

如果后台跳到 `api.netlify.com/auth?...site_id=127.0.0.1` 并显示 `Not Found`，说明 Decap CMS 没有可用的 OAuth Proxy，正在尝试默认 Netlify 认证入口。

部署 OAuth Proxy 后，还需要确认：

- GitHub OAuth App 的 Client ID 和 Client Secret 已配置到 OAuth Proxy。
- GitHub OAuth App 的回调地址指向 OAuth Proxy 的回调地址。
- 登录后台的 GitHub 账号对 `724027324/724027324.github.io` 仓库有写入权限。

## 部署

仓库包含 `.github/workflows/deploy.yml`。在 GitHub 仓库设置中，将 Pages Source 设置为 GitHub Actions，然后推送到 `main` 分支即可触发部署。
