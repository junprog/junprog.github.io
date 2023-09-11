$(function(){
    // スクリーン幅を取得
    const screenWidth = window.innerWidth;

    // HTML要素を取得
    const inputElement = document.getElementById("exec-cmd");

    // スクリーン幅が一定の値未満の場合にautofocusを追加
    if (screenWidth >= 640) {
        inputElement.focus();
    }

    var terminal_path_ele = document.getElementById("path");
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

    // 一個前のコマンド出力
    // window.addEventListener("load", function() {
    const savedUser = sessionStorage.getItem("currentUser");
    if (savedUser !== null) {
        const postUser = document.getElementById("post-user");
        postUser.innerHTML = savedUser;
    }

    const savedCommand = sessionStorage.getItem("currentCommand");
    if (savedCommand !== null) {
        const postCommand = document.getElementById("post-command");
        postCommand.innerHTML = savedCommand;
    }
    
    const savedPath = sessionStorage.getItem("currentPath");
    if (savedPath !== null) {
        const postPath = document.getElementById("post-path");
        postPath.innerHTML = savedPath;
    }

    const savedExecCmd = sessionStorage.getItem("currentExecCmd");
    if (savedExecCmd !== null) {
        const postExecCmd = document.getElementById("post-exec");
        postExecCmd.innerHTML = savedExecCmd;
    }

    // terminal-line-1 に何も入ってなかったら見えなくする
    const terminalLine1Elem = document.getElementById("terminal-line-1");
    const terminalLine1Content = terminalLine1Elem.textContent;
    if (terminalLine1Content.trim() === "") {
        terminalLine1Elem.style.display = "none";
    }

    // エンターキーが押されたときの処理
    inputElement.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            // ここに実行したいJavaScriptコードを追加
            const inputValue = inputElement.value;
            if (inputValue.slice(0,3) === "cd ") {
                var next_path = inputValue.slice(3);
                if (next_path == "~") {
                    next_path = "/";
                }
               
                // sesstionStorageにpost-*に入る値を確保
                // HTML要素を取得
                const currentUser = document.getElementById("user");
                const currentCommand = document.getElementById("command");
                const currentPath = document.getElementById("path");
                const currentExec = document.getElementById("exec");
                const currentExecCmd = inputValue;

                // データをsessionStorageに保存
                sessionStorage.setItem("currentUser", currentUser.innerHTML);
                sessionStorage.setItem("currentCommand", currentCommand.innerHTML);
                sessionStorage.setItem("currentPath", currentPath.innerHTML);
                sessionStorage.setItem("currentExecCmd", currentExec.innerHTML + " " + currentExecCmd);

                inputElement.value = "";
                location.assign(next_path);
                return false;
            } else {
                alert("無効なコマンドです。");
                inputElement.value = "";
                return false;
            }
        }
    });

    

});


//     var exec_form = document.getElementById('exec');
// if (exec_form.value.slice(0,3) === "cd ") {
//     const next_path = site + exec_form.value.slice(3);
//     alert(next_path);
//     // $(location).attr("href", next_path)
//     // location.href = next_path;
//     location.assign(next_path);
//     return false;
// } else {
//     alert("無効なコマンドです。");
// }

function changeDir() {
    // alert("工事中です...")
    var exec_form = document.getElementById('exec');
    exec_form.addEventListener('keydown', function (event) {
        if (event.code === 13) {
            // エンターキーが押されたときの動作
            if (event.target.type != 'submit' && event.target.type != 'textarea') {
                // submitボタン、テキストエリア以外の場合はイベントをキャンセル
                event.preventDefault();

                if (exec_form.value.slice(0,3) === "cd ") {
                    const next_path = site + exec_form.value.slice(3);
                    alert(next_path);
                    // $(location).attr("href", next_path)
                    location.href = next_path;
                    // location.assign(next_path);
                } else {
                    alert("無効なコマンドです。");
                }
                return false;
            }
        }
    });
}