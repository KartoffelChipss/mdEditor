import {BrowserWindow, dialog, ipcMain, shell} from "electron";
import {getCalculatedTheme} from "./theme";
import logger from "electron-log/main";
import fs from "fs";
import {closeWindow, setPath} from "./windowManager";
import path, {basename} from "path";
import mdConverter from "./mdConverter";
import {showUnsavedChangesDialog} from "./dialog";
import {popUpContextMenu} from "./menus/contextMenu";
import {getStore} from "./store";

ipcMain.handle("getTheme", (event, data) => {
    return getCalculatedTheme();
});

ipcMain.handle("saveFile", async (event, data) => {
    try {
        logger.info("Saving file:", data.file + " to " + data.path);
        await fs.promises.writeFile(data.path, data.content);

        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) setPath(window, data.path);

        return {
            content: data.content,
            name: basename(data.path),
            path: data.path,
        };
    } catch (error) {
        logger.error("Error saving file:", error);
        dialog.showErrorBox("Error saving file", "An error occurred while saving the file. Please try again.");
        throw error;
    }
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

ipcMain.handle("showContextMenu", (event, data) => {
    popUpContextMenu();
});

ipcMain.handle("showUnsavedChangesDialog", async (event, data) => {
    const action = await showUnsavedChangesDialog();

    if (action === "save") {
        try {
            logger.info("Saving file:", data.file + " to " + data.path);
            await fs.promises.writeFile(data.path, data.content);

            const window = BrowserWindow.fromWebContents(event.sender);
            if (window) closeWindow(window);

        } catch (error) {
            logger.error("Error saving file:", error);
            dialog.showErrorBox("Error saving file", "An error occurred while saving the file. Please try again.");
            throw error;
        }
    }

    if (action === "discard") {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window) closeWindow(window);
        return;
    }

    if (action === "cancel") return;
});

ipcMain.handle("close", (event, data) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) closeWindow(window);
});