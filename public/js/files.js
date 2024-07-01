let mdFile = null;
let originalContent = null;

function setFilename(name) {
    document.getElementById("fileName").innerText = name;
    document.querySelector("title").innerText = name;
}

function setFileEdited(value) {
    if (value) {
        document.getElementById("dot").classList.add("active");
    } else {
        document.getElementById("dot").classList.remove("active");
    }
}

window.bridge.fileOpened((e, file) => {
    console.log("File opened: ", file);
    const fileContent = file.content;

    setFilename(file.name);
    originalContent = file.content;
    mdFile = file;
    
    editor.setValue(file.content);
});

editor.on("change", () => {
    const content = editor.getValue();

    window.api.invoke("convertMDtoHTML", content).then((html) => {
        previewContent.innerHTML = html;
    });

    if (content !== originalContent) {
        mdFile.content = content;
        setFileEdited(true);
    } else {
        setFileEdited(false);
    }
});

window.bridge.requestFileSave((event, path, name) => {
    console.log("Save requested: ", path, name);
    window.api.invoke("saveFile", {
        file: mdFile,
        path: path,
        name: name
    });
    originalContent = mdFile.content;
    setFilename(name);
    setFileEdited(false);
});