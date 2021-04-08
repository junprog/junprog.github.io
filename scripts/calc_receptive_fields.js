class Layer {
    constructor(index, kernel_size, stride, padding) {
        this.index = index;

        //this.input_size = parseInt(input_size, 10);
        //this.output_size = calcOutputSize(input_size, kernel_size, stride, padding);

        this.kernel_size = parseInt(kernel_size, 10);
        this.stride = parseInt(stride, 10);
        this.padding = parseInt(padding, 10);
    }
}

let layers = [];
let global_index = 0;
console.log(layers)

function addLayer() {
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
        let l = new Layer(global_index, kernel_size_el.value , stride_el.value, padding_el.value)
        layers.push(l)
        global_index++;

        // 要素追加
        const layers_div_el = document.getElementById("layers");
        if (module_el.value == "Conv2D"){
            const layer_block = document.createElement("div");
            layer_block.classList.add("conv");
            layer_block.id = global_index;

            const layer_info = module_el.value + "(kernel_size=" + l.kernel_size + ", stride=" + l.stride + ", padding=(" + l.padding + "," + l.padding +"))";
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
            const text1 = document.createTextNode("テスト");
            layer_block.appendChild(text1);
            layers_div_el.appendChild(layer_block);

        }

    }
}

function deleteLayer(index) {
    console.log(index);
    layers.splice(1,1);
    
}

function calcOutputSize(input_size, k, s, p) {
    input_size = parseInt(input_size, 10);
    k = parseInt(k, 10);
    s = parseInt(s, 10);
    p = parseInt(p, 10);

    console.log(input_size, k, s, p);
    console.log((((input_size - k + 2 * p) / s) + 1));
    return (((input_size - k + 2 * p) / s) + 1);
}