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

全ての畳み込み層で `Conv2D(in_ch, out_ch, kernel_size=(3,3), stirde=(1,1), padding=(1,1))`を使用する。(`Conv2D(in_ch, out_ch, kernel_size=(1,1), stirde=(1,1), padding=(0,0))`を使用するパターンもある。) カーネルサイズが3の畳み込み層では、ストライドを1、パディングを1に設定する事で特徴マップの解像度を入出力で揃えられる。全てのプーリング層で`MaxPool2D(kernel_size=(2,2), stirde=(2,2))`を使用する。

最後は特徴マップを4096チャネルの1次元データに平滑化し、3層の全結合層で分類を行う。AlexNetで使用されるLRNは基本的に使用しない。

### Configurations

* features

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

* classifier
    * `Linear(4096, 4096)`
    * `Linear(4096, 4096)`
    * `Linear(4096, 1000) + softmax`

### Discussion

* VGGでは、AlexNet (Krizhevsky+, 2012) のーネルサイズ11x11の畳み込み層やZFNet (Zeiler & Fergus, 2013) のカーネルサイズ7x7の畳み込み層のような比較的大きなカーネルサイズの畳み込みは行わず、畳み込み層のカーネルサイズは全て3x3である。
* なぜ3x3の畳み込み層をたくさん使うのか
    1. 7x7畳み込み と 3x3畳み込みx3 は、両方とも同じ受容野を持つが、後者の方が複数の非線形層によりモデルの表現力が高い。
    2. 7x7畳み込み と 3x3畳み込みx3 は、パラメータ数が前者は $ 7^{2} \times C_\mathrm{in} \times C_\mathrm{out} = 49 \times C_\mathrm{in} \times C_\mathrm{out} $ に対して、後者は　$ 3 \times ( 3^{2} \times C_\mathrm{in} \times C_\mathrm{out} ) = 27 \times C_\mathrm{in} \times C_\mathrm{out} $ と削減できる。
* Configrationsの C で使用される1x1畳み込みは受容野を広げることなく非線形性を上げることができる。
* 小さいカーネルサイズの畳み込み層は、(Goodfellow+, 2014) で街路番号認識で良い結果をもたらしている。
* 小さいカーネルサイズの畳み込み層は既存手法でもよく使われているが、 (Ciresan+, 2011) は浅いモデルであり、GoogleNet (Szegedy+, 2014) は複雑性が高く、最初のレイヤで一気に高さx幅の解像度を下げる。VGGはGoogleNetよりも精度が高い。

### Training

* Configrationsの A から学習を始め、そのパラメータでより深いモデルのパラメータを初期化する。それ以外のパラメータのウェイト：$ \mathbf{w}の各要素 w $ 、バイアス：$ b $は、 $ w \sim \mathcal{N}( \mu = 0, \sigma = 0.1), b = 0 $ と初期化する。
* AugumentationはAlexNetの手法を使用する。
* 加えてAumgumentationでスケーリングに関する手法を2つ提案する。まず高さx幅を等方的にスケーリングするための画像の短い方の長さを $ S $ とする。
    1. $ S $を固定して学習させる手法。
        * 本稿では、まず$S = 256$に設定し学習を行う。
        * 次に上記で学習したパラメータをそのまま使用して、$S=384$に設定し学習を行う。
    2. $ S $の範囲を決めその範囲内からランダムに$S$をサンプリングし、同一画像でスケールを変動させて学習させる手法。

### Test

* テスト時には高さx幅を等方的にスケーリングするための画像の短い方の長さを $ Q $ とし、テスト画像に対してスケーリングを行う。(これは$ S $と同じ値であるとは限らない。)
* テスト時に入力する画像はマルチクロップと左右反転した画像を用いて、最後のsoftmax層の出力を平均したスコアを使用する。

## 実験

### Single-scale evaluation

| Configurations | train($S$) | test($Q$) | Val Err@1 | Val Err@5 |
|----------------|------------|-----------|-----------|-----------|
| A              | 256        | 256       | 29.6      | 10.4      |
| A-LRN          | 256        | 256       | 29.7      | 10.5      |
| B              | 256        | 256       | 28.7      | 9.9       |
| C              | 256        | 256       | 28.1      | 9.4       |
| C              | 384        | 384       | 28.1      | 9.3       |
| C              | [256;512]  | 384       | 27.3      | 8.8       |
| D              | 256        | 256       | 27.0      | 8.8       |
| D              | 384        | 384       | 26.8      | 8.7       |
| D              | [256;512]  | [256;512] | 25.6      | 8.1       |
| E              | 256        | 256       | 27.3      | 9.0       |
| E              | 384        | 384       | 26.9      | 8.7       |
| E              | [256;512]  | [256;512] | 25.5      | 8.0       |

