document.addEventListener("DOMContentLoaded", () => {
    // スクリーン幅を取得
    const screenWidth = window.innerWidth;

    // HTML要素を取得
    const inputElement = document.getElementById("exec-cmd");

    // スクリーン幅が一定の値未満の場合にautofocusを追加
    if (screenWidth >= 640 && inputElement) {
        inputElement.focus();
    }

    const terminal_path_ele = document.getElementById("path");
    let current_path = location.pathname;

    if (current_path === "/") {
        current_path = "~";
    } else {
        current_path = "~" + current_path;
    }

    if (current_path.slice(-1) === "/" && current_path !== "~") {
        current_path = current_path.slice(0, -1);
    }

    if (terminal_path_ele) {
        terminal_path_ele.innerHTML = current_path;
    }

    // 仮想ディレクトリツリーの定義
    const DIRECTORY_TREE = {
        "~": {
            type: "dir",
            link: "/",
            children: {
                "posts": { type: "dir", link: "/posts/" },
                "tags": { type: "file", link: "/tags" },
                "categories": { type: "file", link: "/categories" }
            }
        },
        "~/posts": {
            type: "dir",
            link: "/posts/",
            children: {
                "blog": { type: "dir", link: "/posts/blog/" },
                "survey": { type: "dir", link: "/posts/survey/" },
                "playground": { type: "dir", link: "/posts/playground/" },
                "index.html": { type: "file", link: "/posts/" }
            }
        },
        "~/posts/blog": {
            type: "dir",
            link: "/posts/blog/",
            children: {}
        },
        "~/posts/survey": {
            type: "dir",
            link: "/posts/survey/",
            children: {}
        },
        "~/posts/playground": {
            type: "dir",
            link: "/posts/playground/",
            children: {}
        }
    };

    // 履歴管理
    const MAX_HISTORY = 50;
    let historyList = getHistory();

    // 履歴インデックス管理（上下キー用）
    let historyIndex = -1;
    let tempInput = "";

    function resetHistoryIndex() {
        const inputCommands = historyList.filter(item => item.type === "input");
        historyIndex = inputCommands.length;
        tempInput = "";
    }

    // 初期化時にインデックスを設定
    resetHistoryIndex();

    function getHistory() {
        try {
            const hist = sessionStorage.getItem("terminal_history");
            return hist ? JSON.parse(hist) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHistory() {
        sessionStorage.setItem("terminal_history", JSON.stringify(historyList));
    }

    function addInputHistory(commandText) {
        historyList.push({
            type: "input",
            user: "you@junprog",
            path: current_path,
            command: commandText
        });
        limitHistory();
        saveHistory();
        resetHistoryIndex();
    }

    function addOutputHistory(text, isHtml = false) {
        historyList.push({
            type: "output",
            text: text,
            isHtml: isHtml
        });
        limitHistory();
        saveHistory();
    }

    function limitHistory() {
        if (historyList.length > MAX_HISTORY) {
            historyList = historyList.slice(historyList.length - MAX_HISTORY);
        }
    }

    function clearInput() {
        if (inputElement) {
            inputElement.value = "";
        }
    }

    function renderHistory() {
        const historyContainer = document.getElementById("terminal-line-1");
        if (!historyContainer) return;
        
        historyContainer.innerHTML = "";
        
        if (historyList.length === 0) {
            historyContainer.style.display = "none";
            return;
        }
        
        historyContainer.style.display = "block";
        historyList.forEach(item => {
            if (item.type === "input") {
                const line = document.createElement("div");
                line.className = "terminal-history-line";
                
                const userSpan = document.createElement("span");
                userSpan.className = "user";
                userSpan.textContent = item.user;
                
                const colonSpan = document.createElement("span");
                colonSpan.className = "command-colon";
                colonSpan.textContent = ":";
                
                const pathSpan = document.createElement("span");
                pathSpan.className = "path";
                pathSpan.textContent = item.path;
                
                const execSpan = document.createElement("span");
                execSpan.className = "exec";
                execSpan.textContent = "$\u00A0";
                
                const cmdSpan = document.createElement("span");
                cmdSpan.className = "command-text";
                cmdSpan.textContent = item.command;
                
                line.appendChild(userSpan);
                line.appendChild(colonSpan);
                line.appendChild(pathSpan);
                line.appendChild(execSpan);
                line.appendChild(cmdSpan);
                
                historyContainer.appendChild(line);
            } else if (item.type === "output") {
                const line = document.createElement("div");
                line.className = "terminal-history-output";
                if (item.isHtml) {
                    line.innerHTML = item.text;
                    const links = line.querySelectorAll(".terminal-link");
                    links.forEach(link => {
                        link.addEventListener("click", () => {
                            const isDir = link.classList.contains("terminal-dir");
                            const cmdName = isDir ? "cd " : "cat ";
                            const displayName = link.textContent.replace(/\/$/, "");
                            executeCommand(cmdName + displayName);
                        });
                    });
                } else {
                    line.textContent = item.text;
                }
                historyContainer.appendChild(line);
            }
        });
        
        const terminalContainer = document.querySelector(".terminal");
        if (terminalContainer) {
            terminalContainer.scrollTop = terminalContainer.scrollHeight;
        }
    }

    function resolvePath(current, target) {
        if (target === "." || target === "./") {
            return current;
        }
        if (target === "~" || target === "/") {
            return "~";
        }
        if (target === "..") {
            if (current === "~") return "~";
            const parts = current.split("/");
            parts.pop();
            return parts.join("/");
        }
        
        let resolved = "";
        if (target.startsWith("/") || target.startsWith("~")) {
            resolved = target.replace(/^\/+/, "~");
            if (!resolved.startsWith("~")) {
                resolved = "~" + resolved;
            }
        } else {
            if (target.startsWith("./")) {
                target = target.slice(2);
            }
            resolved = current + "/" + target;
        }
        
        resolved = resolved.replace(/\/+/g, "/");
        if (resolved.endsWith("/") && resolved !== "~") {
            resolved = resolved.slice(0, -1);
        }
        return resolved;
    }

    function findNode(path) {
        if (DIRECTORY_TREE[path]) {
            return DIRECTORY_TREE[path];
        }
        const lastSlash = path.lastIndexOf("/");
        if (lastSlash !== -1) {
            const parentPath = path.slice(0, lastSlash);
            const nodeName = path.slice(lastSlash + 1);
            const parentNode = DIRECTORY_TREE[parentPath];
            if (parentNode && parentNode.children && parentNode.children[nodeName]) {
                return parentNode.children[nodeName];
            }
        }
        return null;
    }

    function executeCommand(inputValue) {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput) return;

        addInputHistory(trimmedInput);

        const parts = trimmedInput.split(/\s+/);
        const cmd = parts[0];
        const arg = parts.slice(1).join(" ");

        if (cmd === "clear") {
            sessionStorage.setItem("terminal_history", JSON.stringify([]));
            location.reload();
            return;
        }

        if (cmd === "help") {
            const helpText = 
`Available commands:
  ls          List files and directories in the current path
  cd [path]   Change directory (use "cd .." to go up)
  cat [file]  Open/view a file (transitions to the page)
  clear       Clear terminal history
  help        Display this help message`;
            addOutputHistory(helpText, false);
            renderHistory();
            clearInput();
            return;
        }

        if (cmd === "ls") {
            let targetPath = current_path;
            if (arg) {
                targetPath = resolvePath(current_path, arg);
            }
            
            const node = findNode(targetPath);
            if (node && node.type === "dir") {
                let outputHtml = "";
                const keys = Object.keys(node.children).sort();
                if (keys.length === 0) {
                    outputHtml = "(empty)";
                } else {
                    outputHtml = keys.map(key => {
                        const child = node.children[key];
                        if (child.type === "dir") {
                            return `<span class="terminal-dir terminal-link" data-link="${child.link}">${key}/</span>`;
                        } else {
                            return `<span class="terminal-file terminal-link" data-link="${child.link}">${key}</span>`;
                        }
                    }).join("  ");
                }
                addOutputHistory(outputHtml, true);
            } else if (node && node.type === "file") {
                const filename = targetPath.slice(targetPath.lastIndexOf("/") + 1);
                addOutputHistory(`<span class="terminal-file terminal-link" data-link="${node.link}">${filename}</span>`, true);
            } else {
                addOutputHistory(`ls: cannot access '${arg}': No such file or directory`, false);
            }
            renderHistory();
            clearInput();
            return;
        }

        if (cmd === "cd") {
            const target = arg || "~";
            const targetPath = resolvePath(current_path, target);
            const node = findNode(targetPath);

            if (node) {
                if (node.type === "dir") {
                    saveHistory();
                    location.assign(node.link);
                } else {
                    addOutputHistory(`bash: cd: ${target}: Not a directory (use 'cat' to view files)`, false);
                    renderHistory();
                    clearInput();
                }
            } else {
                addOutputHistory(`bash: cd: ${target}: No such file or directory`, false);
                renderHistory();
                clearInput();
            }
            return;
        }

        if (cmd === "cat") {
            if (!arg) {
                addOutputHistory("cat: missing operand", false);
                renderHistory();
                clearInput();
                return;
            }
            const targetPath = resolvePath(current_path, arg);
            const node = findNode(targetPath);

            if (node) {
                if (node.type === "file") {
                    saveHistory();
                    location.assign(node.link);
                } else {
                    addOutputHistory(`cat: ${arg}: Is a directory`, false);
                    renderHistory();
                    clearInput();
                }
            } else {
                addOutputHistory(`cat: ${arg}: No such file or directory`, false);
                renderHistory();
                clearInput();
            }
            return;
        }

        addOutputHistory(`bash: ${cmd}: command not found`, false);
        renderHistory();
        clearInput();
    }

    // データの動的フェッチ
    fetch("/terminal_data.json")
        .then(response => response.json())
        .then(data => {
            data.forEach(post => {
                let catKey = "";
                if (post.category === "ブログ") {
                    catKey = "~/posts/blog";
                } else if (post.category === "サーベイ") {
                    catKey = "~/posts/survey";
                } else if (post.category === "プレイグラウンド") {
                    catKey = "~/posts/playground";
                }
                if (catKey && DIRECTORY_TREE[catKey]) {
                    DIRECTORY_TREE[catKey].children[post.filename] = {
                        type: "file",
                        link: post.url,
                        title: post.title
                    };
                }
            });
        })
        .catch(err => {
            console.error("Failed to load terminal data:", err);
        });

    // 起動時の初期描画
    renderHistory();

    // 共通プレフィックスを求める関数
    function sharedPrefix(strings) {
        if (!strings || strings.length === 0) return "";
        if (strings.length === 1) return strings[0];
        
        let sorted = strings.slice().sort();
        let first = sorted[0];
        let last = sorted[sorted.length - 1];
        let i = 0;
        while (i < first.length && first.charAt(i) === last.charAt(i)) {
            i++;
        }
        return first.substring(0, i);
    }

    // Tab補完ロジック
    let lastTabInput = "";
    let lastTabTime = 0;

    function handleTabCompletion(inputValue) {
        const trimmed = inputValue.trimStart();
        if (!trimmed) {
            // 空入力の時はコマンド一覧を即座に表示
            const commands = ["ls", "cd", "cat", "clear", "help"];
            addInputHistory(inputValue);
            addOutputHistory(commands.join("  "), false);
            renderHistory();
            return;
        }

        const firstSpaceIdx = trimmed.indexOf(" ");
        
        if (firstSpaceIdx === -1) {
            // コマンドの補完（大文字小文字を区別しない）
            const prefix = trimmed.toLowerCase();
            const commands = ["ls", "cd", "cat", "clear", "help"];
            const matches = commands.filter(c => c.toLowerCase().startsWith(prefix));

            if (matches.length === 0) return;

            if (matches.length === 1) {
                inputElement.value = matches[0] + " ";
                lastTabInput = inputElement.value;
            } else {
                const common = sharedPrefix(matches);
                if (common.length > prefix.length) {
                    inputElement.value = common;
                    lastTabInput = inputElement.value;
                } else {
                    // 候補が複数あり、これ以上補完できない場合は即座に表示
                    addInputHistory(inputValue);
                    addOutputHistory(matches.join("  "), false);
                    renderHistory();
                }
            }
        } else {
            // パスの補完
            const cmd = trimmed.substring(0, firstSpaceIdx);
            const rawPath = trimmed.substring(firstSpaceIdx + 1).trimStart();
            
            let parentDirPath = "";
            let prefix = "";
            
            const lastSlashIdx = rawPath.lastIndexOf("/");
            if (lastSlashIdx === -1) {
                parentDirPath = "";
                prefix = rawPath;
            } else {
                parentDirPath = rawPath.substring(0, lastSlashIdx);
                prefix = rawPath.substring(lastSlashIdx + 1);
            }

            const searchDirPath = resolvePath(current_path, parentDirPath || ".");
            const node = findNode(searchDirPath);

            if (!node || node.type !== "dir") return;

            const childrenKeys = Object.keys(node.children);
            // 大文字小文字を無視してマッチング
            const matches = childrenKeys.filter(k => k.toLowerCase().startsWith(prefix.toLowerCase()));

            if (matches.length === 0) return;

            if (matches.length === 1) {
                const completed = matches[0];
                const childNode = node.children[completed];
                const isDir = childNode.type === "dir";
                const suffix = isDir ? "/" : " ";
                
                const pathSeparator = parentDirPath ? "/" : "";
                inputElement.value = cmd + " " + parentDirPath + pathSeparator + completed + suffix;
                lastTabInput = inputElement.value;
            } else {
                const common = sharedPrefix(matches);
                if (common.length > prefix.length) {
                    const pathSeparator = parentDirPath ? "/" : "";
                    inputElement.value = cmd + " " + parentDirPath + pathSeparator + common;
                    lastTabInput = inputElement.value;
                } else {
                    // 候補が複数あり、これ以上補完できない場合は即座に表示
                    const displayMatches = matches.map(k => {
                        const child = node.children[k];
                        return child.type === "dir" ? k + "/" : k;
                    });
                    addInputHistory(inputValue);
                    addOutputHistory(displayMatches.join("  "), false);
                    renderHistory();
                }
            }
        }
    }

    // 入力イベントリスナー
    if (inputElement) {
        inputElement.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const inputValue = inputElement.value;
                executeCommand(inputValue);
                event.preventDefault();
                return false;
            }
            if (event.key === "Tab") {
                const inputValue = inputElement.value;
                handleTabCompletion(inputValue);
                event.preventDefault();
                return false;
            }
            if (event.key === "ArrowUp") {
                const inputCommands = historyList
                    .filter(item => item.type === "input")
                    .map(item => item.command);
                
                if (inputCommands.length > 0) {
                    if (historyIndex === -1 || historyIndex === inputCommands.length) {
                        historyIndex = inputCommands.length;
                        tempInput = inputElement.value;
                    }
                    if (historyIndex > 0) {
                        historyIndex--;
                        inputElement.value = inputCommands[historyIndex];
                        setTimeout(() => {
                            inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
                        }, 0);
                    }
                }
                event.preventDefault();
                return false;
            }
            if (event.key === "ArrowDown") {
                const inputCommands = historyList
                    .filter(item => item.type === "input")
                    .map(item => item.command);
                
                if (inputCommands.length > 0 && historyIndex !== -1) {
                    if (historyIndex < inputCommands.length - 1) {
                        historyIndex++;
                        inputElement.value = inputCommands[historyIndex];
                        setTimeout(() => {
                            inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
                        }, 0);
                    } else if (historyIndex === inputCommands.length - 1) {
                        historyIndex++;
                        inputElement.value = tempInput;
                    }
                }
                event.preventDefault();
                return false;
            }
        });
    }
});