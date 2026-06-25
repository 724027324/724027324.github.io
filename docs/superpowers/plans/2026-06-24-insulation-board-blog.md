# yyb 的 Blog 实现计划

> 这份文档记录当前实现方向。后续需要用户确认的文档都使用中文。

## 目标

初始化一个可部署到 GitHub Pages 的 Astro + Decap CMS 个人 Blog，品牌统一为“yyb 的 Blog”。

## 实现范围

- 使用 Astro 构建静态站点。
- 使用 `src/content/posts` 管理 Markdown 文章。
- 使用 `public/uploads` 保存后台上传图片。
- 使用 Decap CMS 提供 `/admin` 后台。
- 使用 GitHub Actions 部署到 GitHub Pages。
- 公共导航只展示“首页 / 文章 / 关于”，不展示后台入口。

## 访问规则

- 普通访客直接访问公开页面，不需要登录。
- 作者手动访问 `/admin` 管理内容。
- `/admin` 使用 GitHub 后端写入仓库，因此需要 GitHub 登录和仓库权限。

## 验证

完成后需要运行：

```bash
npm test
npm run build
```

还需要确认：

- 首页和文章页可以公开访问。
- `/admin` 页面存在并加载 Decap CMS。
- 源码和文档中品牌词统一为“yyb”。
