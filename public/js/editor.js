const editor = CodeMirror.fromTextArea(document.getElementById('editorTextarea'), {
    mode: 'markdown',
    lineNumbers: true,
    lineWrapping: true,
    styleActiveLine: true,
    matchBrackets: true,
    theme: "mdedit",
    extraKeys: { 'Enter': 'newlineAndIndentContinueMarkdownList' } // Enable list continuation
});

window.bridge.setEditorSetting((event, setting, value) => {
    editor.setOption(setting, value);
});

window.api.invoke("getEditorSettings").then((settings) => {
    for (const setting in settings) {
        editor.setOption(setting, settings[setting]);
    }
});