import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sortPostsDesc, getPostUrl } from '../utils/post';

export const GET: APIRoute = async () => {
  const posts = await getCollection('posts');
  const sorted = sortPostsDesc(posts);

  const data = sorted.map(post => {
    return {
      title: post.data.title,
      url: getPostUrl(post),
      category: post.data.category || "ブログ",
      filename: post.id
    };
  });

  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json; charset=utf-8'
    }
  });
};
export const prerender = true; // Output static JSON file at build time
