import { createWindow as createMainWindow } from '@windows/main'
import { createWindow as createMiniWindow } from '@windows/mini'
import { logger } from 'modules/logger'
import { app, BrowserWindow } from 'electron'

async function initApplicationBefore() {
	await initRendererLog()
}

async function initApplication() {
	await createMainWindow()
	createMiniWindow()
}

async function initApplicationAfter() {

}

async function initRendererLog() {
	app.on('browser-window-created', async(event, win) => {
		const title = await getTitle(win)
		win.webContents.on('console-message', (event, level, message, line, sourceId) => {
			const log = logger(`renderer-${title}`)
			message = message.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}\s+\(.+\)\s+/, '')
			log[['debug', 'info', 'warn', 'error'][level]](`${message} (${sourceId}:${line} ${win.id})`)
		})
	})
}

async function getTitle(win:BrowserWindow) {
	return new Promise<string>((resolve) => {
		const timeId = setTimeout(callback, 1000)
		win.webContents.once('did-start-loading', callback)
		function callback() {
			resolve(win.title)
			win.webContents.off('did-start-loading', callback)
			clearTimeout(timeId)
		}
	})
}

export {
	initApplication,
	initApplicationAfter,
	initApplicationBefore,
	createMainWindow
}
