import { app, BrowserWindow, Menu, MenuItem, MenuItemConstructorOptions, clipboard, shell } from "electron";
import { createWindow, getPath, openFileInWindow, setPath } from "./windowManager";
import { openFile } from "./main";
import { showSaveFileDialog } from "./dialog";
import path, { basename } from "path";
import { addRecentFile, clearRecentFiles, getRecentFiles } from "./store";

const isMac = process.platform === "darwin";

export function updateMenu() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const recentFiles = getRecentFiles();

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
    
    const recentFilesMenuItems: MenuItemConstructorOptions[] = recentFiles.map((file, index) => {
        return {
            label: file.name.split(".")[0],
            click: () => {
                createWindow(file.path);
            },
            accelerator: `CmdOrCtrl+${index + 1}`,
        }
    });

    let recentMenuItem: MenuItemConstructorOptions = {
        label: 'Open Recent',
        submenu: recentFilesMenuItems,
    };

    if (recentFiles.length === 0) recentFilesMenuItems.push({ label: 'No recent files', enabled: false });
    recentFilesMenuItems.push({ type: 'separator' });
    recentFilesMenuItems.push({ 
        label: 'Clear Recent',
        click: () => {
            clearRecentFiles();
            updateMenu();
        },
    });
    
    const fileMenu: MenuItemConstructorOptions = {
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
            recentMenuItem,
            { type: 'separator' },
            isMac ? { role: 'close', label: "Close" } : { role: 'quit' },
            {
                label: 'Save',
                accelerator: 'CmdOrCtrl+S',
                id: 'save',
                enabled: focusedWindow ? true : false,
                click: () => {
                    const focusedWindow = BrowserWindow.getFocusedWindow();
                    if (focusedWindow) {
                        const filePath = getPath(focusedWindow);
                        if (filePath) {
                            focusedWindow.webContents.send("requestFileSave", filePath, basename(filePath));
                        } else {
                            showSaveFileDialog().then((filePath) => {
                                if (filePath) {
                                    focusedWindow.webContents.send("requestFileSave", filePath, basename(filePath));
                                    addRecentFile(filePath);
                                    updateMenu();
                                }
                            });
                        }
                    }
                }
            },
            {
                label: 'Save As...',
                accelerator: 'CmdOrCtrl+Shift+S',
                id: 'saveAs',
                enabled: focusedWindow ? true : false,
                click: () => {
                    const focusedWindow = BrowserWindow.getFocusedWindow();
                    if (focusedWindow) {
                        showSaveFileDialog().then((filePath) => {
                            if (!filePath) return;
                            setPath(focusedWindow, filePath);
                            focusedWindow.webContents.send("requestFileSave", filePath, basename(filePath));
                            addRecentFile(filePath);
                            updateMenu();
                        });
                    }
                }
            },
            { type: 'separator' },
            {
                label: "Reveal in Finder",
                enabled: focusedWindow ? true : false,
                accelerator: "Option+CmdOrCtrl+R",
                click: () => {
                    const focusedWindow = BrowserWindow.getFocusedWindow();
                    if (focusedWindow) {
                        const filePath = getPath(focusedWindow);
                        if (filePath) shell.showItemInFolder(filePath);
                    }
                }
            },
            { 
                label: "Copy Path",
                submenu: [
                    {
                        label: "File Path",
                        accelerator: "CmdOrCtrl+Shift+F",
                        enabled: focusedWindow ? true : false,
                        click: () => {
                            const focusedWindow = BrowserWindow.getFocusedWindow();
                            if (focusedWindow) {
                                const filePath = getPath(focusedWindow);
                                if (filePath) {
                                    clipboard.writeText(filePath);
                                }
                            }
                        }
                    },
                    {
                        label: "Folder Path",
                        enabled: focusedWindow ? true : false,
                        click: () => {
                            const focusedWindow = BrowserWindow.getFocusedWindow();
                            if (focusedWindow) {
                                const filePath = getPath(focusedWindow);
                                if (filePath) clipboard.writeText(path.dirname(filePath));
                            }
                        }
                    }
                ]
            }
        ]
    };
    
    const editMenu: MenuItemConstructorOptions = {
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
    };
    
    const appMenuTemplate: MenuItemConstructorOptions[] = [
        isMac ? appMenuItem : {},
        fileMenu,
        editMenu,
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    enabled: focusedWindow ? true : false,
                    click: async () => {
                        const focusedWindow = BrowserWindow.getFocusedWindow();
                        if (focusedWindow) {
                            focusedWindow.reload();
                            setTimeout(() => {
                                const filePath = getPath(focusedWindow);
                                if (filePath) openFileInWindow(filePath, focusedWindow);
                            }, 100);
                        }
                    }
                },
                // {
                //     label: 'Force Reload',
                //     accelerator: 'CmdOrCtrl+Shift+R',
                //     enabled: focusedWindow ? true : false,
                //     click: async () => {
                //         const focusedWindow = BrowserWindow.getFocusedWindow();
                //         if (focusedWindow) {
                //             focusedWindow.reload();
                //             setTimeout(() => {
                //                 const filePath = getPath(focusedWindow);
                //                 if (filePath) openFileInWindow(filePath, focusedWindow);
                //             }, 100);
                //         }
                //     }
                // },
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

    const menu = Menu.buildFromTemplate(appMenuTemplate);

    Menu.setApplicationMenu(menu);
}

app.on('browser-window-focus', updateMenu);
app.on('browser-window-blur', updateMenu);
