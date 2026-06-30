import { promises as fs } from "node:fs";
import { extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const IMAGE_EXTENSIONS = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const root = new URL("../", import.meta.url);
const uploadsDir = new URL("public/uploads/", root);
const manifestPath = new URL("public/uploads-manifest.json", root);

const images = (await listImages(uploadsDir))
  .map((fileUrl) => {
    const relativePath = toPosixPath(relative(fileURLToPath(uploadsDir), fileURLToPath(fileUrl)));
    const publicPath = `/uploads/${relativePath}`;

    return {
      name: relativePath.split("/").pop(),
      path: publicPath,
      thumbnail: publicPath,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

await fs.writeFile(
  manifestPath,
  `${JSON.stringify(
    {
      images,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

async function listImages(directory) {
  let entries;

  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryUrl = new URL(entry.name, directory);

      if (entry.isDirectory()) {
        entryUrl.pathname = `${entryUrl.pathname}/`;
        return listImages(entryUrl);
      }

      if (!entry.isFile() || !IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
        return [];
      }

      return [entryUrl];
    }),
  );

  return files.flat();
}

function toPosixPath(path) {
  return path.replaceAll("\\", "/");
}
