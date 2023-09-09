---
layout: post
permalink: /blog/:title
title: 2023年版 俺的Python環境構築
category: ブログ
tags: Python セットアップ
---
最近、Python環境について色々検討する場面があったので、そのまとめも兼ねておすすめのPython環境構築手段を紹介します。
<!--more-->

## 結論

Pyenv + Poetry が良い！

## 理由

* Poetry が`PEP 517`に準拠したプロジェクト管理方法を提供している恩恵が大きい。（`pyproject.toml`でプロジェクト管理がなされる）
    * チームでのパッケージ管理がとても楽
    * Pythonパッケージ化がとても楽
    * たぶんPyPI等へのパブリッシングも楽
* Pythonインタプリタ管理するなら、選択肢は Pyenv くらいしかない？（消去法）
* 商用利用する際のことをあまり考えなくてもよい。（対Anaconda）

とにかく、Poetry が優秀ということを伝えたかったです。

## 