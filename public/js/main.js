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

previewContent.addEventListener('click', function (event) {
    let target = event.target;

    // Find the closest link
    while (target && target.tagName !== 'A') {
        target = target.parentElement;
    }

    if (target && target.tagName === 'A') {
        const url = target.getAttribute('href');

        if (url.startsWith('#')) {
            event.preventDefault();
            const id = url.substring(1).replaceAll("-", ""); // Remove the # and replace all - with empty string
            console.log("Scrolling to: ", id);
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        } else {
            event.preventDefault();
            window.api.openExternalLink(url);
        }
    }
});