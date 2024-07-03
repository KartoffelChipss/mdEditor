const root = document.querySelector(":root");

function setProperty(name, value) {
    root.style.setProperty(name, value);
}

function updateTheme(theme) {
    console.log("Setting theme: ", theme);
    if (theme === "light") {
        setProperty('--color-scheme', 'light');
        setProperty('--font-color', '#000');
        setProperty('--font-color-dark', '#222');
        setProperty('--accent-color-1', '#304e75');
        setProperty('--accent-color-2', '#8abffa');
        setProperty('--bg-1', '#ffffff');
        setProperty('--bg-2', '#f2eff2');
        setProperty('--bg-3', '#f5f6f8');
        setProperty("--button-active", "rgba(0, 0, 0, 0.1)");
        document.getElementById("editor-btn").querySelector("img").src = "img/icons/light/edit.svg";
        document.getElementById("splitview-btn").querySelector("img").src = "img/icons/light/splitview.svg";
        document.getElementById("preview-btn").querySelector("img").src = "img/icons/light/preview.svg";
        document.getElementById("previewContent").dataset.theme = "light";
    } else if (theme === "dark") {
        setProperty('--color-scheme', 'dark');
        setProperty('--font-color', '#e9e9e9');
        setProperty('--font-color-dark', '#aaafb6');
        setProperty('--accent-color-1', '#8abffa');
        setProperty('--accent-color-2', '#304e75');
        setProperty('--bg-1', '#101215');
        setProperty('--bg-2', '#171b22');
        setProperty('--bg-3', '#181c21');
        setProperty("--button-active", "rgba(0, 0, 0, 0.3)");
        document.getElementById("editor-btn").querySelector("img").src = "img/icons/dark/edit.svg";
        document.getElementById("splitview-btn").querySelector("img").src = "img/icons/dark/splitview.svg";
        document.getElementById("preview-btn").querySelector("img").src = "img/icons/dark/preview.svg";
        document.getElementById("previewContent").dataset.theme = "dark";
    }
}

window.api.invoke("getTheme").then((theme) => updateTheme(theme));

window.bridge.setTheme((e, theme) => updateTheme(theme));