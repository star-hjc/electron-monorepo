import { app, BrowserWindow } from 'electron'
import nativeModule from '@chat/bridge'
import env from './env/index'

app.whenReady().then(async() => {
	console.log(nativeModule.hello(), env.VITE_PORT, 'main.ts::9行')
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
			nodeIntegration: true
		}
	})

	win.loadURL(`http://localhost:${env.VITE_PORT}/`)

	win.on('close', async() => {
		console.log(win.id)
	})
	win.webContents.openDevTools({ mode: 'undocked' })
	return win
}
