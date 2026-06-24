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
    "src/pages/about.astro",
    "src/styles/global.css",
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

  assert.match(cms, /repo:\s*724027324\/724027324\.github\.io/);
  assert.match(cms, /folder:\s*src\/content\/posts/);
  assert.match(cms, /media_folder:\s*public\/uploads/);
  assert.match(cms, /public_folder:\s*\/uploads/);
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

  ["npm run dev", "npm run build", "/admin", "src/content/posts", "public/uploads", "GitHub Actions"].forEach(
    (text) => {
      assert.match(readme, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    },
  );
});
