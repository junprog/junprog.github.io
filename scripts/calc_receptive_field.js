class Layer {
    constructor(index, module, kernel_size, stride, padding) {
        this.index = index;
        this.module = module

        this.kernel_size = parseInt(kernel_size, 10);
        this.stride = parseInt(stride, 10);
        this.padding = parseInt(padding, 10);
    }

    setInputSize(input_size) {
        this.input_size = input_size
    }

    setPreJump(pre_jump) {
        this.pre_jump = pre_jump
        this.jump = this.pre_jump * this.stride
    }

    setPreReceptiveField(pre_rf) {
        this.pre_rf = pre_rf
    }

    get output_size() {
        return this.calcOutputSize();
    }

    calcOutputSize() {
        return (Math.floor((this.input_size - this.kernel_size + 2 * this.padding) / this.stride) + 1);
    }

    get receptive_field() {
        return this.calcReceptiveField();
    }

    calcReceptiveField() {
        return (this.pre_rf + (this.kernel_size - 1) * this.pre_jump);
    }
}

let layers = [];
let global_index = 0;

function addLayer() {
    if (layers.length > 80) {
        alert("too many layers!")
    } else {
        // htmlから情報を取得
        let module_el = document.getElementById("module");

        let kernel_size_el = document.getElementById("kernel_size");
        let stride_el = document.getElementById("stride");
        let padding_el = document.getElementById("padding");

        // アラートメッセージ
        let alert_message = null;

        // 入力内容の判定
        if (module_el.value == "Select Layer Module") {
            if (alert_message != null) {
                alert_message += "please select module\n";
            } else {
                alert_message = "please select module\n";
            }
        }

        if (kernel_size_el.value == "") {
            if (alert_message != null) {
                alert_message += "please input kernel size\n";
            } else {
                alert_message = "please input kernel size\n";
            }
        }

        if (stride_el.value == "") {
            if (alert_message != null) {
                alert_message += "please input stride\n";
            } else {
                alert_message = "please input stride\n";
            }
        }

        if (padding_el.value == "") {
            if (alert_message != null) {
                alert_message += "please input padding\n";
            } else {
                alert_message = "please input padding\n";
            }
        }

        if (alert_message != null) { // 入力不足
            alert(alert_message)
        } else { // 入力OK
            // class : Layerを作成し、リストに追加
            let l = new Layer(global_index, module_el.value, kernel_size_el.value , stride_el.value, padding_el.value)
            layers.push(l)

            // 要素追加
            createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
            
            global_index++;
        }
    }
}

function createLayerBlock(index, module, kernel_size, stride, padding) {
    const layers_div_el = document.getElementById("layers");

    const layer_block = document.createElement("div");
    if ( module == "Conv2d") {
        layer_block.classList.add("conv");
    } else if ( module == "Pool2d" || module == "gap" ) {
        layer_block.classList.add("pool");
    }

    layer_block.id = index;

    // ブロック内の文字
    if ( module == "gap" ) {
        const layer_info = index + ": " + module + "( adoptive )";
        var text1 = document.createTextNode(layer_info);
    } else {
        const layer_info = index + ": " + module + "(kernel_size=(" + kernel_size + "," + kernel_size + "), stride=(" + stride + "," + stride + "), padding=(" + padding + "," + padding +"))";
        var text1 = document.createTextNode(layer_info);
    }

    const del_btn = document.createElement("input");
    del_btn.classList.add("del-btn");
    del_btn.type = "button";
    del_btn.value="Delete";
    del_btn.onclick = function() {
        deleteLayer(index);
    };
    layer_block.appendChild(text1);
    layer_block.appendChild(del_btn);

    layers_div_el.appendChild(layer_block);
}

function deleteLayer(index) {
    let layer_el = document.getElementById(index);
    layer_el.remove()
    layers.splice(index, 1);
}

function deleteAllLayers() {
    const layers_el = document.getElementById("layers");
    while(layers_el.firstChild){
        layers_el.removeChild(layers_el.firstChild);
    }
    layers = [];
    global_index = 0;
}

function deleteAllResults() {
    const layers_el = document.getElementById("results");
    while(layers_el.firstChild){
        layers_el.removeChild(layers_el.firstChild);
    }
}

