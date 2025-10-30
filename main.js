const { app, BrowserWindow, ipcMain, Menu, Tray, screen } = require('electron');
const path = require('path');

let mainWindow;
let tray = null;

// Configuration
const WINDOW_WIDTH = 400;
const WINDOW_HEIGHT = 600;

function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    
    mainWindow = new BrowserWindow({
        width: WINDOW_WIDTH,
        height: WINDOW_HEIGHT,
        x: width - WINDOW_WIDTH - 20,
        y: height - WINDOW_HEIGHT - 20,
        frame: false, // Sans bordures Windows
        transparent: true,
        resizable: true,
        alwaysOnTop: true, // Toujours visible
        skipTaskbar: false,
        roundedCorners: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png')
    });

    mainWindow.loadFile('index.html');

    // Ouvrir DevTools en développement
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Sauvegarder la position de la fenêtre
    mainWindow.on('moved', () => {
        const [x, y] = mainWindow.getPosition();
        // Vous pouvez sauvegarder la position dans un fichier de config
    });
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets/icon.png'));
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Afficher',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                }
            }
        },
        {
            label: 'Masquer',
            click: () => {
                if (mainWindow) {
                    mainWindow.hide();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Quitter',
            click: () => {
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Chatbot Widget');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
        if (mainWindow) {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
        mainWindow.minimize();
    }
});

ipcMain.handle('close-window', () => {
    if (mainWindow) {
        mainWindow.hide();
    }
});

ipcMain.handle('toggle-always-on-top', (event, flag) => {
    if (mainWindow) {
        mainWindow.setAlwaysOnTop(flag);
    }
});
