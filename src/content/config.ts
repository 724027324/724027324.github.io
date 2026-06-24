import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    cover: z.string(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { posts };
