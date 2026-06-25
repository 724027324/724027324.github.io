import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("Astro blog source files are present", () => {
  [
    "astro.config.mjs",
    "tsconfig.json",
    "src/content/config.ts",
    "src/layouts/BaseLayout.astro",
    "src/layouts/PostLayout.astro",
    "src/components/PostCard.astro",
    "src/components/PhotoMosaic.astro",
    "src/pages/index.astro",
    "src/pages/blog/index.astro",
    "src/pages/blog/[slug].astro",
    "src/pages/admin.astro",
    "src/pages/about.astro",
    "src/styles/global.css",
    "worker/src/oauth-proxy.js",
    "worker/wrangler.toml",
  ].forEach((path) => {
    assert.equal(existsSync(join(root, path)), true, `${path} should exist`);
  });
});

test("content collection defines the expected post fields", () => {
  const config = read("src/content/config.ts");

  ["title", "description", "publishDate", "cover", "tags"].forEach((field) => {
    assert.match(config, new RegExp(`${field}:`));
  });
});

test("Decap CMS manages posts and uploads", () => {
  const cms = read("public/admin/config.yml");
  const adminPage = read("src/pages/admin.astro");

  assert.match(cms, /repo:\s*724027324\/724027324\.github\.io/);
  assert.match(cms, /base_url:\s*https:\/\/yyb-decap-oauth\.YOUR_WORKERS_SUBDOMAIN\.workers\.dev/);
  assert.match(cms, /auth_endpoint:\s*\/auth/);
  assert.match(cms, /folder:\s*src\/content\/posts/);
  assert.match(cms, /media_folder:\s*public\/uploads/);
  assert.match(cms, /public_folder:\s*\/uploads/);
  assert.match(adminPage, /decap-cms/);
  assert.match(adminPage, /is:inline/);
});

test("GitHub Pages workflow builds with npm", () => {
  const workflow = read(".github/workflows/deploy.yml");

  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
});

test("README documents local development, CMS, and deployment", () => {
  const readme = read("README.md");

  ["npm run dev", "npm run build", "npm run worker:deploy", "/admin", "src/content/posts", "public/uploads", "GitHub Actions", "OAuth Proxy", "GitHub OAuth App"].forEach(
    (text) => {
      assert.match(readme, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    },
  );
});

test("OAuth Worker proxies Decap GitHub login", () => {
  const worker = read("worker/src/oauth-proxy.js");
  const wrangler = read("worker/wrangler.toml");
  const packageJson = read("package.json");

  assert.match(worker, /github\.com\/login\/oauth\/authorize/);
  assert.match(worker, /github\.com\/login\/oauth\/access_token/);
  assert.match(worker, /postMessage/);
  assert.match(worker, /authorizing:github/);
  assert.match(worker, /GITHUB_CLIENT_ID/);
  assert.match(worker, /GITHUB_CLIENT_SECRET/);
  assert.match(wrangler, /name\s*=\s*"yyb-decap-oauth"/);
  assert.match(wrangler, /main\s*=\s*"src\/oauth-proxy\.js"/);
  assert.match(packageJson, /worker:deploy/);
});

test("Chinese documents are readable UTF-8 text", () => {
  [
    "README.md",
    "public/admin/config.yml",
    "src/pages/admin.astro",
    "docs/superpowers/specs/2026-06-24-insulation-board-blog-design.md",
    "docs/superpowers/plans/2026-06-24-insulation-board-blog.md",
  ].forEach((path) => {
    assert.doesNotMatch(read(path), /鐨|鍚|涓|杩|鏂|闅|绔/, `${path} should not contain mojibake`);
  });
});

test("public site uses yyb branding and keeps admin out of navigation", () => {
  const oldBrand = "\u9694\u70ed\u677f";
  const publicFiles = [
    "README.md",
    "public/admin/index.html",
    "public/images/placeholder-board-detail.svg",
    "public/images/placeholder-board-stack.svg",
    "public/images/placeholder-worksite.svg",
    "src/components/PhotoMosaic.astro",
    "src/content/posts/field-note-edge-detail.md",
    "src/content/posts/material-observation-surface.md",
    "src/content/posts/project-reflection-first-post.md",
    "src/layouts/BaseLayout.astro",
    "src/pages/about.astro",
    "src/pages/admin.astro",
    "src/pages/blog/index.astro",
    "src/pages/index.astro",
  ];

  publicFiles.forEach((path) => {
    assert.equal(read(path).includes(oldBrand), false, `${path} should use yyb branding`);
  });

  const layout = read("src/layouts/BaseLayout.astro");
  assert.match(layout, /yyb 的 Blog/);
  assert.doesNotMatch(layout, /href="\/admin\/"/);
});
