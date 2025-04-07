import { createWindow as createMainWindow } from '@windows/main'
import { createWindow as createMiniWindow } from '@windows/mini'
import { logger } from 'modules/logger'
import { app } from 'electron'

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
	app.on('browser-window-created', (event, win) => {
		const title = win.title
		win.webContents.on('console-message', (event, level, message, line, sourceId) => {
			const log = logger(`renderer-${title}`)
			message = message.replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\.\d{3}\s+\(.+\)\s+/, '')
			log[['debug', 'info', 'warn', 'error'][level]](`${message} (${sourceId}:${line} ${win.id})`)
		})
	})
}

export {
	initApplication,
	initApplicationAfter,
	initApplicationBefore,
	createMainWindow
}
