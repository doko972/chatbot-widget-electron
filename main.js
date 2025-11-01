const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow;
let normalBounds = { width: 480, height: 750 };

// ============================================
// Configuration des handlers IPC (GLOBAL)
// ============================================
function setupFullscreenHandlers() {
    ipcMain.on('toggle-fullscreen', (event, isFullscreen) => {
        if (!mainWindow) return;

        if (isFullscreen) {
            // Sauvegarder taille actuelle
            normalBounds = mainWindow.getBounds();

            // Obtenir taille écran
            const { width, height } = screen.getPrimaryDisplay().workAreaSize;

            // Appliquer plein écran
            mainWindow.setBounds({ x: 0, y: 0, width, height }, true);

            console.log('📺 Plein écran activé:', width + 'x' + height);
        } else {
            // Restaurer taille normale
            mainWindow.setBounds(normalBounds, true);

            console.log('🪟 Mode normal:', normalBounds.width + 'x' + normalBounds.height);
        }
    });

    // IPC : Fermer la fenêtre
    ipcMain.on('close-window', () => {
        console.log('🔴 Fermeture demandée');
        if (mainWindow) {
            mainWindow.close();
        }
    });

    // IPC : Minimiser la fenêtre
    ipcMain.on('minimize-window', () => {
        console.log('➖ Minimisation demandée');
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    // IPC : Maximiser/Restaurer
    ipcMain.on('maximize-window', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });
}

// ============================================
// Création de la fenêtre
// ============================================
function createWindow() {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const winWidth = normalBounds.width;
    const winHeight = normalBounds.height;
    const posX = width - winWidth - 20;
    const posY = height - winHeight - 20;

    mainWindow = new BrowserWindow({
        width: winWidth,
        height: winHeight,
        x: posX,
        y: posY + 30,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        opacity: 0,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false
        }
    });

    mainWindow.loadFile('index.html');

    // ✨ Animation d’apparition (fade + slide)
    mainWindow.once('ready-to-show', () => {
        let opacity = 0;
        let offsetY = 30;

        const fadeInterval = setInterval(() => {
            opacity += 0.05;
            offsetY -= 1;

            mainWindow.setOpacity(opacity);
            mainWindow.setPosition(posX, posY + offsetY);

            if (opacity >= 1) {
                mainWindow.setOpacity(1);
                mainWindow.setPosition(posX, posY);
                clearInterval(fadeInterval);
            }
        }, 20); // Animation fluide sur ~400ms
    });

    screen.on('display-metrics-changed', () => {
        const { width, height } = screen.getPrimaryDisplay().workAreaSize;
        mainWindow.setPosition(width - winWidth - 20, height - winHeight - 20);
    });

    console.log(`🚀 Fenêtre animée en bas à droite (${posX}, ${posY})`);
}


// ============================================
// Démarrage de l'application
// ============================================
app.whenReady().then(() => {
    // 📝 Logs de démarrage
    console.log('========================================');
    console.log('🤖 JARVIS');
    console.log('========================================');
    console.log('📁 App Path:', app.getAppPath());
    console.log('💻 Electron:', process.versions.electron);
    console.log('🌐 Chrome:', process.versions.chrome);
    console.log('⚙️  Node:', process.versions.node);
    console.log('🖥️  Platform:', process.platform);
    console.log('========================================');

    // Configurer les handlers IPC (UNE SEULE FOIS)
    setupFullscreenHandlers();

    // Créer la fenêtre
    createWindow();

    // macOS : Recréer fenêtre si cliqué dans le dock
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quitter l'app quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 🔧 Empêcher plusieurs instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
            }
            mainWindow.focus();
        }
    });
}