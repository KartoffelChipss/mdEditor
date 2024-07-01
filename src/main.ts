import { app, BrowserWindow, nativeTheme, shell, ipcMain } from 'electron';
import logger from 'electron-log/main';
import { createWindow, getPath } from './windowManager';
import fs from 'fs';
import { showOpenFileDialog } from "./dialog";
import { updateMenu } from './appMenu';
import { addRecentFile } from "./store";
import mdConverter from './mdConverter';

const devMode = process.env.NODE_ENV === 'development';

let fileDialogOpen = false;

app.on('ready', () => {
    console.log('Dark mode:', nativeTheme.shouldUseDarkColors);

    nativeTheme.on("updated", () => {
        console.log('Dark mode:', nativeTheme.shouldUseDarkColors);
    });

    ipcMain.handle("saveFile", async (event, data) => {
        logger.info("Saving file:", data.file + " to " + data.path);
        fs.writeFileSync(data.path, data.file.content);
    });

    ipcMain.handle("convertMDtoHTML", (event, data) => {
        return mdConverter.makeHtml(data);
    });

    ipcMain.handle("openLink", (event, data) => {
        logger.info("Opening link:", data);
        shell.openExternal(data);
    });

    app.setAboutPanelOptions({
        applicationName: "mdEditor",
        applicationVersion: app.getVersion(),
        version: "",
        authors: ["Jan Straßburger (Kartoffelchipss)"],
        website: "https://strassburger.org/",
        copyright: "© 2024 Jan Straßburger"
    });

    updateMenu();

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

    const filePath = await showOpenFileDialog();

    fileDialogOpen = false;

    if (filePath) {
        createWindow(filePath);
        addRecentFile(filePath);
    }
}