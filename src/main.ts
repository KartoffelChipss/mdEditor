import { app, BrowserWindow, nativeTheme } from 'electron';
import path from 'path';

const shouldUseDarkMode = nativeTheme.shouldUseDarkColors;

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: "#101215",
        darkTheme: true,
        frame: false,
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 15, y: 15 },
        roundedCorners: true,
        hasShadow: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile(path.join(__dirname, '../public/index.html'));
}

app.on('ready', () => {
    console.log('Dark mode:', shouldUseDarkMode);

    nativeTheme.on("updated", () => {
        console.log('Dark mode:', nativeTheme.shouldUseDarkColors);
    });

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
