import { defineCollection, z } from "astro:content";
import type { Loader } from "astro/loaders";
import matter from "gray-matter";
import { existsSync, promises as fs, type Dirent } from "node:fs";
import { extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const postsMarkdownLoader: Loader = {
  name: "posts-markdown-loader",
  async load({ config, parseData, store, generateDigest, renderMarkdown }) {
    const contentDir = new URL("content/posts/", config.srcDir);
    const previousIds = new Set(store.keys());

    if (!existsSync(contentDir)) {
      previousIds.forEach((id) => store.delete(id));
      return;
    }

    for (const fileUrl of await listMarkdownFiles(contentDir)) {
      const contents = await fs.readFile(fileUrl, "utf8");
      const { content, data } = matter(contents);
      const filePath = fileURLToPath(fileUrl);
      const id = toPosixPath(relative(fileURLToPath(contentDir), filePath)).replace(/\.md$/, "");
      const digest = generateDigest(contents);
      const parsedData = await parseData({
        id,
        data,
        filePath,
      });
      const rendered = await renderMarkdown(content);

      store.set({
        id,
        data: parsedData,
        body: content,
        filePath: toPosixPath(relative(fileURLToPath(config.root), filePath)),
        digest,
        rendered,
        assetImports: rendered.metadata?.imagePaths,
      });
      previousIds.delete(id);
    }

    previousIds.forEach((id) => store.delete(id));
  },
};

const posts = defineCollection({
  loader: postsMarkdownLoader,
  schema: z.object({
    type: z.enum(["article", "portfolio"]).default("article"),
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    cover: z.string(),
    tags: z.array(z.string()).default([]),
    gallery: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };

async function listMarkdownFiles(directory: URL): Promise<URL[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry: Dirent) => {
      const entryUrl = new URL(entry.name, directory);

      if (entry.isDirectory()) {
        entryUrl.pathname = `${entryUrl.pathname}/`;
        return listMarkdownFiles(entryUrl);
      }

      return entry.isFile() && extname(entry.name) === ".md" ? [entryUrl] : [];
    }),
  );

  return files.flat();
}

function toPosixPath(path: string) {
  return path.replaceAll("\\", "/");
}
