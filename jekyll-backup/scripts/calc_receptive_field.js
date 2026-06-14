class Layer {
    constructor(index, module, kernel_size, stride, padding) {
        this.index = index; // 一意の識別子(ID)として使用
        this.module = module;

        this.kernel_size = parseInt(kernel_size, 10);
        this.stride = parseInt(stride, 10);
        this.padding = parseInt(padding, 10);

        this.input_size = 0;
        this.pre_jump = 1;
        this.jump = 1;
        this.pre_rf = 1;
    }

    setInputSize(input_size) {
        this.input_size = input_size;
    }

    setPreJump(pre_jump) {
        this.pre_jump = pre_jump;
        this.jump = this.pre_jump * this.stride;
    }

    setPreReceptiveField(pre_rf) {
        this.pre_rf = pre_rf;
    }

    get output_size() {
        return this.calcOutputSize();
    }

    calcOutputSize() {
        return Math.floor((this.input_size - this.kernel_size + 2 * this.padding) / this.stride) + 1;
    }

    get receptive_field() {
        return this.calcReceptiveField();
    }

    calcReceptiveField() {
        return this.pre_rf + (this.kernel_size - 1) * this.pre_jump;
    }
}

let layers = [];
let global_index = 0;

function addLayer() {
    if (layers.length > 80) {
        alert("too many layers!");
        return;
    }

    const module_el = document.getElementById("module");
    const kernel_size_el = document.getElementById("kernel_size");
    const stride_el = document.getElementById("stride");
    const padding_el = document.getElementById("padding");

    if (!module_el || !kernel_size_el || !stride_el || !padding_el) return;

    let alert_message = "";

    if (module_el.value === "Select Layer Module" || !module_el.value) {
        alert_message += "please select module\n";
    }
    if (kernel_size_el.value === "") {
        alert_message += "please input kernel size\n";
    }
    if (stride_el.value === "") {
        alert_message += "please input stride\n";
    }
    if (padding_el.value === "") {
        alert_message += "please input padding\n";
    }

    if (alert_message !== "") {
        alert(alert_message);
        return;
    }

    const l = new Layer(global_index, module_el.value, kernel_size_el.value, stride_el.value, padding_el.value);
    layers.push(l);

    createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
    global_index++;
}

function createLayerBlock(index, module, kernel_size, stride, padding) {
    const layers_div_el = document.getElementById("layers");
    if (!layers_div_el) return;

    const layer_block = document.createElement("div");
    if (module === "Conv2d") {
        layer_block.classList.add("conv");
    } else if (module === "Pool2d" || module === "gap") {
        layer_block.classList.add("pool");
    }

    layer_block.id = "layer-block-" + index;

    // ブロック内の文字
    let layer_info = "";
    if (module === "gap") {
        layer_info = `${index}: ${module}( adaptive )`;
    } else {
        layer_info = `${index}: ${module}(kernel_size=(${kernel_size},${kernel_size}), stride=(${stride},${stride}), padding=(${padding},${padding}))`;
    }
    
    const textNode = document.createTextNode(layer_info);
    layer_block.appendChild(textNode);

    const del_btn = document.createElement("input");
    del_btn.classList.add("del-btn");
    del_btn.type = "button";
    del_btn.value = "Delete";
    del_btn.onclick = () => {
        deleteLayer(index);
    };
    layer_block.appendChild(del_btn);

    layers_div_el.appendChild(layer_block);
}

function deleteLayer(index) {
    const layer_el = document.getElementById("layer-block-" + index);
    if (layer_el) {
        layer_el.remove();
    }
    // インデックスではなく、オブジェクトのindexプロパティ(一意ID)でフィルタリングする
    layers = layers.filter(l => l.index !== index);
}

function deleteAllLayers() {
    const layers_el = document.getElementById("layers");
    if (layers_el) {
        while (layers_el.firstChild) {
            layers_el.removeChild(layers_el.firstChild);
        }
    }
    layers = [];
    global_index = 0;
}

function deleteAllResults() {
    const results_el = document.getElementById("results");
    if (results_el) {
        while (results_el.firstChild) {
            results_el.removeChild(results_el.firstChild);
        }
    }
}

function calcInfo() {
    const input_size_el = document.getElementById("input_size");
    if (!input_size_el) return;
    
    let input_size = parseInt(input_size_el.value, 10);
    const results_div_el = document.getElementById("results");
    if (!results_div_el) return;

    // 一旦結果をクリア
    deleteAllResults();

    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];

        // GAP の場合、直前レイヤの出力サイズを kernel_size に自動設定する
        if (layer.module === "gap") {
            if (i > 0) {
                layer.kernel_size = layers[i - 1].output_size;
            } else {
                layer.kernel_size = input_size; // 直前がない場合は現在の入力サイズ
            }
            layer.stride = 1;
            layer.padding = 0;
        }

        // 入力サイズ指定
        layer.setInputSize(input_size);

        // ジャンプ計算 & 前レイヤのRF指定
        if (i === 0) {
            layer.setPreJump(1);
            layer.setPreReceptiveField(1);
        } else {
            layer.setPreJump(layers[i - 1].jump);
            layer.setPreReceptiveField(layers[i - 1].receptive_field);
        }

        // 結果ブロックの作成
        const result_block = document.createElement("div");
        if (layer.module === "Conv2d") {
            result_block.classList.add("conv");
        } else {
            result_block.classList.add("pool"); // Pool2d または gap
        }

        // ブロック内の文字
        let result_info = "";
        if (layer.module === "gap") {
            result_info = `${layer.index}: ${layer.module}( kernel_size=${layer.kernel_size} ) input_size=${layer.input_size}, output_size=${layer.output_size}, receptive_field=${layer.receptive_field}`;
        } else {
            result_info = `${layer.index}: ${layer.module} input_size=${layer.input_size}, output_size=${layer.output_size}, receptive_field=${layer.receptive_field}`;
        }

        const textNode = document.createTextNode(result_info);
        result_block.appendChild(textNode);
        results_div_el.appendChild(result_block);

        input_size = layer.output_size;
    }
}

