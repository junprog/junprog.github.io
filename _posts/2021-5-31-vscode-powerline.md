---
layout: post
permalink: /blog/:title
title: WindowsのVSCodeのターミナル上でssh先のPowerline-shellを表示させる
category: ブログ
tags: VSCode terminal
---
Windows上のVSCodeでssh先(linux)のターミナルに接続した際に、ssh先でPowerline-shellを導入していたためにVSCode上でフォントがガタガタになってたので、その対処法のメモ。
<!--more-->

## 手順 1

GitHubにある [powerline/fontsリポジトリ](https://github.com/powerline/fonts) よりリポジトリをクローン。

```bash
$ git clone git@github.com:powerline/fonts.git 
```

そして、Powershell上で以下のコマンドを打ち、フォントをインストール。

```bash
$ cd fonts
$ ./install.ps1
```

## 手順 2

VSCodeを起動して、`Ctrl + ,`を押してVSCodeでユーザー設定を開く。

VSCodeのユーザー設定で検査欄に`terminal font`で検索をかける。

すると以下のように出てくる。

![画像1]({{ site.baseurl }}/images/blog-2021-5-31/2021-05-31.png)

この画像のように

* Font Family : `Source Code Pro for Powerline`
* Font Size : おまかせで12～14くらい

と設定。

## 結果

こうなる。

![画像2]({{ site.baseurl }}/images/blog-2021-5-31/2021-05-31-2.png)

## 感想

Windowsのコマンドプロンプト(cmd.exe)上でもPowerline-shell使用したいな...