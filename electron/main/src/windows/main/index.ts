import path from 'path'
import { app, BrowserWindow } from 'electron'

import { rootDir } from '@config/setting'
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
			preload: path.join(rootDir, 'preload/index.js'),
			nodeIntegration: true
		}
	})

	if (app.isPackaged) {
		await win.loadURL(`file://${path.join(app.getAppPath(), '/renderer/index.html')}`)
	} else {
		await win.loadURL(`http://localhost:${process.env.VITE_PORT}`)
	}

	win.on('close', async() => {
		console.log(win.id)
	})
	win.webContents.openDevTools({ mode: 'undocked' })
	return win
}
