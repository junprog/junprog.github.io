const layerModule = {
    "Conv2D": ["kernel_size", ""],
    "Pool2D": []};

var layers = document.getElementById("layers")

function addLayer() {
    // a 要素の作成と属性の指定
    var newAnchor = document.createElement("div");

    var newLayer = document.createTextNode( document.getElementById("favtext").value );

    var kernel_size = document.createTextNode( document.getElementById("kernel_size").value );
    var stride = document.createTextNode( document.getElementById("stride").value );
    var padding = document.createTextNode( document.getElementById("padding").value );

    newAnchor.appendChild( newLayer );
    newAnchor.setAttribute("kernel_size", kernel_size );
    newAnchor.setAttribute("stride", stride );
    newAnchor.setAttribute("padding", padding );
   
    // div 要素の作成
    var newLayer = document.createElement("div");
    newLayer.appendChild ( newAnchor );
   
    // リストに追加
    layers.appendChild( newLi );   
}

function deleteLayer() {
    
}