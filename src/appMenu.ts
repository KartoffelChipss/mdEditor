import { app, BrowserWindow, Menu, MenuItemConstructorOptions, clipboard, shell } from "electron";
import { createWindow, getAllWindows, getFocusedWindow, getPath, openFileInWindow, setPath } from "./windowManager";
import { openFile, appRoot } from "./main";
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
            { 
                role: 'about',
                label: 'About mdEditor'
            },
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
                                    store.set("lineNumbers", !store.get("lineNumbers"));
                                    for (const window of getAllWindows()) {
                                        window?.webContents.send("setEditorSetting", "lineNumbers", store.get("lineNumbers"));
                                    }
                                    updateMenu();
                                }
                            },
                            {
                                label: "Line Wrapping",
                                type: "checkbox",
                                checked: store.get("lineWrapping") as boolean,
                                click: () => {
                                    store.set("lineWrapping", !store.get("lineWrapping"));
                                    for (const window of getAllWindows()) {
                                        window?.webContents.send("setEditorSetting", "lineWrapping", store.get("lineWrapping"));
                                    }
                                    updateMenu();
                                }
                            },
                            {
                                label: "Active Line Indicator",
                                type: "checkbox",
                                checked: store.get("styleActiveLine") as boolean,
                                click: () => {
                                    store.set("styleActiveLine", !store.get("styleActiveLine"));
                                    for (const window of getAllWindows()) {
                                        window?.webContents.send("setEditorSetting", "styleActiveLine", store.get("styleActiveLine"));
                                    }
                                    updateMenu();
                                }
                            }
                        ]
                    }
                ]
            },
            { type: 'separator' },
            { role: 'services' },
            {
                label: "Developer",
                submenu: [
                    { role: 'toggleDevTools' },
                    { role: 'forceReload' },
                    {
                        label: "Open app folder",
                        click: () => {
                            shell.openPath(appRoot);
                        }
                    },
                    {
                        label: "Open config file",
                        click: () => {
                            store.openInEditor();
                        }
                    },
                ]
            },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            {
                role: 'quit',
                label: 'Quit mdEditor'
            }
        ]
    };
    
    const recentFilesMenuItems: MenuItemConstructorOptions[] = recentFiles.map((file, index) => {
        return {
            label: file.name.split(".")[0],
            click: () => {
                createWindow(file.path);
            }
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

    const formatMenu: MenuItemConstructorOptions = {
        label: "Format",
        submenu: [
            {
                label: "Headers",
                submenu: [
                    {
                        label: "Heading 1",
                        accelerator: "CmdOrCtrl+1",
                        click: () => {
                            getFocusedWindow()?.webContents.send("formatEditor", "h1");
                        }
                    },
                    {
                        label: "Heading 2",
                        accelerator: "CmdOrCtrl+2",
                        click: () => {
                            getFocusedWindow()?.webContents.send("formatEditor", "h2");
                        }
                    },
                    {
                        label: "Heading 3",
                        accelerator: "CmdOrCtrl+3",
                        click: () => {
                            getFocusedWindow()?.webContents.send("formatEditor", "h3");
                        }
                    },
                    {
                        label: "Heading 4",
                        accelerator: "CmdOrCtrl+4",
                        click: () => {
                            getFocusedWindow()?.webContents.send("formatEditor", "h4");
                        }
                    },
                    {
                        label: "Heading 5",
                        accelerator: "CmdOrCtrl+5",
                        click: () => {
                            getFocusedWindow()?.webContents.send("formatEditor", "h5");
                        }
                    },
                    {
                        label: "Heading 6",
                        accelerator: "CmdOrCtrl+6",
                        click: () => {
                            getFocusedWindow()?.webContents.send("formatEditor", "h6");
                        }
                    },
                ]
            },
            { type: 'separator' },
            {
                label: "Bold",
                accelerator: "CmdOrCtrl+B",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "bold");
                }
            },
            {
                label: "Italic",
                accelerator: "CmdOrCtrl+I",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "italic");
                }
            },
            {
                label: "Underline",
                accelerator: "Ctrl+CmdOrCtrl+U",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "underline");
                }
            },
            {
                label: "Strikethrough",
                accelerator: "Ctrl+CmdOrCtrl+S",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "strikethrough");
                }
            },
            { type: 'separator' },
            {
                label: "List",
                accelerator: "Ctrl+CmdOrCtrl+L",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "ul");
                }
            },
            {
                label: "Ordered List",
                accelerator: "Ctrl+CmdOrCtrl+O",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "ol");
                }
            },
            {
                label: "Todo",
                accelerator: "Ctrl+CmdOrCtrl+T",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "todo");
                }
            },
            { type: 'separator' },
            {
                label: "Quote",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "quote");
                }
            },
            {
                label: "Horizontal Rule",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "hr");
                }
            },
            {
                label: "Table",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "table");
                }
            },
            { type: 'separator' },
            {
                label: "Code",
                accelerator: "Ctrl+CmdOrCtrl+C",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "inline-code");
                }
            },
            {
                label: "Code Block",
                accelerator: "CmdOrCtrl+Shift+C",
                click: () => {
                    getFocusedWindow()?.webContents.send("formatEditor", "code");
                }
            },
        ]
    };
    
    const appMenuTemplate: MenuItemConstructorOptions[] = [
        isMac ? appMenuItem : {},
        fileMenu,
        editMenu,
        formatMenu,
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
