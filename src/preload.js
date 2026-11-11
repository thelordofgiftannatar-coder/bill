const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('nightcity', {
  vault: {
    list: (cat, opts) => ipcRenderer.invoke('vault:list', cat, opts),
    stats: () => ipcRenderer.invoke('vault:stats'),
    root: () => ipcRenderer.invoke('vault:root'),
    import: (cat) => ipcRenderer.invoke('vault:import', cat),
    importFolder: (cat) => ipcRenderer.invoke('vault:importFolder', cat),
    drop: (cat, files) => ipcRenderer.invoke('vault:drop', cat, [...files].map(f => webUtils.getPathForFile(f))),
    openFolder: (cat) => ipcRenderer.invoke('vault:open', cat),
    show: () => ipcRenderer.invoke('vault:show'),
  },
});
