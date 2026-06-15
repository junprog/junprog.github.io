import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const ask = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  console.log('📝 新しいブログ記事のテンプレートを作成します\\n');

  const title = await ask('記事のタイトルを入力してください: ');
  let slug = await ask('ファイル名（半角英数字・ハイフン）を入力してください (例: my-new-post): ');
  
  if (!slug) {
    // スラッグが未入力の場合はランダムな文字列にするかuntitled
    slug = 'untitled-' + Math.floor(Math.random() * 10000);
  } else {
    // 空白などをハイフンに変換
    slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  const category = await ask('カテゴリを入力してください (Enterで "ブログ"): ') || 'ブログ';
  const tags = await ask('タグを入力してください (スペース区切り, 例: tech css): ');

  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const dateString = `${yyyy}-${mm}-${dd}`;

  const filename = `${dateString}-${slug}.md`;
  const outPath = path.join(__dirname, 'src', 'content', 'posts', filename);

  const content = `---
layout: post
permalink: /posts/blog/:title
title: ${title}
category: ${category}
tags: ${tags}
---

<!--more-->
`;

  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`\\n✅ 記事を作成しました！\\n📁 ${outPath}`);
  
  rl.close();
}

main();
