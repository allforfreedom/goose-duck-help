const { app, BrowserWindow, clipboard, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// 新增配置加载方法
const loadTemplates = () => {
    try {
        const configPath = path.join(__dirname, 'config.json');
        const rawData = fs.readFileSync(configPath);
        return JSON.parse(rawData).templates;
    } catch (error) {
        console.error('加载配置文件失败:', error);
        return {}; // 返回空配置防止崩溃
    }
};

const createWindow = () => {
    const win = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        width: 1930,
        height: 1176
    });

    const menu = Menu.buildFromTemplate([
        {
            label: app.name,
            submenu: [
                {
                    label: '插入图片',
                    click: () => {
                        const img = clipboard.readImage();
                        if (!img.isEmpty()) {
                            img.resize({ width: 1936, height: 1119 });
                            win.webContents.send('set-background', img.toDataURL());
                        }
                    }
                },
                // index.js 修改菜单项
                {
                    click: () => win.webContents.send('reset-all'),
                    label: '重置', // 更明确的提示
                }
            ]
        }
    ]);

    Menu.setApplicationMenu(menu);
    win.loadFile('index.html');

    // 添加模板获取处理
    ipcMain.handle('get-templates', () => loadTemplates());
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});