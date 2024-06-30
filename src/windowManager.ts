import { BrowserWindow } from "electron";
import logger from "electron-log";
import path from "path";
import store from "./store";
import fs from "fs";

const windows: { [key: string]: BrowserWindow } = {};

export function createWindow(filePath: string | null = null) {
    if (filePath && windows[filePath]) {
        windows[filePath].focus();
        return;
    }

    logger.info("Opening window for file:", filePath);

    const mainWindow = new BrowserWindow({
        width: 1300,
        height: 800,
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

    mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

    mainWindow.on("move", () => store.set(`windowPosition`, mainWindow.getBounds()));
    mainWindow.on("resize", () => store.set(`windowPosition`, mainWindow.getBounds()));

    mainWindow.on("closed", () => {
        if (filePath) delete windows[filePath];
    });

    if (filePath) {
        windows[filePath] = mainWindow;

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                logger.error("Failed to read file:", err);
                return;
            }

            logger.info("Sending file data to window:", filePath);

            mainWindow.webContents.send('fileOpened', data);
            mainWindow.show();
        });
    }
}