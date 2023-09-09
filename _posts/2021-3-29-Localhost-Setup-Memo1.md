---
layout: post
permalink: /blog/:title
title: Docker を使ってローカルで Jekyll を動かす
category: ブログ
tags: Docker Jekyll
---
GitHub Pages に反映させたい変更を、わざわざ GitHub のリポジトリに push して変更を確認するのは面倒くさい。そこで、 Docker を使用してローカル環境にて変更を瞬時に確認できるようにするため、本メモを残す。

<!--more-->
前提環境として以下を挙げる。
* git
* Docker
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

私自身 Docker の知識が浅はかなため、上記の Dockerfile の記述で改善すべき点があればご教授願いたい...

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
逆になぜ Windows + WSL + Docker だと出来ないのだろう。

### <追記 2021/3/31>

どうやら WSL 上では、`Auto-regeneration`という機能がうまく作動しない問題があるらしい。確かに以下の警告が出ていた。

```bash
Auto-regeneration may not work on some Windows versions.
Please see: https://github.com/Microsoft/BashOnWindows/issues/216
If it does not work, please upgrade Bash on Windows or run Jekyll with --no-watch.
```

解決策として、[こちらの issue コメント](https://github.com/microsoft/WSL/issues/216#issuecomment-756424551)を参考にさせていただいた。 コンテナ実行の際に`--force_polling`をつけるとうまく作動した。

 WSL とそれ以外に場合分けした実行コマンドを以下の shell script に実装したので参考までに。

 ```bash
#!bin/bash

DOCKER_IMAGE=jekyll-app
DOCKER_CONTAINER=jekyll-app

if [ -f /proc/sys/fs/binfmt_misc/WSLInterop ]; then
    echo "On WSL"
    if [ "$(docker image ls -q "${DOCKER_IMAGE}")" ]; then
        echo "Docker image : ${DOCKER_IMAGE} is already existed."
        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --force_polling --host 0.0.0.0
    else
        echo "Create docker image : ${DOCKER_IMAGE}"
        docker build -t ${DOCKER_IMAGE} .
        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --force_polling --host 0.0.0.0
    fi
else
    echo "On not WSL"
    if [ "$(docker image ls -q "${DOCKER_IMAGE}")" ]; then
        echo "Docker image : ${DOCKER_IMAGE} is already existed."
        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --host 0.0.0.0
    else
        echo "Create docker image : ${DOCKER_IMAGE}"
        docker build -t ${DOCKER_IMAGE} .
        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --host 0.0.0.0
    fi
fi
 ```