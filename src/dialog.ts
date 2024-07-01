import { app, dialog } from "electron";

/**
 * Open a file dialog
 * @returns The path of the file selected by the user or null if no file was selected or the dialog was cancelled
 */
export async function showOpenFileDialog(): Promise<string | null> {
    const result = await dialog.showOpenDialog({
        title: 'Select a Markdown file',
        properties: ["openFile", "createDirectory"],
        filters: [
            { name: 'Markdown', extensions: ['md', 'markdown'] }
        ],
        defaultPath: app.getPath('documents'),
    });

    if (result.canceled || !result.filePaths || result.filePaths.length < 1 || !result.filePaths[0]) return null;

    return result.filePaths[0];
}

/**
 * Save a file dialog
 * @returns The path of the file selected by the user or null if no file was selected or the dialog was cancelled
 */
export async function showSaveFileDialog(): Promise<string | null> {
    const result = await dialog.showSaveDialog({
        title: 'Save Markdown file',
        properties: ["createDirectory"],
        filters: [
            { name: 'Markdown', extensions: ['md', 'markdown'] }
        ],
        defaultPath: app.getPath('documents'),
    });

    if (result.canceled || !result.filePath || !result.filePath) return null;

    return result.filePath;
}