const theme = localStorage.getItem('theme');
if (theme === "dark") {
    document.documentElement.setAttribute('data-theme', 'dark');
}

function modeSwitcher() {
    const currentMode = document.documentElement.getAttribute('data-theme');
    if (currentMode === "dark") {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
}