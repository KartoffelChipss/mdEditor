import { BrowserWindow } from "electron";
import logger from "electron-log";
import path from "path";
import store from "./store";
import fs from "fs";

const windows: { [key: string]: BrowserWindow } = {};

export function getWindow(filePath: string) {
    return windows[filePath];
}

export function getPath(window: BrowserWindow) {
    return Object.keys(windows).find(key => windows[key] === window);
}

export function createWindow(filePath: string | null = null) {
    if (filePath && windows[filePath]) {
        windows[filePath].focus();
        return;
    }

    logger.info("Opening window for file:", filePath);

    const mainWindow = new BrowserWindow({
        width: store.get("windowPosition.width") ?? 1300,
        height: store.get("windowPosition.height") ?? 800,
        backgroundColor: "#101215",
        darkTheme: true,
        frame: false,
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 15, y: 15 },
        roundedCorners: true,
        hasShadow: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const fileLoaded = mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

    mainWindow.on("move", () => store.set(`windowPosition`, mainWindow.getBounds()));
    mainWindow.on("resize", () => store.set(`windowPosition`, mainWindow.getBounds()));

    mainWindow.on("closed", () => {
        if (filePath) delete windows[filePath];
    });

    if (filePath) {
        windows[filePath] = mainWindow;

        fs.readFile(filePath, 'utf-8', async (err, data) => {
            if (err) {
                logger.error("Failed to read file:", err);
                return;
            }

            await fileLoaded;

            logger.info("Sending file data to window:", filePath);

            const fileName = path.basename(filePath);

            mainWindow.webContents.send('fileOpened', {
                path: filePath,
                name: fileName,
                content: data,
            });
            mainWindow.show();
        });
    } else {
        mainWindow.show();
    }
}