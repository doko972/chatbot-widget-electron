// preload.js - Script de préchargement pour la sécurité Electron

const { contextBridge, ipcRenderer } = require('electron');

// 🔐 Expose des fonctions sécurisées au renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Fermer la fenêtre
  closeWindow: () => {
    console.log('📤 closeWindow');
    ipcRenderer.send('close-window');
  },
  
  // Minimiser la fenêtre
  minimizeWindow: () => {
    console.log('📤 minimizeWindow');
    ipcRenderer.send('minimize-window');
  },
  
  // Maximiser/Restaurer
  maximizeWindow: () => {
    console.log('📤 maximizeWindow');
    ipcRenderer.send('maximize-window');
  },
  
  // 🔥 Toggle Fullscreen
  toggleFullscreen: (isFullscreen) => {
    console.log('📤 toggleFullscreen:', isFullscreen);
    ipcRenderer.send('toggle-fullscreen', isFullscreen);
  },
  
  // Obtenir la version de l'app
  getVersion: () => process.versions.electron,
  
  // Obtenir la plateforme
  getPlatform: () => process.platform
});

console.log('✅ Preload script chargé avec toutes les fonctions');