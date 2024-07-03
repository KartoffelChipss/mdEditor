import { app, BrowserWindow, Menu, MenuItemConstructorOptions, clipboard, shell } from "electron";
import { createWindow, getPath, openFileInWindow, setPath } from "./windowManager";
import { openFile } from "./main";
import { showSaveFileDialog } from "./dialog";
import path, { basename } from "path";
import { addRecentFile, clearRecentFiles, getRecentFiles, getStore } from "./store";
import { setTheme } from "./theme";

const isMac = process.platform === "darwin";

export function updateMenu() {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    const recentFiles = getRecentFiles();
    const store = getStore();

    const appMenuItem: MenuItemConstructorOptions = {
        label: app.name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            {
                label: "Preferences",
                accelerator: "CmdOrCtrl+,",
                submenu: [
                    {
                        label: "Theme",
                        submenu: [
                            {
                                label: "System",
                                type: "radio",
                                checked: store.get("theme") === "system",
                                click: () => {
                                    setTheme("system");
                                    updateMenu();
                                }
                            },
                            {
                                label: "Dark",
                                type: "radio",
                                checked: store.get("theme") === "dark",
                                click: () => {
                                    setTheme("dark");
                                    updateMenu();
                                }
                            },
                            {
                                label: "Light",
                                type: "radio",
                                checked: store.get("theme") === "light",
                                click: () => {
                                    setTheme("light");
                                    updateMenu();
                                }
                            }
                        ]
                    },
                    {
                        label: "Editor",
                        submenu: [
                            {
                                label: "Line Numbers",
                                type: "checkbox",
                                checked: store.get("lineNumbers") as boolean,
                                click: () => {
                                    console.log("Line Numbers");
                                    store.set("lineNumbers", !store.get("lineNumbers"));
                                    updateMenu();
                                }
                            },
                            {
                                label: "Line Wrapping",
                                type: "checkbox",
                                checked: store.get("lineWrapping") as boolean,
                                click: () => {
                                    console.log("Line Wrapping");
                                    store.set("lineWrapping", !store.get("lineWrapping"));
                                    updateMenu();
                                }
                            }
                        ]
                    }
                ]
            },
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
