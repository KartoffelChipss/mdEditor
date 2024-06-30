import { app, BrowserWindow, nativeTheme, dialog, OpenDialogOptions, Menu, ipcMain } from 'electron';
import logger from 'electron-log/main';
import store from './store';
import appMenu from './appMenu';
import { createWindow, getPath } from './windowManager';
import fs from 'fs';

const devMode = process.env.NODE_ENV === 'development';

let fileDialogOpen = false;

app.on('ready', () => {
    console.log('Dark mode:', nativeTheme.shouldUseDarkColors);

    nativeTheme.on("updated", () => {
        console.log('Dark mode:', nativeTheme.shouldUseDarkColors);
    });

    ipcMain.handle("saveFile", async (event, file) => {
        logger.info("Saving file:", file);
        fs.writeFileSync(file.path, file.content);
    });

    Menu.setApplicationMenu(appMenu);

    openFile();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        openFile();
    }
});

export async function openFile() {
    if (fileDialogOpen) return;
    fileDialogOpen = true;

    const focusedWindow = BrowserWindow.getFocusedWindow();

    let dialogg = null;

    const dialogOptions: OpenDialogOptions = {
        title: 'Select a Markdown file',
        properties: ["openFile", "createDirectory"],
        filters: [
            { name: 'Markdown', extensions: ['md', 'markdown'] }
        ],
        defaultPath: app.getPath('documents'),
    };

    if (focusedWindow) dialogg = await dialog.showOpenDialog(focusedWindow, dialogOptions);
    else dialogg = await dialog.showOpenDialog(dialogOptions);

    fileDialogOpen = false;

    if (dialogg.canceled) return;
    else if (dialogg.filePaths && dialogg.filePaths.length > 0) createWindow(dialogg.filePaths[0]);
}