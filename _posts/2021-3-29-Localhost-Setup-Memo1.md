---
layout: post
permalink: /blog/:title.html
title: docker を使用してローカルで Jekyll を動かすためのメモ
category: メモ
tags: docker Jekyll
---
GitHub Pages に反映させたい変更を、わざわざ GitHub のリポジトリに push して変更を確認するのは面倒くさい。そこで、 docker を使用してローカル環境にて変更を確認するため、本メモを残す。

<!--more-->
前提環境として以下を挙げる。
* git
* docker
* Jekyllサイトのテンプレートが一色揃っている GitHub リポジトリ

もし Jekyll サイトのテンプレートが一色揃っている GitHub リポジトリが無い場合は [jekyll-now](https://github.com/barryclark/jekyll-now) を fork して、ローカルに clone してみてはいかがだろう。（私自身こちらを使用させて頂いた。）

## 1.  GitHub リポジトリをクローンする。

username.github.io というリポジトリの場合、以下のコマンドで clone する。

```bash
$ git clone git@github.com:username/username.github.io.git
```

## 2. クローンしてきたリポジトリ内に以下の Dockerfile を作成する。

```Dockerfile
FROM ruby:latest

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN bundle install

CMD ["/bin/bash"]
```

私自身 docker の知識が浅はかなため、上記の Dockerfile の記述で改善すべき点があればご教授願いたい...

## 3. コンテナを作成し、ローカルホスト(PORT:4000)でサーバーを建てる。

```bash
$ export DOCKER_IMAGE=jekyll-app
$ export DOCKER_CONTAINER=jekyll-app
$ docker build -t ${DOCKER_IMAGE} .
$ docker run -it --rm -v ${PWD}:/usr/src/app \
    --name ${DOCKER_CONTAINER} -p 4000:4000 \
    ${DOCKER_IMAGE} bundle exec jekyll serve --future --host 0.0.0.0
```

## 4. ブラウザで確認してみる。

ブラウザにて [`localhost:4000`](localhost:4000) で確認できる。

## 感想

Ubuntu 環境だとリアルタイムで変更を加えながら確認が行えた。なぜだろう。
逆になぜ Windows + WSL2 + docker だと出来ないのだろう。