import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function listFiles(path) {
  return readdirSync(join(root, path), { withFileTypes: true }).flatMap((entry) => {
    const relativePath = `${path}/${entry.name}`;
    if (entry.isDirectory()) {
      return listFiles(relativePath);
    }
    return relativePath;
  });
}

test("Astro blog source files are present", () => {
  [
    "astro.config.mjs",
    "tsconfig.json",
    "src/content/config.ts",
    "src/content/posts/.gitkeep",
    "public/uploads/.gitkeep",
    "public/admin/multiple-upload.js",
    "src/lib/posts.ts",
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
    "src/data/home.json",
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
  assert.match(cms, /base_url:\s*https:\/\/yyb-decap-oauth\.724027324\.workers\.dev/);
  assert.match(cms, /auth_endpoint:\s*\/auth/);
  assert.match(cms, /folder:\s*src\/content\/posts/);
  assert.match(cms, /media_folder:\s*"?public\/uploads"?/);
  assert.match(cms, /public_folder:\s*"?\/uploads"?/);
  assert.match(cms, /name:\s*site_settings/);
  assert.match(cms, /label:\s*首页设置/);
  assert.match(cms, /file:\s*src\/data\/home\.json/);
  assert.match(cms, /name:\s*showHero/);
  assert.match(cms, /allow_multiple:\s*true/);
  assert.match(cms, /multiple:\s*true/);
  assert.match(adminPage, /decap-cms/);
  assert.match(adminPage, /cms-config-url/);
  assert.match(adminPage, /decap-cms@3\.6\.4/);
  assert.match(adminPage, /multiple-upload\.js/);
  assert.match(adminPage, /is:inline/);
});

test("admin upload button can fan out multiple selected files", () => {
  const uploadPatch = read("public/admin/multiple-upload.js");

  assert.match(uploadPatch, /MutationObserver/);
  assert.match(uploadPatch, /DataTransfer/);
  assert.match(uploadPatch, /input\.multiple = true/);
  assert.match(uploadPatch, /input\.files\.length < 2/);
  assert.match(uploadPatch, /dispatchEvent\(new Event\("change"/);
});

test("home page reads editable hero settings", () => {
  const homeSettings = JSON.parse(read("src/data/home.json"));
  const indexPage = read("src/pages/index.astro");
  const photoMosaic = read("src/components/PhotoMosaic.astro");

  ["showHero", "eyebrow", "title", "description", "primaryButtonLabel", "primaryButtonUrl", "secondaryButtonLabel", "secondaryButtonUrl", "images"].forEach(
    (field) => {
      assert.ok(Object.hasOwn(homeSettings, field), `home settings should include ${field}`);
    },
  );
  assert.equal(typeof homeSettings.showHero, "boolean");
  assert.match(indexPage, /homeSettings/);
  assert.match(indexPage, /homeSettings\.showHero/);
  assert.match(indexPage, /<PhotoMosaic images=\{homeSettings\.images\}/);
  assert.doesNotMatch(photoMosaic, /placeholder-board/);
});

test("empty posts collection builds without loader warnings", () => {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, "run", "build"], {
    cwd: root,
    encoding: "utf8",
  });
  const output = `${result.stdout}\n${result.stderr}`;

  assert.equal(result.status, 0, output);
  assert.doesNotMatch(output, /No files found matching .*src\\content\\posts/);
});

test("new markdown posts generate detail pages", () => {
  const postPath = join(root, "src/content/posts/codex-render-check.md");
  writeFileSync(
    postPath,
    `---\ntitle: 临时渲染检查\ndescription: 用于验证新增文章仍可渲染。\npublishDate: 2026-06-26\ncover: /images/placeholder-worksite.svg\ntags:\n  - 测试\n---\n\n这是一篇临时检查文章。\n`,
    "utf8",
  );

  try {
    const result = spawnSync(process.execPath, [process.env.npm_execpath, "run", "build"], {
      cwd: root,
      encoding: "utf8",
    });
    const output = `${result.stdout}\n${result.stderr}`;

    assert.equal(result.status, 0, output);
    assert.match(output, /blog\/codex-render-check\/index\.html/);
  } finally {
    unlinkSync(postPath);
  }
});

test("content loading uses public Astro APIs", () => {
  const config = read("src/content/config.ts");
  const posts = read("src/lib/posts.ts");
  const readme = read("README.md");

  assert.doesNotMatch(config, new RegExp("entry" + "Types"));
  assert.doesNotMatch(config, /type:\s*"content"/);
  assert.match(posts, /getPosts/);
  assert.doesNotMatch(readme, /\\.worktrees/);
  assert.doesNotMatch(readme, new RegExp(["insulation", "board", "blog"].join("-")));
});

test("empty article lists have an explicit empty state", () => {
  assert.match(read("src/pages/index.astro"), /暂无文章/);
  assert.match(read("src/pages/blog/index.astro"), /暂无文章/);
  assert.match(read("src/styles/global.css"), /\.empty-state/);
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
  assert.match(readme, /https:\/\/yyb-decap-oauth\.724027324\.workers\.dev/);
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
    "docs/superpowers/specs/2026-06-24-yyb-blog-design.md",
    "docs/superpowers/plans/2026-06-24-yyb-blog.md",
  ].forEach((path) => {
    assert.doesNotMatch(read(path), /鐨|鍚|涓|杩|鏂|闅|绔/, `${path} should not contain mojibake`);
  });
});

test("public site uses yyb branding and keeps admin out of navigation", () => {
  const publicFiles = [
    "README.md",
    "public/admin/index.html",
    "public/images/placeholder-board-detail.svg",
    "public/images/placeholder-board-stack.svg",
    "public/images/placeholder-worksite.svg",
    "src/components/PhotoMosaic.astro",
    ...listFiles("src/content/posts").filter((path) => statSync(join(root, path)).isFile()),
    "src/layouts/BaseLayout.astro",
    "src/pages/about.astro",
    "src/pages/admin.astro",
    "src/pages/blog/index.astro",
    "src/pages/index.astro",
  ];

  publicFiles.forEach((path) => {
    assert.doesNotMatch(read(path), new RegExp(["insulation", "board", "blog"].join("-")));
  });

  const layout = read("src/layouts/BaseLayout.astro");
  assert.match(layout, /yyb 的 Blog/);
  assert.doesNotMatch(layout, /href="\/admin\/"/);
});
