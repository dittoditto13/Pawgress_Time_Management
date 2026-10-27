const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('networkBridge', {
  sendData: (data) => ipcRenderer.invoke('send-to-django', data)
});
