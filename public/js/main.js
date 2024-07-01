const editorSection = document.getElementById("editor");
const previewSection = document.getElementById("preview");
const previewContent = document.getElementById("previewContent");
const viewButtons = document.querySelectorAll("header .right .buttons button");

function setView(viewmode) {
    viewButtons.forEach((button) => {
        button.classList.remove("active");
    });

    document.getElementById(`${viewmode}-btn`).classList.add("active");

    if (viewmode === "editor") {
        editorSection.classList.add("active");
        editorSection.style.width = "100%";
        previewSection.classList.remove("active");
        previewSection.style.width = "0%";
    } else if (viewmode === "preview") {
        editorSection.classList.remove("active");
        editorSection.style.width = "0%";
        previewSection.classList.add("active");
        previewSection.style.width = "100%";
    } else {
        editorSection.classList.add("active");
        editorSection.style.width = "50%";
        previewSection.classList.add("active");
        previewSection.style.width = "50%";
    }
}

window.bridge.fullscreenChanged((e, fullscreen) => {
    if (fullscreen) document.querySelector("header").classList.add('fullscreen');
    else document.querySelector("header").classList.remove('fullscreen');
});