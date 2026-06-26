import { getCollection } from "astro:content";
import { existsSync, promises as fs, type Dirent } from "node:fs";
import { extname, join } from "node:path";
import { pathToFileURL } from "node:url";

const postsDir = pathToFileURL(join(process.cwd(), "src", "content", "posts") + "/");

export async function getPosts() {
  if (!existsSync(postsDir) || (await listMarkdownFiles(postsDir)).length === 0) {
    return [];
  }

  return (await getCollection("posts")).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );
}

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
