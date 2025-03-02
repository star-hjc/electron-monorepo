import { app, BrowserWindow } from 'electron'



app.whenReady().then(async () => {
    createMainWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})


function createMainWindow() {
    const win = new BrowserWindow({
        /** 隐藏菜单 */
        width: 850,
        height: 830,
        autoHideMenuBar: true,
        webPreferences: {
            // preload: path.join(app.getAppPath(), '/preload/index.js'),
            nodeIntegration: true,
        },
    })

    win.loadURL(`http://localhost:5173/`)

    win.on('close', async () => {
        console.log(win.id)
    })
    return win
}