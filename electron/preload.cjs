const { contextBridge, ipcRenderer } = require("electron")

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args)

contextBridge.exposeInMainWorld("artcamera", {
  setFullscreen: (enabled) => invoke("artcamera:setFullscreen", Boolean(enabled)),
  isFullscreen: () => invoke("artcamera:isFullscreen"),
  quit: () => invoke("artcamera:quit"),
})
