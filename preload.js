// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onTaskbarInfo: (callback) => ipcRenderer.on('taskbar-info', (_event, value) => callback(value))
});
