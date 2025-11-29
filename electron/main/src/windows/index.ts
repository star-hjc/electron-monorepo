import path from 'node:path'
import { app, session, BrowserWindow } from 'electron'
import WindowPool from '@package/electron/windows'
import { logger } from '@/logger'
import { createWindow as createMainWindow } from '@/windows/main'
import { createWindow as createMiniWindow } from '@/windows/mini'
import '@/ipc'

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
	await initEnvInfoLog()
}

async function initWindows() {
	await createMainWindow()
	await createMiniWindow()
}

async function initApplication() {
	initVueDevTools()
	await initWindows()
}

async function initApplicationAfter() {
	if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
}

function initVueDevTools() {
	if (app.isPackaged) return
	session.defaultSession.loadExtension(path.join(process.env.ROOT_DIR, '.devtools/vue'))
}

async function initEnvInfoLog() {
	const log = logger(`env`, process.pid)
	log.info(`OS: ${process.env.OS} | version: ${process.env.VERSION} | commit: ${process.env.COMMIT_HASH}`)
}

async function initRendererLog(win:BrowserWindow, name:string) {
	win.webContents.on('console-message', ({ level, message, lineNumber, sourceId }) => {
		const log = logger(`renderer-${name}`, win.webContents.getOSProcessId())
		log[level === 'warning' ? 'warn' : level]?.(`${message} (${sourceId}:${lineNumber} ${win.id})`)
	})
}

async function getTitle(win:BrowserWindow) {
	return new Promise<string>((resolve) => {
		win.webContents.once('did-start-loading', () => resolve(win.title))
	})
}

export {
	windowPool,
	initApplication,
	initApplicationAfter,
	initApplicationBefore
}
