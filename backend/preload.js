const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('networkBridge', {
  sendData: (endpoint, data) => ipcRenderer.invoke('send-to-django', endpoint, data)
});
