export const CATEGORY_MAP: Record<string, string> = {
  "ブログ": "blog",
  "サーベイ": "survey",
  "プレイグラウンド": "playground"
};

export function getPostDate(post: any): Date {
  if (post.data.date) {
    return new Date(post.data.date);
  }
  // Try to parse from filename/id (e.g. 2021-3-27-Code-Memo1.md)
  const filename = post.id;
  const match = filename.match(/^(\d{4}-\d{1,2}-\d{1,2})[-_]/);
  if (match) {
    return new Date(match[1]);
  }
  return new Date();
}

export function getPostUrl(post: any): string {
  const filename = post.id.replace(/\.[^/.]+$/, "");
  const match = filename.match(/^\d{4}-\d{1,2}-\d{1,2}-(.*)$/);
  const slugWithoutDate = match ? match[1] : filename;
  const rawCategory = post.data.category || "ブログ";
  const categoryUrl = CATEGORY_MAP[rawCategory] || "blog";
  return `/posts/${categoryUrl}/${slugWithoutDate}`;
}

export function sortPostsDesc(posts: any[]): any[] {
  return [...posts].sort((a, b) => getPostDate(b).getTime() - getPostDate(a).getTime());
}
