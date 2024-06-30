import { app, BrowserWindow, ipcMain, Menu, MenuItem, MenuItemConstructorOptions, shell } from "electron";
import { createWindow, getPath } from "./windowManager";
import { openFile } from "./main";

const isMac = process.platform === "darwin";

const appMenuItem: MenuItemConstructorOptions = {
    label: app.name,
    submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
    ]
};

const appMenuTemplate: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' } (Mac only)
    isMac ? appMenuItem : {},
    // { role: 'fileMenu' }
    {
        label: 'File',
        submenu: [
            {
                label: 'New File',
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                    createWindow();
                }
            },
            {
                label: 'Open File',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    openFile();
                }
            },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                click: () => {
                    const focusedWindow = BrowserWindow.getFocusedWindow();
                    if (focusedWindow) {
                        const filePath = getPath(focusedWindow);
                        if (filePath) {
                            focusedWindow.webContents.send("requestFileSave", filePath);
                        }
                    }
                }
            },
            {
                label: 'Save As...',
                accelerator: 'CmdOrCtrl+Shift+S',
                click: () => {
                    // Add your save as logic here
                }
            },
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    // { role: 'editMenu' }
    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteAndMatchStyle' },
            { role: 'delete' },
            { role: 'selectAll' }
        ]
    },
    // { role: 'viewMenu' }
    {
        label: 'View',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },
    { role: 'windowMenu' },
    {
        label: 'Help',
        submenu: [
            {
                label: 'Learn More',
                click: async () => {
                    const { shell } = require('electron')
                    await shell.openExternal('https://electronjs.org')
                }
            }
        ]
    }
];

export default Menu.buildFromTemplate(appMenuTemplate);
