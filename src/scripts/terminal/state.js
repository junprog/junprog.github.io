export const DIRECTORY_TREE = {
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
            "playground": { type: "dir", link: "/posts/playground/" }
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

export let current_path = "~";
export let historyList = [];
export let historyIndex = -1;
export let tempInput = "";
export const MAX_HISTORY = 50;

export function initCurrentPath(path) { current_path = path; }
export function setTempInput(input) { tempInput = input; }
export function setHistoryIndex(index) { historyIndex = index; }

export function getHistory() {
    try {
        const hist = sessionStorage.getItem("terminal_history");
        return hist ? JSON.parse(hist) : [];
    } catch (e) {
        return [];
    }
}

export function initializeHistory() {
    historyList = getHistory();
    resetHistoryIndex();
}

export function saveHistory() {
    sessionStorage.setItem("terminal_history", JSON.stringify(historyList));
}

export function resetHistoryIndex() {
    const inputCommands = historyList.filter(item => item.type === "input");
    historyIndex = inputCommands.length;
    tempInput = "";
}

export function limitHistory() {
    if (historyList.length > MAX_HISTORY) {
        historyList = historyList.slice(historyList.length - MAX_HISTORY);
    }
}

export function appendToHistory(item) {
    historyList.push(item);
}

export function clearHistoryList() {
    historyList = [];
}
