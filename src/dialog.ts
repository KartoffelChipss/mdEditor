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

/**
 * Show a dialog to ask the user if they want to save their unsaved changes
 * @returns 'save' if the user wants to save, 'discard' if the user wants to discard, 'cancel' if the user wants to cancel
 */
export async function showUnsavedChangesDialog(): Promise<'save' | 'discard' | 'cancel'> {
    const result = await dialog.showMessageBox({
        type: 'warning',
        buttons: ['Save', 'Discard', 'Cancel'],
        defaultId: 0,
        title: 'Unsaved changes',
        message: 'You have unsaved changes. Do you want to save them?',
    });

    if (result.response == 0) return 'save';
    else if (result.response == 1) return 'discard';
    else return 'cancel';
}