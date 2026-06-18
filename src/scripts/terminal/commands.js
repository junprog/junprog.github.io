import { current_path, saveHistory, clearHistoryList, resetHistoryIndex } from './state.js';
import { resolvePath, findNode } from './fileSystem.js';
import { addInputHistory, addOutputHistory, clearInput, renderHistory, runMatrixEffect, runFakeDeletion } from './ui.js';

export function executeCommand(inputValue) {
    let trimmedInput = inputValue.trim();
    if (!trimmedInput) return;

    addInputHistory(trimmedInput);

    if (trimmedInput === "ll" || trimmedInput.startsWith("ll ")) {
        trimmedInput = "ls -al" + trimmedInput.substring(2);
    }

    const parts = trimmedInput.split(/\s+/);
    const cmd = parts[0];
    const arg = parts.slice(1).join(" ");

    if (cmd === "clear") {
        clearHistoryList();
        sessionStorage.setItem("terminal_history", JSON.stringify([]));
        renderHistory();
        clearInput();
        resetHistoryIndex();
        return;
    }

    if (cmd === "help") {
        const helpText =
            `Available commands:
  ls          List files and directories in the current path
  cd [path]   Change directory (use "cd .." to go up)
  cat [file]  Open/view a file (transitions to the page)
  clear       Clear terminal history`;
        addOutputHistory(helpText, false);
        renderHistory();
        clearInput();
        return;
    }

    // Easter Eggs
    if (cmd === "matrix") {
        runMatrixEffect();
        addOutputHistory("Wake up, Neo...", false);
        renderHistory();
        clearInput();
        return;
    }

    if (cmd === "rm" || (cmd === "sudo" && arg.startsWith("rm"))) {
        const isSudo = cmd === "sudo";
        const rmArg = isSudo ? arg.replace(/^rm\s*/, "").trim() : arg;

        if (rmArg === "-rf /") {
            if (isSudo) {
                runFakeDeletion();
            } else {
                addOutputHistory("rm: it is dangerous to operate recursively on '/'\nrm: use --no-preserve-root to override this failsafe\nrm: Permission denied (Try with 'sudo' ?)", false);
                renderHistory();
            }
            clearInput();
            return;
        }

        const isRecursive = rmArg.includes("-r");
        const targetStr = rmArg.replace(/^-r[f]*\s*/, "").replace(/^-f\s*/, "").trim();

        if (targetStr === "") {
            addOutputHistory("rm: missing operand", false);
        } else {
            const targetPath = resolvePath(current_path, targetStr);
            const node = findNode(targetPath);

            if (targetPath === "/" || targetPath === "~" || (node && node.type === "dir")) {
                if (isRecursive) {
                    addOutputHistory(`rm: cannot remove '${targetStr}': Permission denied`, false);
                } else {
                    addOutputHistory(`rm: cannot remove '${targetStr}': Is a directory\nrm: Try with '-rf' to remove directories recursively`, false);
                }
            } else if (node && node.type === "file") {
                addOutputHistory(`rm: cannot remove '${targetStr}': Permission denied`, false);
            } else {
                addOutputHistory(`rm: cannot remove '${targetStr}': No such file or directory`, false);
            }
        }
        renderHistory();
        clearInput();
        return;
    }

    if (cmd === "party") {
        const isParty = document.body.classList.contains("party-mode");
        if (isParty) {
            document.body.classList.remove("party-mode");
            addOutputHistory("Party stopped. Back to work.", false);
        } else {
            document.body.classList.add("party-mode");
            addOutputHistory("Let's party! 🎉 (Type 'party' again to stop)", false);
        }
        renderHistory();
        clearInput();
        return;
    }

    if (cmd === "neofetch") {
        const fetchOutput = `
<div style="display: flex; gap: 20px; white-space: pre-wrap;">
<div style="color: #4497cf; font-weight: bold; line-height: 1.1;">
       _,met$$$$$gg.
    ,g$$$$$$$$$$$$$$$P.
  ,g$$P"     """Y$$.".
 ,$$P'              \`$$$.
',$$P       ,ggs.     \`$$b:
\`d$$'     ,$P"'   .    $$$
 $$P      d$'     ,    $$P
 $$:      $$.   -    ,d$$'
 $$;      Y$b._   _,d$P'
 Y$$.    \`.\`"Y$$$$P"'
 \`$$b      "-.__
  \`Y$$
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""
</div>
<div style="line-height: 1.4;">
<span style="color: #4497cf; font-weight: bold;">junprog</span>@<span style="color: #4497cf; font-weight: bold;">junprog.github.io</span>
-------------------------
<span style="color: #4497cf; font-weight: bold;">OS</span>: Junprog Web OS
<span style="color: #4497cf; font-weight: bold;">Host</span>: Web Browser
<span style="color: #4497cf; font-weight: bold;">Kernel</span>: Astro 4.x
<span style="color: #4497cf; font-weight: bold;">Uptime</span>: Just woke up
<span style="color: #4497cf; font-weight: bold;">Packages</span>: 42 (npm)
<span style="color: #4497cf; font-weight: bold;">Shell</span>: bash-like JS
<span style="color: #4497cf; font-weight: bold;">Theme</span>: Dark/Light
<span style="color: #4497cf; font-weight: bold;">Hobbies</span>: Camera, Programming
</div>
</div>`;
        addOutputHistory(fetchOutput, true);
        renderHistory();
        clearInput();
        return;
    }

    if (cmd === "ls") {
        let showHidden = false;
        let longFormat = false;
        let lsArgs = arg.split(/\s+/);
        let targetStrs = [];

        for (const a of lsArgs) {
            if (a.startsWith("-")) {
                if (a.includes("a")) showHidden = true;
                if (a.includes("l")) longFormat = true;
            } else if (a) {
                targetStrs.push(a);
            }
        }

        let targetPath = current_path;
        if (targetStrs.length > 0) {
            targetPath = resolvePath(current_path, targetStrs[0]);
        }

        const node = findNode(targetPath);
        if (node && node.type === "dir") {
            let outputHtml = "";
            let keys = Object.keys(node.children).sort();

            if (showHidden) {
                if (targetPath === "~" || targetPath === "/") {
                    keys = [".", ...keys];
                } else {
                    keys = [".", "..", ...keys];
                }
            }

            if (keys.length === 0) {
                outputHtml = "(empty)";
            } else {
                if (longFormat) {
                    outputHtml = `<div style="white-space: pre-wrap;">` + keys.map(key => {
                        let child;
                        if (key === "." || key === "..") {
                            child = { type: "dir", link: targetPath };
                        } else {
                            child = node.children[key];
                        }
                        const isDir = child.type === "dir";
                        const perms = isDir ? "drwxr-xr-x" : "-rw-r--r--";
                        const size = isDir ? "4096" : "1024";

                        const now = new Date();
                        const month = now.toLocaleString('en-US', { month: 'short' });
                        const day = now.getDate().toString().padStart(2, " ");
                        const hours = now.getHours().toString().padStart(2, "0");
                        const mins = now.getMinutes().toString().padStart(2, "0");
                        const dateStr = `${month} ${day} ${hours}:${mins}`;

                        const absPath = resolvePath(targetPath, key);
                        const nameSpan = isDir
                            ? `<span class="terminal-dir terminal-link" data-link="${child.link}" data-path="${absPath}">${key}/</span>`
                            : `<span class="terminal-file terminal-link" data-link="${child.link}" data-path="${absPath}">${key}</span>`;
                        return `${perms} 1 junprog junprog ${size.padStart(5, " ")} ${dateStr} ${nameSpan}`;
                    }).join("<br>") + `</div>`;
                } else {
                    outputHtml = keys.map(key => {
                        let child;
                        if (key === "." || key === "..") {
                            child = { type: "dir", link: targetPath };
                        } else {
                            child = node.children[key];
                        }
                        const absPath = resolvePath(targetPath, key);
                        if (child.type === "dir") {
                            return `<span class="terminal-dir terminal-link" data-link="${child.link}" data-path="${absPath}">${key}/</span>`;
                        } else {
                            return `<span class="terminal-file terminal-link" data-link="${child.link}" data-path="${absPath}">${key}</span>`;
                        }
                    }).join("  ");
                }
            }
            addOutputHistory(outputHtml, true);
        } else if (node && node.type === "file") {
            const filename = targetPath.slice(targetPath.lastIndexOf("/") + 1);
            addOutputHistory(`<span class="terminal-file terminal-link" data-link="${node.link}" data-path="${targetPath}">${filename}</span>`, true);
        } else {
            const notFoundTarget = targetStrs.length > 0 ? targetStrs[0] : "";
            addOutputHistory(`ls: cannot access '${notFoundTarget}': No such file or directory`, false);
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
                if (current_path === targetPath) {
                    renderHistory();
                    clearInput();
                    return;
                }
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
        if (arg === "secret.txt") {
            const secretMsg = `
***************************************************
* Congratulations! You found the secret file!     *
* 📸 Keep snapping and keep coding! 💻            *
***************************************************`;
            addOutputHistory(secretMsg, false);
            renderHistory();
            clearInput();
            return;
        }

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