### Multi-scale evaluation

| Configurations | train($S$) | test($Q$)     | Val Err@1 | Val Err@5 |
|----------------|------------|---------------|-----------|-----------|
| B              | 256        | 224, 256, 288 | 28.7      | 9.9       |
| C              | 256        | 224, 256, 288 | 28.1      | 9.4       |
| C              | 384        | 352, 384, 416 | 28.1      | 9.3       |
| C              | [256;512]  | 256, 384, 512 | 27.3      | 8.8       |
| D              | 256        | 224, 256, 288 | 27.0      | 8.8       |
| D              | 384        | 352, 384, 416 | 26.8      | 8.7       |
| D              | [256;512]  | 256, 384, 512 | 25.6      | 8.1       |
| E              | 256        | 224, 256, 288 | 27.3      | 9.0       |
| E              | 384        | 352, 384, 416 | 26.9      | 8.7       |
| E              | [256;512]  | 256, 384, 512 | 25.5      | 8.0       |

### Multi-crop evaluation

| Configurations | Eval method        | Val Err@1 | Val Err@5 |
|----------------|--------------------|-----------|-----------|
| D              | dense              | 24.8      | 7.5       |
| D              | multi-crop         | 24.6      | 7.5       |
| D              | multi-crop & dense | 24.2      | 7.2       |
| E              | dense              | 24.8      | 7.5       |
| E              | multi-crop         | 24.6      | 7.4       |
| E              | multi-crop & dense | 24.4      | 7.1       |

### Convnets fusion

* Convnets fusionは単純にsoftmaxスコアを平均したものである。

| Combined ConvNet models                                                                                                                                                                         | Val Err@1 | Val Err@5 | Test Err@5 |
|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|-----------|------------|
| (D/256/224,256,288)<br>(D/384/352,384,416)<br>(D/[256;512]/256,384,512)<br><br>(C/256/224,256,288)<br>(C/384/352,384,416)<br><br>(E/256/224,256,288) <br>(E/384/352,384,416)<br>submitted model | 24.7      | 7.5       | 7.3        |
| (D/[256;512]/256,384,512)<br>(E/[256;512]/256,384,512)<br>multi-crop & dense                                                                                                                    | 23.7      | 6.8       | 6.8        |

## 議論

* 単純なモデルであるが徐々に小さいモデルから学習させていきそのパラメータを深いモデルのパラメータに使用させる方法は、他のモデルの精度向上にも役立てられるかも。
* VGGは現在でも多くの特徴抽出器として利用している。ときにはResNetよりもよい特徴を抽出できるときもある。

## 次に読むべき論文
* Deep Residual Learning for Image Recognition [paper link](https://arxiv.org/abs/1512.03385)

## Reference
* Simonyan, Karen, and Andrew Zisserman. "Very deep convolutional networks for large-scale image recognition." arXiv preprint arXiv:1409.1556 (2014). [paper link](https://arxiv.org/abs/1409.1556)
* (Krizhevsky+, 2012) Alex Krizhevsky, Ilya Sutskever, and Geoffrey E. Hinton. "Imagenet classification with deep convolutional neural networks." Advances in neural information processing systems 25 (2012): 1097-1105. [paper link](https://dl.acm.org/doi/abs/10.1145/3065386)
* (Zeiler & Fergus, 2013) Zeiler, M. D. and Fergus, R. Visualizing and understanding convolutional networks. CoRR, abs/1311.2901, 2013. Published in Proc. ECCV, 2014. [paper link](https://arxiv.org/abs/1311.2901)
* (Goodfellow+, 2014) Goodfellow, Ian J., et al. "Multi-digit number recognition from street view imagery using deep convolutional neural networks." arXiv preprint arXiv:1312.6082 (2013). [paper link](https://arxiv.org/abs/1312.6082)
* (Ciresan+, 2011) Ciresan, D. C., Meier, U., Masci, J., Gambardella, L. M., and Schmidhuber, J. Flexible, high performance convolutional neural networks for image classification. In IJCAI, pp. 1237–1242, 2011. [paper link](https://www.semanticscholar.org/paper/Flexible%2C-High-Performance-Convolutional-Neural-for-Ciresan-Meier/5a47ba057a858f8c024d2518cc3731fc7eb40de1)
* (Szegedy+, 2014) Szegedy, C., Liu, W., Jia, Y., Sermanet, P., Reed, S., Anguelov, D., Erhan, D., Vanhoucke, V., and Rabinovich, A. Going deeper with convolutions. CoRR, abs/1409.4842, 2014. [paper link](https://arxiv.org/abs/1409.4842)
