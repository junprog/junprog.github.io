import { current_path, historyList, saveHistory, resetHistoryIndex, limitHistory, appendToHistory } from './state.js';
import { executeCommand } from './commands.js';

export function addInputHistory(commandText) {
    appendToHistory({
        type: "input",
        user: "you@junprog",
        path: current_path,
        command: commandText
    });
    limitHistory();
    saveHistory();
    resetHistoryIndex();
}

export function addOutputHistory(text, isHtml = false) {
    appendToHistory({
        type: "output",
        text: text,
        isHtml: isHtml
    });
    limitHistory();
    saveHistory();
}

export function clearInput() {
    const inputElement = document.getElementById("exec-cmd");
    if (inputElement) {
        inputElement.value = "";
    }
}

export function renderHistory() {
    if (window.setIgnoreHeaderScroll) {
        window.setIgnoreHeaderScroll();
    }

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
                        const dataPath = link.getAttribute("data-path");
                        const arg = dataPath ? dataPath : link.textContent.replace(/\/$/, "");
                        executeCommand(cmdName + arg);
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

export function runMatrixEffect() {
    if (document.getElementById("matrix-canvas")) return;

    const canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.zIndex = "9999";
    canvas.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];
    for (let x = 0; x < columns; x++) drops[x] = 1;

    let intervalId;

    function draw() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px monospace";
        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }

    intervalId = setInterval(draw, 33);

    const stopMatrix = () => {
        clearInterval(intervalId);
        if (document.body.contains(canvas)) {
            document.body.removeChild(canvas);
        }
        document.removeEventListener("click", stopMatrix);
        document.removeEventListener("keydown", stopMatrix);
    };

    setTimeout(() => {
        document.addEventListener("click", stopMatrix);
        document.addEventListener("keydown", stopMatrix);
    }, 500);
}

export function runFakeDeletion() {
    let output = "Warning: Initiating root deletion protocol...<br>";
    addOutputHistory(output, true);
    renderHistory();

    document.body.classList.add("deleting-mode");
    document.documentElement.classList.add("deleting-mode");

    let count = 0;
    const files = ["/boot", "/usr/bin", "/etc/passwd", "/home/junprog/documents", "/var/log", "system files..."];

    const interval = setInterval(() => {
        if (count < files.length) {
            addOutputHistory(`Deleting ${files[count]}...`, false);
            renderHistory();
            count++;
        } else {
            clearInterval(interval);
            setTimeout(() => {
                const overlay = document.createElement("div");
                overlay.style.position = "fixed";
                overlay.style.top = "0";
                overlay.style.left = "0";
                overlay.style.width = "100vw";
                overlay.style.height = "100vh";
                overlay.style.backgroundColor = "black";
                overlay.style.color = "red";
                overlay.style.display = "flex";
                overlay.style.alignItems = "center";
                overlay.style.justifyContent = "center";
                overlay.style.fontSize = "clamp(1.5rem, 8vw, 3rem)";
                overlay.style.textAlign = "center";
                overlay.style.padding = "20px";
                overlay.style.fontFamily = "monospace";
                overlay.style.zIndex = "10000";
                overlay.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
                overlay.addEventListener("wheel", (e) => e.preventDefault(), { passive: false });
                overlay.textContent = "System destroyed.";
                document.body.appendChild(overlay);

                setTimeout(() => {
                    overlay.style.color = "#0f0";
                    overlay.textContent = "Just kidding! 😜";
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                }, 2000);
            }, 1000);
        }
    }, 600);
}
