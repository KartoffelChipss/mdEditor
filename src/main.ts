import { app, BrowserWindow, nativeTheme, nativeImage, protocol } from 'electron';
import logger from 'electron-log/main';
import { closeWindow, createWindow, getAllWindows } from './windowManager';
import fs from 'fs';
import { showOpenFileDialog } from "./dialog";
import { updateMenu } from './menus/appMenu';
import { addRecentFile } from "./store";
import path from 'path';
import 'dotenv/config';
import { updateTheme } from './theme';
import './ipcHandler';

export const devMode = process.env.NODE_ENV === 'development';

logger.transports.file.resolvePathFn = () => path.join(appRoot, "logs.log");
logger.transports.file.level = "info";

export const appRoot: string = path.join(`${app.getPath("appData") ?? "."}${path.sep}.mdEdit`);
if (!fs.existsSync(appRoot)) fs.mkdirSync(appRoot, { recursive: true });

const iconPath = path.resolve(path.join(__dirname + "/../public/img/logo.png"));

let fileDialogOpen = false;
let initialFile: string | null = null;

protocol.registerSchemesAsPrivileged([
    { scheme: "mdeditor", privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

app.on('ready', () => {
    logger.log(" ");
    logger.log("====== ======");
    logger.log("App Started!");
    if (devMode) logger.log("Running in development mode");
    logger.log("====== ======\n");

    let openedInitialFile = false;
    if (devMode && process.argv.length >= 3) initialFile = process.argv[2];
    if (!devMode && process.argv.length >= 2) initialFile = process.argv[1];

    logger.info("Arguments:", process.argv);

    logger.info("Starting mdEditor with initial file:", initialFile);

    if (process.platform === "darwin") app.dock.setIcon(nativeImage.createFromPath(iconPath));

    updateTheme();

    nativeTheme.on("updated", () => {
        updateTheme();
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

    app.on('activate', () => {
        // Only open the if there are no windows open and there is no initial file or the initial file was already opened
        if (BrowserWindow.getAllWindows().length === 0 && (!initialFile || openedInitialFile)) openFile();
    });

    updateMenu();

    if (!initialFile) openFile();
});

app.on('open-file', (event, filePath) => {
    logger.info("Opening file from event:", filePath);

    event.preventDefault();

    if (app.isReady()) {
        createWindow(filePath);
        addRecentFile(filePath);
    } else {
        initialFile = filePath;
    }
});

app.on('before-quit', (event) => {
    for (const window of getAllWindows()) {
        if (window) closeWindow(window);
    }
})

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