function calcInfo() {
    let input_size_el = document.getElementById("input_size");
    let input_size = parseInt(input_size_el.value, 10);

    const results_div_el = document.getElementById("results");
    while(results_div_el.firstChild){
        results_div_el.removeChild(results_div_el.firstChild);
    }

    for (let i = 0; i < layers.length; i++) {
        // 入力サイズ指定
        layers[i].setInputSize(input_size);

        // ジャンプ計算 & 前レイヤのRF指定
        if (i == 0){
            layers[i].setPreJump(1);
            layers[i].setPreReceptiveField(1);
        } else {
            layers[i].setPreJump(layers[i-1].jump);
            layers[i].setPreReceptiveField(layers[i-1].receptive_field);
        }
        

        if ( layers[i].module == "Conv2d" ) {
            const result_block = document.createElement("div");
            result_block.classList.add("conv");

            // ブロック内の文字
            const result_info = layers[i].index + ": " + layers[i].module + " input_size=" + layers[i].input_size + ", output_size=" + layers[i].output_size + ", receptive_field=" + layers[i].receptive_field;
            const text1 = document.createTextNode(result_info);

            result_block.appendChild(text1);

            results_div_el.appendChild(result_block);

        } else if ( layers[i].module == "Pool2d" ) {
            const result_block = document.createElement("div");
            result_block.classList.add("pool");

            // ブロック内の文字
            const result_info = layers[i].index + ": " + layers[i].module + " input_size=" + layers[i].input_size + ", output_size=" + layers[i].output_size + ", receptive_field=" + layers[i].receptive_field;
            const text1 = document.createTextNode(result_info);

            result_block.appendChild(text1);

            results_div_el.appendChild(result_block);
        } else if ( layers[i].module == "gap" ) {
            const result_block = document.createElement("div");
            result_block.classList.add("pool");

            layers[i].kernel_size = layers[i-1].output_size;
            layers[i].stride = 1;
            layers[i].padding = 0;

            // ブロック内の文字
            const result_info = layers[i].index + ": " + layers[i].module + "( kernel_size=" + layers[i-1].output_size + " )" + " input_size=" + layers[i].input_size + ", output_size=" + layers[i].output_size + ", receptive_filed=" + layers[i].receptive_field;
            const text1 = document.createTextNode(result_info);

            result_block.appendChild(text1);

            results_div_el.appendChild(result_block);
        }
        input_size = layers[i].output_size
    }   
}

function setDefault() {
    let module_el = document.getElementById("module");

    let kernel_size_el = document.getElementById("kernel_size");
    let stride_el = document.getElementById("stride");
    let padding_el = document.getElementById("padding");

    if (module_el.value == "Conv2d") {
        kernel_size_el.value = 3;
        stride_el.value = 1;
        padding_el.value = 1;
    } else if (module_el.value == "Pool2d") {
        kernel_size_el.value = 2;
        stride_el.value = 2;
        padding_el.value = 0;
    }
}

function vgg16() {
    deleteAllLayers();

    vgg16_params = {
        "index": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        "module": ["Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d"],
        "kernel_size": [3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 2, 3, 3, 3, 2],
        "stride": [1, 1, 2, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2], 
        "padding": [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0]
    };

    for (let i = 0; i < vgg16_params["index"].length; i++) {
        let l = new Layer(vgg16_params["index"][i], vgg16_params["module"][i], vgg16_params["kernel_size"][i], vgg16_params["stride"][i], vgg16_params["padding"][i])
        layers.push(l)

        // 要素追加
        createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
        
        global_index++;
    }
}

function vgg19() {
    deleteAllLayers();

    vgg19_params = {
        "index": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        "module": ["Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d"],
        "kernel_size": [3, 3, 2, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2],
        "stride": [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2], 
        "padding": [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0]
    };

    for (let i = 0; i < vgg19_params["index"].length; i++) {
        let l = new Layer(vgg19_params["index"][i], vgg19_params["module"][i], vgg19_params["kernel_size"][i], vgg19_params["stride"][i], vgg19_params["padding"][i])
        layers.push(l)

        // 要素追加
        createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
    }
}

