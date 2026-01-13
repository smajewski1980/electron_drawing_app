const { ipcRenderer, contextBridge } = require("electron/renderer");

contextBridge.exposeInMainWorld("saveImage", {
  saveImage: (channel, data) => ipcRenderer.invoke(channel, data),
});
