import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postsCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    date: z.date().or(z.string().transform((val: string) => new Date(val))).optional(), // Handle YAML dates (optional because date can be in filename)
    category: z.string().optional(),
    tags: z.string().or(z.array(z.string())).optional().transform((val: string | string[] | undefined) => {
      if (!val) return [];
      if (typeof val === 'string') {
        return val.trim().split(/\s+/);
      }
      return val;
    }), // Handle space-separated tags "tag1 tag2"
    permalink: z.string().optional(),
    layout: z.string().optional(),
  }),
});

export const collections = {
  'posts': postsCollection,
};
