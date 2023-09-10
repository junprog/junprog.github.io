$(function(){
    var terminal_path_ele = document.getElementById("terminal-path");
    var current_path = location.pathname;

    if (current_path === "/") {
        current_path = "~";
    } else {
        current_path = "~" + current_path;
    }

    if (current_path.slice(-1) === "/") {
        current_path = current_path.slice(0, -1);
    }

    terminal_path_ele.innerHTML = current_path;
});

function changeDir() {
    alert("工事中です...")
    // var exec_form = document.getElementById('exec');
    // if (exec_form.value.slice(0,3) === "cd ") {
    //     const next_path = site + exec_form.value.slice(3);
    //     alert(next_path);
    //     // $(location).attr("href", next_path)
    //     // location.href = next_path;
    //     location.assign(next_path);
    // } else {
    //     alert("無効なコマンドです。");
    // }
}