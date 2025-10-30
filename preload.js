const { contextBridge, ipcRenderer } = require('electron');

// Expose les API sécurisées au renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),
    toggleAlwaysOnTop: (flag) => ipcRenderer.invoke('toggle-always-on-top', flag)
});
