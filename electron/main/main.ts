import { app, BrowserWindow } from 'electron'
import nativeModule from '@chat/bridge'

// // 后面使用monorepo的方式引入
// import NeonBridge from '../../neon-bridge/index'
// console.log(NeonBridge.hello(), 'main.ts::3行')

app.whenReady().then(async() => {
	console.log(nativeModule.hello(), 'main.ts::9行')
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

	win.loadURL(`http://localhost:5173/`)

	win.on('close', async() => {
		console.log(win.id)
	})
	win.webContents.openDevTools({ mode: 'undocked' })
	return win
}
