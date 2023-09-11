---
layout: post
permalink: /posts/blog/:title
title: junprog.github.io 改造記録#1
category: ブログ
tags: Web terminal
---
本サイトのヘッダーに疑似ターミナルを作ってみました。
<!--more-->

## 疑似ターミナルについて

気づかれたかと思いますが、本サイトのヘッダーに疑似ターミナルを作ってみました。ターミナルといっても javascript の文字列操作くらいしかしてませんが...笑。

現状、できることは `cd` コマンドでサイトのURL移動ができるくらいです。

[Home](https://junprog.github.io/)にも記載していますが、以下のサイトマップをもとに `cd` してみてください。

```
 ~/
 ├ posts/
 │  ├ blog/
 │  │  └ ... 
 │  ├ survey/
 │  │  └ ...
 │  └ playground/
 │     └ ...
 ├ tags/
 └ categories/
```

## 今後について

まだ挙動が少しおかしいところがあります。

e.g) `~/posts/blog/...` で `cd ..` を実行すると `~/posts/blog` でとどまらず `~/posts` まで行ってしまう。

そのあたりを修正できればなと思っています。

加えて、`ls` コマンドやパスの補間など出来たら面白いなと考えています。