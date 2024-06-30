let mdFile = null;
let originalContent = null;

window.bridge.fileOpened((e, file) => {
    console.log("File opened: ", file);
    const fileContent = file.content;

    document.getElementById("fileName").innerText = file.name;
    document.querySelector("title").innerText = file.name;
    originalContent = file.content;
    mdFile = file;
    
    editor.setValue(file.content);
});

editor.on("change", () => {
    const content = editor.getValue();
    if (content !== originalContent) {
        mdFile.content = content;
        document.getElementById("dot").classList.add("active");
    } else {
        document.getElementById("dot").classList.remove("active");
    }
});

window.bridge.requestFileSave((event, message) => {
    window.api.invoke("saveFile", mdFile);
    originalContent = mdFile.content;
    document.getElementById("dot").classList.remove("active");
});