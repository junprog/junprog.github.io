import { 
    current_path, historyList, historyIndex, tempInput,
    initCurrentPath, setHistoryIndex, setTempInput, initializeHistory
} from './state.js';
import { fetchTerminalData } from './fileSystem.js';
import { renderHistory } from './ui.js';
import { executeCommand } from './commands.js';
import { handleTabCompletion } from './autocomplete.js';

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
    let initPath = location.pathname;

    if (initPath === "/") {
        initPath = "~";
    } else {
        initPath = "~" + initPath;
    }

    if (initPath.slice(-1) === "/" && initPath !== "~") {
        initPath = initPath.slice(0, -1);
    }
    
    initCurrentPath(initPath);

    if (terminal_path_ele) {
        terminal_path_ele.innerHTML = current_path;
    }

    // 初期化
    initializeHistory();

    // データの動的フェッチ
    fetchTerminalData();

    // 起動時の初期描画
    renderHistory();

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
                        setHistoryIndex(inputCommands.length);
                        setTempInput(inputElement.value);
                    }
                    if (historyIndex > 0) {
                        setHistoryIndex(historyIndex - 1);
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
                        setHistoryIndex(historyIndex + 1);
                        inputElement.value = inputCommands[historyIndex];
                        setTimeout(() => {
                            inputElement.selectionStart = inputElement.selectionEnd = inputElement.value.length;
                        }, 0);
                    } else if (historyIndex === inputCommands.length - 1) {
                        setHistoryIndex(historyIndex + 1);
                        inputElement.value = tempInput;
                    }
                }
                event.preventDefault();
                return false;
            }
        });
    }

    // ターミナル領域クリック時に入力欄へフォーカスする
    const terminalElement = document.querySelector(".terminal");
    if (terminalElement && inputElement) {
        terminalElement.addEventListener("click", (event) => {
            if (!event.target.closest("a") && !event.target.closest(".terminal-link")) {
                const selection = window.getSelection();
                if (!selection || selection.toString().length === 0) {
                    inputElement.focus();
                }
            }
        });
    }
});
