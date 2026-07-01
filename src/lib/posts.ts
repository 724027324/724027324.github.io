import { getCollection } from "astro:content";

export async function getPosts() {
  return (await getCollection("posts")).sort(
    (a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime(),
  );
}

export async function getArticles() {
  return (await getPosts()).filter((post) => post.data.type === "article");
}

export async function getPortfolioItems() {
  return (await getPosts()).filter((post) => post.data.type === "portfolio");
}
