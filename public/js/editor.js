const editor = CodeMirror.fromTextArea(document.getElementById('editorTextarea'), {
    mode: 'markdown',
    lineNumbers: true,
    lineWrapping: true,
    styleActiveLine: true,
    matchBrackets: true,
    theme: "mdedit",
    extraKeys: { 'Enter': 'newlineAndIndentContinueMarkdownList' } // Enable list continuation
});