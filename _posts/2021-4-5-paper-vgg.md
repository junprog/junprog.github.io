---
layout: post
permalink: /survey/:title.html
title: Very Deep Convolutional Networks For Large-Scale Image Recognition
category: サーベイ
tags: CV
---
* 表題 ： Very Deep Convolutional Networks For Large-Scale Image Recognition
* 著者 ： Karen Simonyan, Andrew Zisserman
* 出典 ： arXiv, ICLR 2015
* 一行要約 ： CNNの深さに着目して設計することでILSVRCのテストセットにてエラー率top-5 : 6.8%を記録し、ILSVRC-2014にて優勝したCNNモデルの論文。
<!--more-->

## 何をしたか
* CNNの深さに着目し、畳み込み層にてを小さいカーネルのサイズ(3x3)を使用したアーキテクチャの調査。
* (論文がプッシュされた時点で、)今までで最も深い16-19層のCNNの学習を行った。
* ILSVRCのテストセットにてエラー率top-5 : 6.8%を記録し、ILSVRC-2014にて優勝。

## 何が嬉しいか
* 畳み込みのカーネルサイズを小さく設計する事で、学習パラメータ数を小さく抑えてモデルをより深く設計する事が出来た。
* ImageNetで1位になった貢献だけでなく、特徴抽出器として画像分類だけでなく他の様々なタスクへの適応が期待される。

## 手法

### Architecture
RGB画像を224x224で入力する。

全ての畳み込み層で `Conv2D(in_ch, out_ch, kernel_size=(3,3), stirde=(1,1), padding=(1,1))`を使用する。(`Conv2D(in_ch, out_ch, kernel_size=(1,1), stirde=(1,1), padding=(0,0))`を使用するパターンもある。) カーネルサイズが3の畳み込み層では、ストライドを1、パディングを1に設定する事で特徴マップの解像度を入出力で揃えられる。全てのプーリング層で`MaxPool2D(kernel_size=(3,3), stirde=(1,1))`を使用する。

最後は特徴マップを4096チャネルの1次元データに平滑化し、3層の全結合層で分類を行う。AlexNetで使用されるLRNは基本的に使用しない。

### Configurations

|            A           |          A-LRN         |            B           |                  C                  |                  D                  |                         E                        |
|:----------------------:|:----------------------:|:----------------------:|:-----------------------------------:|:-----------------------------------:|:------------------------------------------------:|
|        conv3-64        |     conv3-64<br>LRN    |  conv3-64<br>conv3-64  |         conv3-64<br>conv3-64        |         conv3-64<br>conv3-64        |               conv3-64<br>conv3-64               |
|        max pool        |        max pool        |        max pool        |               max pool              |               max pool              |                     max pool                     |
|        conv3-128       |        conv3-128       | conv3-128<br>conv3-128 |        conv3-128<br>conv3-128       |        conv3-128<br>conv3-128       |              conv3-128<br>conv3-128              |
|        max pool        |        max pool        |        max pool        |               max pool              |               max pool              |                     max pool                     |
| conv3-256<br>conv3-256 | conv3-256<br>conv3-256 | conv3-256<br>conv3-256 | conv3-256<br>conv3-256<br>conv1-256 | conv3-256<br>conv3-256<br>conv3-256 | conv3-256<br>conv3-256<br>conv3-256<br>conv3-256 |
|        max pool        |        max pool        |        max pool        |               max pool              |               max pool              |                     max pool                     |
| conv3-512<br>conv3-512 | conv3-512<br>conv3-512 | conv3-512<br>conv3-512 | conv3-512<br>conv3-512<br>conv1-512 | conv3-512<br>conv3-512<br>conv3-512 | conv3-512<br>conv3-512<br>conv3-512<br>conv3-512 |
|        max pool        |        max pool        |        max pool        |               max pool              |               max pool              |                     max pool                     |
| conv3-512<br>conv3-512 | conv3-512<br>conv3-512 | conv3-512<br>conv3-512 | conv3-512<br>conv3-512<br>conv1-512 | conv3-512<br>conv3-512<br>conv3-512 | conv3-512<br>conv3-512<br>conv3-512<br>conv3-512 |
|        max pool        |        max pool        |        max pool        |               max pool              |               max pool              |                     max pool                     |

* `Linear(4096, 4096)`
* `Linear(4096, 4096)`
* `Linear(4096, 1000) + softmax`

### Discussion




## 実験

## 議論

## 次に読むべき論文
* Deep Residual Learning for Image Recognition [paper link](https://arxiv.org/abs/1512.03385)

## Reference
* Simonyan, Karen, and Andrew Zisserman. "Very deep convolutional networks for large-scale image recognition." arXiv preprint arXiv:1409.1556 (2014).