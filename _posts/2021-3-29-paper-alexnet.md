---
layout: post
permalink: /survey/:title.html
title: ImageNet Classification with Deep Convolutional Neural Networks.
category: サーベイ
tags: CV
---
* 表題：ImageNet Classification with Deep Convolutional Neural Networks.
* 著者：Alex Krizhevsky, Ilya Sutskever, and Geoffrey E. Hinton.
* 出典：NeurIPS 2012
* 一行要約：ILSVRCのテストセットにてエラー率top-5 : 17.0%, top-1 : 37.5%を記録し、ILSVRC-2012にて優勝したCNNモデルの論文。
<!--more-->

## 何をしたか
* 約1,200,000枚の高画質画像を1,000クラス分類するILSVRCのトレーニングセットをCNNで学習し、テストセットにてエラー率top-5 : 17.0%, top-1 : 37.5%で、従来のSoTA手法を大幅に更新。
* このCNNは60,000,000個の学習パラメータと650,000個のニューロンを含む。
* 学習高速化のために、non-saturating(不飽和?非線形のこと?)ニューロンの使用とGPUによる畳込み操作の実装。
* 過学習抑制のために、dropoutを使用。
* ILSVRC-2012の2位手法と比べて、本モデルはtop-5エラー率26.2%の大差をつけた。

## 何が嬉しいか
* 近年はデータセットの規模が大きなってきており、大きな変動性を持つ現実世界の物体認識のためにはそれらの大規模データセットが必要不可欠である。深さや幅を変化させられるCNNモデルは、表現力を豊かにできデータセットの規模の大きさに対応できるため有効である。
* 純粋なNNよりCNNの方がパラメータ数は少ないので学習しやすい。(しかしパラメータが少ない分理論的にはパフォーマンスは低い。)
* GPUにより、特に畳み込み操作において学習の高速化を図ることもできている。GPUの性能が上がればより大きなデータセットの学習も可能になり認識精度向上に寄与できる。

## 手法
### 1. データセット
* ImageNet
    * 約1500万枚、約22,000クラスを有するデータセット。
* ImageNet Large-Scale Visual Recognition Challenge (ILSVRC)
    * ImageNetのサブセットであり、1,000クラスそれぞれ約1,000枚の画像で構成されたデータセット。
    * 学習データ : 約120万枚、検証用データ : 5万枚、テストデータ : 15万枚。 
* 一般的になされる前処理である同比率で短い辺を256[px]としてリサイズし、中央の256x256[px]をクロップした。
* 各ピクセルに各RGBチャネルの平均を除算する以外の他の前処理は行わなかった。


### 2. モデルのアーキテクチャ

#### 2.1 ReLU Nonlinearity (非線形の活性化関数)
* 非線形の活性化関数にReLUを使用することで、よく使用されるsigmoidやtanhより高速な学習の収束に至った。

#### 2.2 Training on Multiple GPUs
* マルチGPUで学習カーネルを2つのGPUにわけることで高速な演算を可能にした。

#### 2.3 Local Response Normalization (局所応答正規化, LRN)
* 本来ReLUがあれば正規化の必要は無いが、LRNが一般化を補助してくれる。
* 次式で表される正規化であり、カーネル$$ i $$における位置$$(x,y)$$に適応したReLU後の出力を$$ a_{xy}^i $$、正規化後の出力を$$ b_{xy}^i $$で表す。
\begin{align}
b_{xy}^i = \frac{a_{xy}^i}{\displaystyle\left
(k+\alpha\sum_{j=\max(0,i-n/2)}^{\min(N-1,i+n/2)}(a_{xy}^j)^{2}\right)^{\beta}}
\end{align}
* $$ N $$はカーネルの総数、$$ k, n, \alpha, \beta $$はハイパーパラメータでそれぞれ$$ k=2, n=5, \alpha=10^{-4}, \beta=0.75 $$を使用した。
* [PyTorchの実装](https://github.com/pytorch/pytorch/blob/master/torch/nn/functional.py#L2342)は以下の通り。

```python
# Code from https://github.com/pytorch/pytorch/blob/master/torch/nn/functional.py#L2342

def local_response_norm(input: Tensor, size: int, alpha: float = 1e-4, beta: float = 0.75, k: float = 1.0) -> Tensor:
    r"""Applies local response normalization over an input signal composed of
    several input planes, where channels occupy the second dimension.
    Applies normalization across channels.
    See :class:`~torch.nn.LocalResponseNorm` for details.
    """
    if has_torch_function_unary(input):
        return handle_torch_function(local_response_norm, (input,), input, size, alpha=alpha, beta=beta, k=k)
    dim = input.dim()
    if dim < 3:
        raise ValueError(
            "Expected 3D or higher dimensionality \
                         input (got {} dimensions)".format(
                dim
            )
        )
    div = input.mul(input).unsqueeze(1)
    if dim == 3:
        div = pad(div, (0, 0, size // 2, (size - 1) // 2)) 
        div = avg_pool2d(div, (size, 1), stride=1).squeeze(1)
    else:
        sizes = input.size()
        div = div.view(sizes[0], 1, sizes[1], sizes[2], -1)
        div = pad(div, (0, 0, 0, 0, size // 2, (size - 1) // 2))
        div = avg_pool3d(div, (size, 1, 1), stride=1).squeeze(1)
        div = div.view(sizes)
    div = div.mul(alpha).add(k).pow(beta)

    return input / div
```

#### 2.4 Overlapping Pooling (重複プーリング)
プーリングの際にプーリングのカーネルサイズよりカーネルのストライドを小さくすることで、重複プーリングが実現できる。カーネルサイズ=3、カーネルのストライド=2にすることで、top-1, top-5エラー率をそれぞれ0.4%, 0.3%低くすることができた。

#### 2.5 Overall Architecture (アーキテクチャの概要)
* 畳み込み層 × 5
* いくつかの畳み込み層の後にmax-pooling層
* 全結合層 × 3
* 最後に1,000出力のsoftmaxを施す。

### 3. 過学習抑制
#### 3.1 データ水増し
#### 3.2 Dropout

### 4. 学習の詳細
    * オプティマイザとして、Momentum SGDを使用した。

## 実験


## 議論

## 次に読むべき論文


## 参考文献
* Alex Krizhevsky, Ilya Sutskever, and Geoffrey E. Hinton. "Imagenet classification with deep convolutional neural networks." Advances in neural information processing systems 25 (2012): 1097-1105. [paper link](https://dl.acm.org/doi/abs/10.1145/3065386)