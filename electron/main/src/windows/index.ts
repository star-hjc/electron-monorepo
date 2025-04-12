import { createWindow as createMainWindow } from '@windows/main'
import { createWindow as createMiniWindow } from '@windows/mini'
import { logger } from '@logger'
import { app, BrowserWindow } from 'electron'

async function initApplicationBefore() {
	app.on('browser-window-created', async(event, win) => {
		await initRendererLog(win)
		win.on('close', async() => {
			console.log(win.id)
		})
	})
}

async function initApplication() {
	await createMainWindow()
	await createMiniWindow()
}

async function initApplicationAfter() {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
}

async function initRendererLog(win:BrowserWindow) {
	const title = await getTitle(win)
	win.webContents.on('console-message', (event, level, message, line, sourceId) => {
		const log = logger(`renderer-${title}`)
		message = message.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}\s+\(.+\)\s+/, '')
		log[['debug', 'info', 'warn', 'error'][level]](`${message} (${sourceId}:${line} ${win.id})`)
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
	initApplicationBefore
}
