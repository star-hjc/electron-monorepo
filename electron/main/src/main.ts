import { app, BrowserWindow } from 'electron'
import nativeModule from '@chat/bridge'
import dayjs from 'dayjs'
import path from 'path'
import './logger/index'
import { initMiniWindow } from './mini'

app.whenReady().then(async() => {
	console.log(nativeModule.hello(), nativeModule.sum(3, 5), dayjs().format(), 'main.ts::622行')

	// TODO: 后续考虑把主窗口和mini窗放到外面入口文件统一初始化
	createMainWindow()
	initMiniWindow()
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
			preload: path.join(__dirname, 'preload.js'),
			nodeIntegration: true
		}
	})
	win.loadURL(`http://localhost:${process.env.VITE_PORT}`)

	win.on('close', async() => {
		console.log(win.id)
	})
	win.webContents.openDevTools({ mode: 'undocked' })
	return win
}
