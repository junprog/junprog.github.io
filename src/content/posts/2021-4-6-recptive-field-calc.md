---
layout: post
permalink: /posts/playground/:title
title: Receptive Field 計算機
category: プレイグラウンド
tags: CV
---
<p>
CNNのReceptive Fieldを動的に計算するページ。
</p>
<!--more-->
<script type="text/javascript" src="/scripts/calc_receptive_field.js"></script>
<style type="text/css">
:root {
  --conv-color: #fce4ec;
  --pool-color: #e3f2fd;
  --content-border-color: #e5e7eb;
}
:root[data-theme='dark'],
.dark {
  --conv-color: #3b1c4a;
  --pool-color: #1a3c5e;
  --content-border-color: #4b5563;
}
.center {
text-align: center;
}
.right {
text-align: right;
}
div .conv, div .pool {
display: flex;
align-items: center;
justify-content: space-between;
margin: 0.5rem auto;
width: 100%;
max-width: 650px;
background: var(--conv-color);
border: 1px solid var(--content-border-color);
border-radius: 8px;
font-family: 'Courier New', Courier, monospace;
font-size: 0.9em;
padding: 0.75rem 1rem;
box-shadow: 0 1px 2px rgba(0,0,0,0.05);
color: inherit;
}
div .pool {
background: var(--pool-color);
}
.del-btn {
margin-left: 20px;
/* Reset prose button styles specifically for del-btn to make it small */
padding: 0.25rem 0.5rem !important;
font-size: 0.8em !important;
background-color: #ef4444 !important; /* red-500 */
color: white !important;
border-radius: 0.25rem !important;
}
.del-btn:hover {
background-color: #dc2626 !important; /* red-600 */
}
label {
font-size: 15px;
display: inline-block;
width: 6em;
font-weight: 500;
}
.input-form {
display: inline-block;
font-style: normal;
margin-bottom: 0.5rem;
}
.input-box {
width: 100px;
margin-right: 20px;
}
</style>
<h2>
概要
</h2>
<p>
CNNは階層的に、入力ベクトルがレイヤで何かしらの操作(畳み込みやプーリング)が施され出力ベクトルが作成される構造となっている。出力ベクトルの1要素に影響を与える入力ベクトルの領域は「受容野 (Receptive
Field)」と呼ばれる。
</p>
<h2>
Receptive Fieldの計算方法
</h2>
<p>
各レイヤの出力ベクトルのサイズは以下の式で導出できる。
\[
n_{i} = \left\lfloor \frac{n_{i-1}+2 \times p-k}{s} \right\rfloor + 1
\]
ここで$ n_{i} $は$i$レイヤ目の出力ベクトルサイズ、$ n_{i-1} $はひとつ前のレイヤの出力ベクトルのサイズ($i.e.$ $i$レイヤ目の入力ベクトルサイズ)、$ i
$はレイヤのインデックスを表す。レイヤのパラメータとして、$ p $はパディングサイズ、$ k $はカーネルサイズ、$ s $はカーネルのストライドを表す。
</p>
<p>
受容野を計算するために、ジャンプという概念を導入する。これは次式で表される。
\[
j_{i} = j_{i-1} \times s
\]
ここで$ j_{i} $は$i$レイヤ目のジャンプという意味である。そして、$i$レイヤ目の出力ベクトルの受容野$r_{i}$は以下の式で導出できる。
\[
r_{i} = r_{i-1} + (k-1) \times j_{i-1}
\]
</p>
<h2>
モデル生成
</h2>
<blockquote>
<p>
<div>
<label class="input-form font-medium" for="module">Module : </label>
<select id="module" class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all mr-4">
<option disabled selected>Select Layer Module</option>
<option class="module" value="Conv2d" data-id="conv">Conv2d</option>
<option class="module" value="Pool2d" data-id="pool">Pool2d</option>
</select>
<button class='set bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none' onclick="setDefault();">Set Default</button>
</div>
<div class="mt-4">
<form class="input-form inline-block mr-4 mb-2">
<label for="kernel_size" class="font-medium inline-block w-24">Kernel Size : </label>
<input type="text" id="kernel_size" class="w-24 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
</form>
<form class="input-form inline-block mr-4 mb-2">
<label for="stride" class="font-medium inline-block w-20">Stride : </label>
<input type="text" id="stride" class="w-24 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
</form>
<form class="input-form inline-block mb-2">
<label for="padding" class="font-medium inline-block w-20">Padding : </label>
<input type="text" id="padding" class="w-24 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all">
</form>
<div class="flex justify-end mt-2">
<input type="button" id="addlayer" value="Add Layer" onclick="addLayer();" class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none">
</div>
</div>
</p>
</blockquote>
<blockquote style="border-left: 3px solid #ff662a;">
<p>
<div class="input-form font-medium">
Example :
<input type="button" id="vgg16" value="VGG16" onclick="vgg16();" class="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none">
<input type="button" id="vgg19" value="VGG19" onclick="vgg19();" class="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none">
<input type="button" id="resnet50" value="ResNet50" onclick="resnet50();" class="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none">
</div>
</p>
</blockquote>
<div id="layers" class="center">
</div>
<p class="flex justify-end mt-4">
<input type="button" id="delete-all-layer" value="Delete All Layers" onclick="deleteAllLayers();" class="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none">
</p>
<h2>
順伝播
</h2>
<blockquote>
<p>
<div class="flex items-center justify-between">
<form class="input-form mb-0">
<label for="input_size" class="font-medium inline-block w-24">Input Size : </label>
<input type="text" id="input_size" class="w-24 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" value="224">
</form>
<input type="button" id="calc-output-size" value="Forward" onclick="calcInfo();" class="bg-green-500 hover:bg-green-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none">
</div>
</p>
</blockquote>
<div id="results" class="center" style="overflow-x: auto; display: block;">
</div>
<p class="flex justify-end mt-4">
<input type="button" id="delete-all-results" value="Delete Results" onclick="deleteAllResults();" class="bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-4 rounded-md shadow-sm transition-colors cursor-pointer border-none">
</p>
<h2>使い方</h2>
<p>
<h3>1. モデル生成</h3>
はじめに擬似的にCNNを生成する。ModuleにてConv2D,Pool2Dを選択(Receptive
Fieldの計算には関係しないけど)して、それぞれのカーネルサイズ、ストライド、パディングを整数値で入力し、Addボタンを押していくことでレイヤが追加されていく。
<br>
<br>
※注意 : 生成される各レイヤのDeleteボタンを押すと挙動がおかしくなるかもです。随時修正します...m(_ _)m
<br>
<br>
<h3>2. 順伝播</h3>
CNNを生成した状態で、Input Sizeにて入力サイズを整数で入力し、Forwardボタンを押すことで、各レイヤの入力サイズ、出力サイズ、受容野を出力する。
<br>
<br>
</p>
<h2>Reference</h2>
<ul>
<li>
Receptive Field Arithmetic for Convolutional Neural Networks
<a href="https://rubikscode.net/2020/05/18/receptive-field-arithmetic-for-convolutional-neural-networks/">page
link</a>
</li>
</ul>