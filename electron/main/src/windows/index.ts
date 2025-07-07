import { createWindow as createMainWindow } from '@windows/main'
import { createWindow as createMiniWindow } from '@windows/mini'
import { logger } from '@logger'
import initIpc from '@ipc'
import WindowPool from '@windowPool'
import { app, BrowserWindow } from 'electron'

const windowPool = new WindowPool()

async function initApplicationBefore() {
	app.on('browser-window-created', async(event, win) => {
		const title = await getTitle(win)
		windowPool.add(win.id, title)
		await initRendererLog(win, title)
		win.on('close', async() => {
			windowPool.remove(win.id)
		})
	})
}

async function initWindows() {
	await createMainWindow()
	await createMiniWindow()
}

async function initApplication() {
	await initWindows()
	await initIpc()
}

async function initApplicationAfter() {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
}

async function initRendererLog(win:BrowserWindow, name:string) {
	win.webContents.on('console-message', ({ level, message, lineNumber, sourceId }) => {
		const log = logger(`renderer-${name}`, win.webContents.getOSProcessId())
		log[level === 'warning' ? 'warn' : level]?.(`${message} (${sourceId}:${lineNumber} ${win.id})`)
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
	windowPool,
	initApplication,
	initApplicationAfter,
	initApplicationBefore
}
