Dockerを使用してローカルでjekyllを実行するためのメモ
==
0. 本リポジトリをクローンする。
```bash
$ git clone git@github.com:junprog/junprog.github.io.git
```

1. 適当に新しいディレクトリ `new_blog` を作成し、jekyllをイニシャライズする。

```bash
$ mkdir new_blog
$ cd new_blog
$ export JEKYLL_VERSION=latest
$ docker run --rm --volume="$PWD:/srv/jekyll" \
  -it jekyll/jekyll:$JEKYLL_VERSION jekyll new .
```

2. `new_blog` 内にあるGemfileを本リポジトリ内にコピーする。

```bash
$ cp new_blog/Gemfile junprog.github.io
```

3. コンテナを作成し、ローカルホスト(PORT:4000)でサーバーを建てる。

```bash
$ export DOCKER_IMAGE=jekyll-app
$ export DOCKER_CONTAINER=jekyll-app
$ docker build -t ${DOCKER_IMAGE} .
$ docker run -it --rm -v ${PWD}:/usr/src/app \
    --name ${DOCKER_CONTAINER} -p 4000:4000 \
    ${DOCKER_IMAGE} bundle exec jekyll serve --host 0.0.0.0
```

間違ってるかも。