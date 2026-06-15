import { current_path } from './state.js';
import { resolvePath, findNode } from './fileSystem.js';
import { addInputHistory, addOutputHistory, renderHistory } from './ui.js';

export let lastTabInput = "";

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

export function handleTabCompletion(inputValue) {
    const inputElement = document.getElementById("exec-cmd");
    if (!inputElement) return;

    const trimmed = inputValue.trimStart();
    if (!trimmed) {
        // 空入力の時はコマンド一覧を即座に表示
        const commands = ["ls", "ll", "cd", "cat", "clear", "help", "rm", "sudo", "party", "neofetch", "matrix"];
        addInputHistory(inputValue);
        addOutputHistory(commands.join("  "), false);
        renderHistory();
        return;
    }

    const firstSpaceIdx = trimmed.indexOf(" ");

    if (firstSpaceIdx === -1) {
        // コマンドの補完（大文字小文字を区別しない）
        const prefix = trimmed.toLowerCase();
        const commands = ["ls", "ll", "cd", "cat", "clear", "help", "rm", "sudo", "party", "neofetch", "matrix"];
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
        const lastSpaceIdx = trimmed.lastIndexOf(" ");
        const cmdPrefix = trimmed.substring(0, lastSpaceIdx);
        const rawPath = trimmed.substring(lastSpaceIdx + 1);

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
            inputElement.value = cmdPrefix + " " + parentDirPath + pathSeparator + completed + suffix;
            lastTabInput = inputElement.value;
        } else {
            const common = sharedPrefix(matches);
            if (common.length > prefix.length) {
                const pathSeparator = parentDirPath ? "/" : "";
                inputElement.value = cmdPrefix + " " + parentDirPath + pathSeparator + common;
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
