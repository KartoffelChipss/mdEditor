import { app, BrowserWindow, nativeTheme, shell, ipcMain, nativeImage } from 'electron';
import logger from 'electron-log/main';
import { createWindow, getPath } from './windowManager';
import fs from 'fs';
import { showOpenFileDialog } from "./dialog";
import { updateMenu } from './appMenu';
import { addRecentFile, getStore } from "./store";
import mdConverter from './mdConverter';
import path from 'path';
import 'dotenv/config';
import { getCalculatedTheme, getTheme, updateTheme } from './theme';

const devMode = process.env.NODE_ENV === 'development';

if (devMode) {
    console.log("====== ======");
    console.log("Started in devmode!");
    console.log("====== ======\n");
}

const appRoot = path.join(`${app.getPath("appData") ?? "."}${path.sep}.mdEdit`);
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, { recursive: true });

logger.transports.file.resolvePathFn = () => path.join(appRoot, "logs.log");
logger.transports.file.level = "info";

const iconPath = path.resolve(path.join(__dirname + "/../public/img/logo.png"));

let fileDialogOpen = false;

app.on('ready', () => {
    let initialFile: string | null = null;
    let openedInitialFile = false;
    if (devMode && process.argv.length >= 2 ) initialFile = process.argv[2];
    if (!devMode && process.argv.length >= 2) initialFile = process.argv[1];

    if (process.platform === "darwin") app.dock.setIcon(nativeImage.createFromPath(iconPath));

    updateTheme();

    nativeTheme.on("updated", () => {
        updateTheme();
    });

    ipcMain.handle("getTheme", (event, data) => {
        return getCalculatedTheme();
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

    ipcMain.handle("openLinkInFinder", (event, data) => {
        const basePath = path.dirname(data.path);
        const fullPath = path.resolve(basePath, data.url);

        logger.info("Reveal in Finder:", fullPath);
        shell.showItemInFolder(fullPath);
    });

    ipcMain.handle("getEditorSettings", (event, data) => {
        return {
            lineNumbers: getStore().get("lineNumbers"),
            lineWrapping: getStore().get("lineWrapping"),
            styleActiveLine: getStore().get("styleActiveLine"),
        }
    });

    app.setAboutPanelOptions({
        applicationName: "mdEditor",
        applicationVersion: app.getVersion(),
        version: "",
        authors: ["Jan Straßburger (Kartoffelchipss)"],
        website: "https://strassburger.org/",
        copyright: "© 2024 Jan Straßburger",
        iconPath: iconPath,
    });

    if (initialFile) {
        logger.info("Opening initial file:", initialFile);
        createWindow(initialFile);
        addRecentFile(initialFile);
        openedInitialFile = true;
    }

    app.on('open-file', (event, filePath) => {
        event.preventDefault();

        logger.info("Opening file:", filePath);
    
        createWindow(filePath);
        addRecentFile(filePath);
    });

    app.on('activate', () => {
        // Only open the if there are no windows open and there is no initial file or the initial file was already opened
        if (BrowserWindow.getAllWindows().length === 0 && (!initialFile || openedInitialFile)) openFile();
    });

    updateMenu();

    if (!initialFile) openFile();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
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