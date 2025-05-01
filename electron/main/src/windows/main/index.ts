import path from 'path'
import { app, BrowserWindow } from 'electron'
import { create_tags } from 'modules/logger/index'

const log = create_tags('windows-main')
log.info('main', 888)

export async function createWindow() {
	const win = new BrowserWindow({
		title: 'main',
		width: 850,
		height: 830,
		autoHideMenuBar: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload/index.js')
		}
	})

	if (app.isPackaged) {
		await win.loadURL(`file://${path.join(app.getAppPath(), '/renderer/index.html')}`)
	} else {
		await win.loadURL(`http://localhost:${process.env.VITE_PORT}`)
	}

	win.webContents.openDevTools({ mode: 'undocked' })
	return win
}
