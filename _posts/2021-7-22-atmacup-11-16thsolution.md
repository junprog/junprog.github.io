---
layout: post
permalink: /blog/:title.html
title: 16位解法 (atmaCup#11)
category: ブログ
tags: CV データ分析 コンペ
---
　[atmaCup#11](https://www.guruguru.science/competitions/17) お疲れ様でした！ 今回は 16位 / 614チーム という結果に終わってしまいましたが、とても楽しく競争することが出来たと思います。そんな私の解法と反省点を綴っていこうと思います。
<!--more-->

## コンペについて
　[atmaCup#11](https://www.guruguru.science/competitions/17)は、美術作品の画像やメタデータからその作品がどの時代に作成されたのかを予測するコンペでした。具体的には、美術作品に以下のようなラベルがついています。
* 16世紀以前 (year <= 1600): 0
* 17世紀 (1601 <= year <= 1700): 1
* 18世紀 (1701 <= year <= 1800): 2
* 19世紀以降 (1800 < year): 3

　ある美術作品画像 $$ \mathbf{x} $$ を入力したときに、正しい $$ \{ 0, 1, 2, 3 \} $$ を予測するようなモデル $f$ を構築するのが今回のコンペの目標になります。

　例えば、モナリザであれば1503年から1506年に制作された [1] と言われているらしいので、予測結果は$$ 0 $$になって欲しいモデルを構築するというわけです。

![コンペ]({{ site.baseurl }}/images/blog-2021-7-22/compe.svg)

　モデルの精度を表す評価指標としては、$N$枚ある作品のうち、$n$番目の予測結果 $ y_n=f(\mathbf{x_n}) $ と正解 $\hat{y_n}$ の平均二乗誤差 RMSE が用いられました。

$$ RMSE = \sqrt{\frac{1}{N}\sum_{n=1}^{N}(\hat{y} - y)^{2}} $$

　つまりモナリザであれば、予測し値が0に近ければ近いほど誤差は小さくなり、精度が高くなるということです。

## 解法
　解法としては、正解値を直接回帰するタスクに加えて、materialsとtechniquesをマルチクラスマルチラベル分類タスクとして補助的に解かせるモデルを構築しました。こちらのリンクに実装を公開していますので、ご参照ください。 [16位 解法実装: GitHub link](https://github.com/junprog/atmaCup11)

　今回のコンペの一番の特徴である、外部データの使用禁止(ImageNet pre-trained modelも禁止)というものがありました。そのためディスカッションでは、教師データを使用しない「自己教師あり学習(self supervised learning: SSL)」をはじめとした多くの有意義な情報を共有して頂きました。

### リーダーボードのスコア
* Public:  0.6802
* Private: 0.6686

(※追記 Public: 0.6791 14位 (Private: 0.6693) のサブミッションはViTの3フュージョンモデルとのスコア平均のものでした。)

### モデル
* 2モデルのフュージョン (ResNet34 + EfficinetNet_b0 -> multitask (3 branches MLP))
    * 特徴抽出部分
        * ResNet34 (事前学習: SimSiam -> multitask)
        * EfficinetNet_b0 (事前学習: SimSiam -> multitask)
    * 3 branches MLP (3 branches MLP)
        * 正解値の回帰
        * 素材のマルチクラスマルチラベル分類
        * 技法のマルチクラスマルチラベル分類

### 損失関数
* multi task loss = MSE + material_BCEWithLogits + technique_BCEWithLogits
    * MSE(output1, target: {0, 1, 2, 3})
    * material_BCEWithLogits(output2, materials_class)
    * technique_BCEWithLogits(output3, techniques_class)

* materils_class の作成方法
    * 25種類 -> 最頻クラス上位5クラスピックアップ + 残り20クラスはotherクラス = 6種類
    * materialsが存在しない画像はotherクラス

* techniques_class の作成方法
    * 10種類 -> 最頻クラス上位2クラスピックアップ + 残り8クラスはotherクラス = 3種類
    * techniquesが存在しない画像はotherクラス

### オプティマイザ
* Adam(lr = 0.01)

### 学習時の条件
* StratifiedKFold(k=5)
* Epoch: 400
* Input Size: 256 (推論時はinput size: 352)
* Data Augmentation:
    * RandomResizedCrop
    * RandomHorizontalFlip(p=0.5)

* フュージョンモデルの学習においては特徴抽出部分のパラメータをfreeze

![学習]({{ site.baseurl }}/images/blog-2021-7-22/train.svg)

### 推論時
* 予測結果として用いるのは、3つのブランチの出力の内MSEで損失を最小化していた 1 [ch] の正解値の回帰ブランチの出力のみを使用しました。
* 最終的な予測結果は、CVの5つのfoldの平均値としてサブミッションしました。

## 試したが上手くいかなかったもの
* ViTをSimSiam, MoCo v3で事前学習 -> 3フュージョンモデル

　私自身のViTに対する理解が浅かったため、上手く作用させられなかったのかなと思います。ViTに関しては、上位解法だとDINO [2] と呼ばれる手法で学習してからモデルに組み込むと上手く作用したらしいです。

* NFNetをSimSiamで事前学習 -> 回帰、フュージョンモデル

　これも私自身のNFNetに対する理解が浅かったのが原因であると共に、NFNetは学習が非常に難しかったように思います。以下はNFNet_f0の学習曲線です（笑）

![nfnet]({{ site.baseurl }}/images/blog-2021-7-22/nfnet.png)

* soft labelを利用した回帰
    * MSE で回帰する正解値を以下の関数でスムーズにして回帰

```python
def soft_label(label):
    """
    Args:
        label   --- year (in train datas, min: 1440, max: 1991)
    """
    if 1801 <= label:
        soft = label * 0.002631578947 - 2.239473683

    elif 1600 < label and label < 1801:
        soft = label / 100. - 15.51
    
    elif label <= 1600:
        soft = label * 0.003105590062 - 4.472049689

    return soft
```

![softlabel]({{ site.baseurl }}/images/blog-2021-7-22/soft_label.svg)

　これは、こちらのディスカッション: [Tips: sorting_dateをターゲットのソフトラベルに変換する](https://www.guruguru.science/competitions/17/discussions/000d76a9-fc4b-443e-95f2-5c066c0f3108/) を参考にさせて頂きました。より詳細な回帰を行えば精度が上がると思っていましたが、思うように精度が上がりませんでした。

## 反省点
* 前処理やData Augmentationに関してほぼ何もしていませんでした。
* ResNet34を使用していたが、上位陣が使用していたResNet34dとは別物ということを知らずにコンペを進めてしまいました。
* ViTに対する理解をしっかりと深めて、事前学習方法などをサーチしておくべきでした。　
* SimSiamによる事前学習の有効性の検証をしていませんでした。
* 参加者がディスカッションにあげていた CV の算出方法がよくわかっていませんでした。
* コンペ用のパイプライン構築やconfig.yml等のパラメータ管理をしっかりしていない部分が多かったです。

## あとがき
　今回は画像の認識でありましたが、他にもテーブルやNLPの領域にも踏み入れたいです。そして、これを踏み台に kaggle を頑張っていきたいと思います...！

## Reference
* [1] モナ・リザ [wikipedia](https://ja.wikipedia.org/wiki/%E3%83%A2%E3%83%8A%E3%83%BB%E3%83%AA%E3%82%B6)
* [2] Caron, Mathilde, et al. "Emerging properties in self-supervised vision transformers." arXiv preprint arXiv:2104.14294 (2021). [paper link](https://arxiv.org/abs/2104.14294)