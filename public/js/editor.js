const editor = CodeMirror.fromTextArea(document.getElementById('editorTextarea'), {
    mode: 'markdown',
    lineNumbers: true,
    lineWrapping: true,
    styleActiveLine: true,
    matchBrackets: true,
    theme: "mdedit",
    extraKeys: { 'Enter': 'newlineAndIndentContinueMarkdownList' } // Enable list continuation
});

editor.on('contextmenu', function (editor, event) {
    event.preventDefault();

    const line = editor.lineAtHeight(event.y);
    const lineNumber = line + 1;

    window.api.invoke("showContextMenu", lineNumber, event.x, event.y);
});

window.bridge.setEditorSetting((event, setting, value) => {
    editor.setOption(setting, value);
});

window.api.invoke("getEditorSettings").then((settings) => {
    for (const setting in settings) {
        editor.setOption(setting, settings[setting]);
    }
});

window.bridge.formatEditor((event, format) => {
    switch (format) {
        case "copy":
            copySelection();
            break;
        case "cut":
            cutSelection();
            break;
        case "paste":
            pasteClipboard();
            break;
        case "code":
            insertCodeBlock(editor);
            break;
        case "math":
            insertMathBlock(editor);
            break;
        case "inline-code":
            formatInlineCode(editor);
            break;
        case "inline-math":
            formatInlineMath(editor);
            break;
        case "quote":
            formatQuote(editor);
            break;
        case "hr":
            insertHorizontalRule(editor);
            break;
        case "table":
            insertTable(editor);
            break;
        case "ul":
            formatList(editor, "unordered");
            break;
        case "ol":
            formatList(editor, "ordered");
            break;
        case "todo":
            formatList(editor, "todo");
            break
        case "bold":
            formatBold(editor);
            break;
        case "italic":
            formatItalic(editor);
            break;
        case "strikethrough":
            formatStrikethrough(editor);
            break;
        case "underline":
            formatUnderline(editor);
            break;
        case "h1":
            formatHeader(editor, 1);
            break;
        case "h2":
            formatHeader(editor, 2);
            break;
        case "h3":
            formatHeader(editor, 3);
            break;
        case "h4":
            formatHeader(editor, 4);
            break;
        case "h5":
            formatHeader(editor, 5);
            break;
        case "h6":
            formatHeader(editor, 6);
            break;
    }
});

function formatHeader(cm, level) {
    cm.operation(() => {
        let cursor = cm.getCursor();
        let line = cm.getLine(cursor.line);
        let header = "#".repeat(level) + " ";
        if (line.startsWith(header)) {
            cm.replaceRange(line.substring(level + 1), { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        } else {
            cm.replaceRange(header + line, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        }
    });
}

function formatText(cm, syntax) {
    cm.operation(() => {
        let selection = cm.getSelection();
        if (selection.startsWith(syntax) && selection.endsWith(syntax)) {
            cm.replaceSelection(selection.slice(syntax.length, -syntax.length));
        } else {
            cm.replaceSelection(syntax + selection + syntax);
        }
    });
}

function formatBold(cm) {
    formatText(cm, "**");
}

function formatItalic(cm) {
    formatText(cm, "*");
}

function formatStrikethrough(cm) {
    formatText(cm, "~~");
}

function formatUnderline(cm) {
    formatText(cm, "__");
}

function formatList(cm, type) {
    cm.operation(() => {
        let cursor = cm.getCursor();
        let line = cm.getLine(cursor.line);
        let prefix = "";

        switch (type) {
            case "unordered":
                prefix = "- ";
                break;
            case "ordered":
                prefix = "1. ";
                break;
            case "todo":
                prefix = "- [ ] ";
                break;
        }

        if (line.startsWith(prefix)) {
            cm.replaceRange(line.substring(prefix.length), { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        } else {
            cm.replaceRange(prefix + line, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        }
    });
}

function formatQuote(cm) {
    cm.operation(() => {
        let cursor = cm.getCursor();
        let line = cm.getLine(cursor.line);
        let prefix = "> ";

        if (line.startsWith(prefix)) {
            cm.replaceRange(line.substring(prefix.length), { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        } else {
            cm.replaceRange(prefix + line, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        }
    });
}

function insertHorizontalRule(cm) {
    cm.operation(() => {
        let cursor = cm.getCursor();
        cm.replaceRange("\n---\n", cursor);
    });
}

function insertTable(cm) {
    cm.operation(() => {
        let cursor = cm.getCursor();
        let table = "\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell 1 | Cell 2 | Cell 3 |\n| Cell 4 | Cell 5 | Cell 6 |\n";
        cm.replaceRange(table, cursor);
    });
}

function formatInlineCode(cm) {
    formatText(cm, "`");
}

function insertCodeBlock(cm) {
    cm.operation(() => {
        let cursor = cm.getCursor();
        let codeBlock = "\n```\n\n```\n";
        cm.replaceRange(codeBlock, cursor);
        cm.setCursor(cursor.line + 2, 0);
    });
}

function formatInlineMath(cm) {
    formatText(cm, "$");
}

function insertMathBlock(cm) {
    cm.operation(() => {
        let cursor = cm.getCursor();
        let mathBlock = "\n$$\n\n$$\n";
        cm.replaceRange(mathBlock, cursor);
        cm.setCursor(cursor.line + 2, 0);
    });
}

function copySelection() {
    const selection = editor.getSelection();
    navigator.clipboard.writeText(selection);
}

function cutSelection() {
    const selection = editor.getSelection();
    navigator.clipboard.writeText(selection);
    editor.replaceSelection("");
    editor.focus();
}

function pasteClipboard() {
    navigator.clipboard.readText().then((text) => {
        editor.replaceSelection(text);
        editor.focus();
    });
}