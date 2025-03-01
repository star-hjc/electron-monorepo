const { app, BrowserWindow } = require('electron')
const electronLog = require('electron-log');
const path = require('path')
const { existsSync, mkdirSync } = require('fs');

module.exports = {
    createMainWindow
}

function initApplication() {
    console.log(process.env.PASSWORD);
}

function initLogFolder() {
    /** 验证日志文件夹是否存在 */
    const logFolderPath = path.join(process.cwd(), `/resources/log`)
    if (!existsSync(logFolderPath)) mkdirSync(logFolderPath)
}

function initElectronLog() {
    Object.assign(console, electronLog.functions);
}

function createMainWindow() {
    const win = new BrowserWindow({
        /** 隐藏菜单 */
        width: 850,
        height: 830,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(app.getAppPath(), '/preload/index.js'),
            nodeIntegration: true
        },
        title: 'xxx',
        icon: path.join(app.getAppPath(), '/icons/icon.ico')
    })

    win.loadURL(app.isPackaged ? `file://${path.join(app.getAppPath(), '/.out/renderer/index.html')}` : `http://localhost:5173/`)

    win.on('close', async () => {
        console.log(win.id)
    })
    return win
}


initApplication()