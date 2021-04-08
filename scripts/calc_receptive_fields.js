class Layer {
    constructor(index, module, kernel_size, stride, padding) {
        this.index = index;
        this.module = module

        //this.input_size = parseInt(input_size, 10);
        //this.output_size = calcOutputSize(input_size, kernel_size, stride, padding);
        //global_input_size = this.output_size

        this.kernel_size = parseInt(kernel_size, 10);
        this.stride = parseInt(stride, 10);
        this.padding = parseInt(padding, 10);
    }

    setInputSize(input_size) {
        this.input_size = input_size
    }

    get output_size() {
        return this.calcOutputSize();
    }

    calcOutputSize() {
        return (Math.ceil((this.input_size - this.kernel_size + 2 * this.padding) / this.stride) + 1);
    }
}

let layers = [];
let global_index = 0;
let global_input_size = 224;

function addLayer() {
    if (layers.length > 50) {
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
            const layers_div_el = document.getElementById("layers");
            if (module_el.value == "Conv2D"){
                const layer_block = document.createElement("div");
                layer_block.classList.add("conv");
                layer_block.id = global_index;

                // ブロック内の文字
                const layer_info = l.index + ": " + module_el.value + "(kernel_size=(" + l.kernel_size + "," + l.kernel_size + "), stride=(" + l.stride + "," + l.stride + "), padding=(" + l.padding + "," + l.padding +"))";
                const text1 = document.createTextNode(layer_info);

                const del_btn = document.createElement("input");
                del_btn.classList.add("del-btn");
                del_btn.type = "button";
                del_btn.value="Delete";
                del_btn.onclick = function() {
                    deleteLayer(l.index);
                };
                layer_block.appendChild(text1);
                layer_block.appendChild(del_btn);

                layers_div_el.appendChild(layer_block);

            } else if (module_el.value == "Pool2D") {
                const layer_block = document.createElement("div"); 
                layer_block.classList.add("pool");
                layer_block.id = global_index;

                // ブロック内の文字
                const layer_info = l.index + ": " + module_el.value + "(kernel_size=(" + l.kernel_size + "," + l.kernel_size + "), stride=(" + l.stride + "," + l.stride + "), padding=(" + l.padding + "," + l.padding +"))";
                const text1 = document.createTextNode(layer_info);

                const del_btn = document.createElement("input");
                del_btn.classList.add("del-btn");
                del_btn.type = "button";
                del_btn.value="Delete";
                del_btn.onclick = function() {
                    deleteLayer(l.index);
                };
                layer_block.appendChild(text1);
                layer_block.appendChild(del_btn);

                layers_div_el.appendChild(layer_block);

            }
            global_index++;
        }
    }
}

function deleteLayer(index) {
    let layer_el = document.getElementById(index);
    layer_el.remove()
    layers.splice(index, 1);
}

function deleteAllLayer() {
    const layers_el = document.getElementById("layers");
    while(layers_el.firstChild){
        layers_el.removeChild(layers_el.firstChild);
    }
    layers = [];
}

function calcOutputSize() {
    let input_size_el = document.getElementById("input_size");
    let input_size = parseInt(input_size_el.value, 10);

    const results_div_el = document.getElementById("results");
    while(results_div_el.firstChild){
        results_div_el.removeChild(results_div_el.firstChild);
    }

    for (let i = 0; i < layers.length; i++) {
        layers[i].setInputSize(input_size);

        if (layers[i].module == "Conv2D"){
            const result_block = document.createElement("div");
            result_block.classList.add("conv");

            // ブロック内の文字
            const result_info = layers[i].index + ": " + layers[i].module + "input_size=" + layers[i].input_size + ", output_size=" + layers[i].output_size;
            const text1 = document.createTextNode(result_info);

            result_block.appendChild(text1);

            results_div_el.appendChild(result_block);

        } else if (layers[i].module == "Pool2D") {
            const result_block = document.createElement("div");
            result_block.classList.add("pool");

            // ブロック内の文字
            const result_info = layers[i].index + ": " + layers[i].module + "input_size=" + layers[i].input_size + ", output_size=" + layers[i].output_size;
            const text1 = document.createTextNode(result_info);

            result_block.appendChild(text1);

            results_div_el.appendChild(result_block);
        }
        input_size = layers[i].output_size
    }   
}