function setDefault() {
    const module_el = document.getElementById("module");
    const kernel_size_el = document.getElementById("kernel_size");
    const stride_el = document.getElementById("stride");
    const padding_el = document.getElementById("padding");

    if (!module_el || !kernel_size_el || !stride_el || !padding_el) return;

    if (module_el.value === "Conv2d") {
        kernel_size_el.value = 3;
        stride_el.value = 1;
        padding_el.value = 1;
    } else if (module_el.value === "Pool2d") {
        kernel_size_el.value = 2;
        stride_el.value = 2;
        padding_el.value = 0;
    }
}

function vgg16() {
    deleteAllLayers();

    const vgg16_params = {
        "index": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        "module": ["Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d"],
        "kernel_size": [3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 2],
        "stride": [1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2], 
        "padding": [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0]
    };

    for (let i = 0; i < vgg16_params["index"].length; i++) {
        const l = new Layer(vgg16_params["index"][i], vgg16_params["module"][i], vgg16_params["kernel_size"][i], vgg16_params["stride"][i], vgg16_params["padding"][i]);
        layers.push(l);
        createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
        global_index++;
    }
}

function vgg19() {
    deleteAllLayers();

    const vgg19_params = {
        "index": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        "module": ["Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d"],
        "kernel_size": [3, 3, 2, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2],
        "stride": [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2], 
        "padding": [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0]
    };

    for (let i = 0; i < vgg19_params["index"].length; i++) {
        const l = new Layer(vgg19_params["index"][i], vgg19_params["module"][i], vgg19_params["kernel_size"][i], vgg19_params["stride"][i], vgg19_params["padding"][i]);
        layers.push(l);
        createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
        global_index++;
    }
}

function resnet50() {
    deleteAllLayers();
    const num_blocks = [3, 4, 6, 3];

    const bottleneck_block_params = {
        "module": ["Conv2d", "Conv2d", "Conv2d"],
        "kernel_size": [1, 3, 1],
        "stride": [1, 1, 1],
        "padding": [0, 1, 0]
    };

    const downsample_bottleneck_block_params = {
        "module": ["Conv2d", "Conv2d", "Conv2d"],
        "kernel_size": [1, 3, 1],
        "stride": [1, 2, 1],
        "padding": [0, 1, 0]
    };

    const resnet50_params = {
        "module": ["Conv2d", "Pool2d", "blocks", "blocks", "blocks", "blocks", "gap"],
        "kernel_size": [7, 3, "blocks", "blocks", "blocks", "blocks", "gap"],
        "stride": [2, 2, "blocks", "blocks", "blocks", "blocks", "gap"],
        "padding": [3, 1, "blocks", "blocks", "blocks", "blocks", "gap"]
    };

    let block_cnt = 0;
    for (let i = 0; i < resnet50_params["module"].length; i++) {
        const module_type = resnet50_params["module"][i];

        if (module_type === "blocks") {
            const layers_div_el = document.getElementById("layers");
            if (layers_div_el) {
                // セパレータブロックを追加 (見た目用)
                const layer_block = document.createElement("div");
                layer_block.id = `layer-block-separator-layer-${block_cnt}`;
                const text1 = document.createTextNode("--- layer-" + block_cnt + " ---");
                layer_block.appendChild(text1);
                layers_div_el.appendChild(layer_block);
            }

            for (let b = 0; b < num_blocks[block_cnt]; b++) {
                const layers_div_el = document.getElementById("layers");
                if (layers_div_el) {
                    // セパレータブロックを追加 (見た目用)
                    const layer_block = document.createElement("div");
                    layer_block.id = `layer-block-separator-block-${block_cnt}-${b}`;
                    const text1 = document.createTextNode("--- block-" + b + " ---");
                    layer_block.appendChild(text1);
                    layers_div_el.appendChild(layer_block);
                }

                // Block の中身
                for (let j = 0; j < bottleneck_block_params["module"].length; j++) {
                    let l;
                    if (block_cnt === 0) {
                        l = new Layer(global_index, bottleneck_block_params["module"][j], bottleneck_block_params["kernel_size"][j], bottleneck_block_params["stride"][j], bottleneck_block_params["padding"][j]);
                    } else {
                        if (b === 0) {
                            l = new Layer(global_index, downsample_bottleneck_block_params["module"][j], downsample_bottleneck_block_params["kernel_size"][j], downsample_bottleneck_block_params["stride"][j], downsample_bottleneck_block_params["padding"][j]);
                        } else {
                            l = new Layer(global_index, bottleneck_block_params["module"][j], bottleneck_block_params["kernel_size"][j], bottleneck_block_params["stride"][j], bottleneck_block_params["padding"][j]);
                        }
                    }
                    layers.push(l);
                    createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
                    global_index++;
                }
            }
            block_cnt++;

        } else if (module_type === "gap") {
            const l = new Layer(global_index, resnet50_params["module"][i], resnet50_params["kernel_size"][i], resnet50_params["stride"][i], resnet50_params["padding"][i]);
            layers.push(l);
            createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
            global_index++;
        } else {
            const l = new Layer(global_index, resnet50_params["module"][i], resnet50_params["kernel_size"][i], resnet50_params["stride"][i], resnet50_params["padding"][i]);
            layers.push(l);
            createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
            global_index++;
        }
    }
}