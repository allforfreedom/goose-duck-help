const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    setBackground: (callback) => ipcRenderer.on('set-background', callback),
    onReset: (callback) => ipcRenderer.on('reset-all', callback), // 暴露重置事件
    getTemplates: () => ipcRenderer.invoke('get-templates') // 新增获取模板方法
});