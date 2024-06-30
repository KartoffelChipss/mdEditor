import { app, BrowserWindow, nativeTheme, dialog, OpenDialogOptions } from 'electron';
import logger from 'electron-log/main';
import store from './store';
import { createWindow } from './windowManager';

const devMode = process.env.NODE_ENV === 'development';

let fileDialogOpen = false;

app.on('ready', () => {
    console.log('Dark mode:', nativeTheme.shouldUseDarkColors);

    nativeTheme.on("updated", () => {
        console.log('Dark mode:', nativeTheme.shouldUseDarkColors);
    });

    openFileOrCreateNew();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        openFileOrCreateNew();
    }
});

async function openFileOrCreateNew() {
    if (fileDialogOpen) return;
    fileDialogOpen = true;

    const focusedWindow = BrowserWindow.getFocusedWindow();

    let dialogg = null;

    const dialogOptions: OpenDialogOptions = {
        title: 'Select a Markdown file',
        properties: ["openFile", "createDirectory"],
        filters: [
            { name: 'Markdown', extensions: ['md', 'markdown']}
        ],
        defaultPath: app.getPath('documents'),
    };

    if (focusedWindow) dialogg = await dialog.showOpenDialog(focusedWindow, dialogOptions);
    else dialogg = await dialog.showOpenDialog(dialogOptions);

    fileDialogOpen = false;

    // if (canceled) {
    //     const newFilePath = path.join(app.getPath('documents'), 'Untitled.md');
    //     createWindow(newFilePath);
    // } else if (filePaths && filePaths.length > 0) {
    //     createWindow(filePaths[0]);
    // }

    if (dialogg.canceled) return;
    else if (dialogg.filePaths && dialogg.filePaths.length > 0) createWindow(dialogg.filePaths[0]);
}