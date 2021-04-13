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

|            A           |          A-LRN         |            B           |           C          |           D          |           E          |
|:----------------------:|:----------------------:|:----------------------:|:--------------------:|:--------------------:|:--------------------:|
|        conv3-64        |     conv3-64<br>LRN    |  conv3-64<br>conv3-64  | conv3-64<br>conv3-64 | conv3-64<br>conv3-64 | conv3-64<br>conv3-64 |
|        max pool        |        max pool        |        max pool        |       max pool       |       max pool       |       max pool       |
|        conv3-128       |        conv3-128       | conv3-128<br>conv3-128 |                      |                      |                      |
|        max pool        |        max pool        |        max pool        |       max pool       |       max pool       |       max pool       |
| conv3-256<br>conv3-256 | conv3-256<br>conv3-256 | conv3-256<br>conv3-256 |                      |                      |                      |
|        max pool        |        max pool        |        max pool        |       max pool       |       max pool       |       max pool       |
| conv3-512<br>conv3-512 | conv3-512<br>conv3-512 | conv3-512<br>conv3-512 |                      |                      |                      |
|        max pool        |        max pool        |        max pool        |       max pool       |       max pool       |       max pool       |
| conv3-512<br>conv3-512 | conv3-512<br>conv3-512 | conv3-512<br>conv3-512 |                      |                      |                      |
|        max pool        |        max pool        |        max pool        |       max pool       |       max pool       |       max pool       |

## 実験

## 議論

## 次に読むべき論文
* Deep Residual Learning for Image Recognition [paper link](https://arxiv.org/abs/1512.03385)

## Reference
* Simonyan, Karen, and Andrew Zisserman. "Very deep convolutional networks for large-scale image recognition." arXiv preprint arXiv:1409.1556 (2014).