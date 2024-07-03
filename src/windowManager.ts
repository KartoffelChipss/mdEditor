import { BrowserWindow } from "electron";
import logger from "electron-log";
import path from "path";
import { getStore } from "./store";
import fs from "fs";
import { updateMenu } from "./appMenu";
import { updateTheme } from "./theme";

const windows: { [key: string]: BrowserWindow } = {};

export function getWindow(filePath: string) {
    return windows[filePath];
}

export function getPath(window: BrowserWindow) {
    return Object.keys(windows).find(key => windows[key] === window);
}

export function setPath(window: BrowserWindow, filePath: string) {
    const oldPath = getPath(window);
    if (oldPath) delete windows[oldPath];
    windows[filePath] = window;
}

export function getFocusedWindow(): BrowserWindow | null {
    return BrowserWindow.getFocusedWindow();
}

export function getAllWindows(): (BrowserWindow | null)[] {
    return BrowserWindow.getAllWindows();
}

export function createWindow(filePath: string | null = null) {
    if (filePath && windows[filePath]) {
        windows[filePath].focus();
        return;
    }

    logger.info("Opening window for file:", filePath);

    const mainWindow = new BrowserWindow({
        width: getStore().get("windowPosition.width") ?? 1300,
        height: getStore().get("windowPosition.height") ?? 800,
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

    mainWindow.on("move", () => getStore().set(`windowPosition`, mainWindow.getBounds()));
    mainWindow.on("resize", () => getStore().set(`windowPosition`, mainWindow.getBounds()));

    mainWindow.on("closed", () => {
        if (filePath) delete windows[filePath];
        updateMenu();
    });

    mainWindow.on("enter-full-screen", () => mainWindow.webContents.send("fullscreenChanged", true));
    mainWindow.on("leave-full-screen", () => mainWindow.webContents.send("fullscreenChanged", false));

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

export function openFileInWindow(filePath: string, window: BrowserWindow) {
    fs.readFile(filePath, 'utf-8', async (err, data) => {
        if (err) {
            logger.error("Failed to read file:", err);
            return;
        }

        logger.info("Sending file data to window:", filePath);

        const fileName = path.basename(filePath);

        window.webContents.send('fileOpened', {
            path: filePath,
            name: fileName,
            content: data,
        });
        window.show();
    });
}