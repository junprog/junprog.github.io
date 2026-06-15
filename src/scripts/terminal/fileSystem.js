import { DIRECTORY_TREE } from './state.js';

export function resolvePath(current, target) {
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

export function findNode(path) {
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

export function fetchTerminalData() {
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
}