function vgg19() {
    deleteAllLayers();

    vgg19_params = {
        "index": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        "module": ["Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d", "Conv2d", "Conv2d", "Conv2d", "Conv2d", "Pool2d"],
        "kernel_size": [3, 3, 2, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2, 3, 3, 3, 3, 2],
        "stride": [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2], 
        "padding": [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0]
    };

    for (let i = 0; i < vgg19_params["index"].length; i++) {
        let l = new Layer(vgg19_params["index"][i], vgg19_params["module"][i], vgg19_params["kernel_size"][i], vgg19_params["stride"][i], vgg19_params["padding"][i])
        layers.push(l)

        // 要素追加
        createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
    }
}

function resnet50() {
    deleteAllLayers();
    num_blocks = [3, 4, 6, 3];

    bottleneck_block_params = {
        "module": ["Conv2d", "Conv2d", "Conv2d"],
        "kernel_size": [1, 3, 1],
        "stride": [1, 1, 1],
        "padding": [0, 1, 0]
    };

    downsample_bottleneck_block_params = {
        "module": ["Conv2d", "Conv2d", "Conv2d"],
        "kernel_size": [1, 3, 1],
        "stride": [1, 2, 1],
        "padding": [0, 1, 0]
    };

    resnet50_params = {
        "module": ["Conv2d", "Pool2d", "blocks", "blocks", "blocks", "blocks", "gap"],
        "kernel_size": [7, 3, "blocks", "blocks", "blocks", "blocks", "gap"],
        "stride": [2, 2, "blocks", "blocks", "blocks", "blocks", "gap"],
        "padding": [3, 1, "blocks", "blocks", "blocks", "blocks", "gap"]
    };

    let block_cnt = 0;
    for (let i = 0; i < resnet50_params["module"].length; i++) {

        if ( resnet50_params["module"][i] == "blocks" ) {

            const layers_div_el = document.getElementById("layers");
            const layer_block = document.createElement("div");

            // ブロック内の文字
            const layer_info = "--- layer-" + block_cnt + " ---";
            const text1 = document.createTextNode(layer_info);
            layer_block.appendChild(text1);
            layers_div_el.appendChild(layer_block);

            for (let b = 0; b < num_blocks[block_cnt]; b++) { // [3, 4, 6, 3] 分

                const layers_div_el = document.getElementById("layers");
                const layer_block = document.createElement("div");

                // ブロック内の文字
                const layer_info = "--- block-" + b + " ---";
                const text1 = document.createTextNode(layer_info);
                layer_block.appendChild(text1);
                layers_div_el.appendChild(layer_block);

                // Block の中身
                for (let j = 0; j < bottleneck_block_params["module"].length; j++) {

                    if ( block_cnt == 0 ) {
                        let l = new Layer(global_index, bottleneck_block_params["module"][j], bottleneck_block_params["kernel_size"][j], bottleneck_block_params["stride"][j], bottleneck_block_params["padding"][j])
                        layers.push(l)

                        createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
                        global_index++;
                    } else {
                        if ( b == 0 ) {
                            let l = new Layer(global_index, downsample_bottleneck_block_params["module"][j], downsample_bottleneck_block_params["kernel_size"][j], downsample_bottleneck_block_params["stride"][j], downsample_bottleneck_block_params["padding"][j])
                            layers.push(l)
    
                            createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
                            global_index++;
                        } else {
                            let l = new Layer(global_index, bottleneck_block_params["module"][j], bottleneck_block_params["kernel_size"][j], bottleneck_block_params["stride"][j], bottleneck_block_params["padding"][j])
                            layers.push(l)
    
                            createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
                            global_index++;
                        }
                    }
                }
            }
            block_cnt++;

        } else if ( resnet50_params["module"][i] == "gap" ) {
            let l = new Layer(global_index, resnet50_params["module"][i], resnet50_params["kernel_size"][i], resnet50_params["stride"][i], resnet50_params["padding"][i])
            layers.push(l)
            global_index++;

            createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
        } else {
            let l = new Layer(global_index, resnet50_params["module"][i], resnet50_params["kernel_size"][i], resnet50_params["stride"][i], resnet50_params["padding"][i])
            layers.push(l)

            // 要素追加
            createLayerBlock(l.index, l.module, l.kernel_size, l.stride, l.padding);
            global_index++;
        }
    }
}