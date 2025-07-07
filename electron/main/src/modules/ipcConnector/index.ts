import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, webContents, WebContents } from 'electron'
import { singleton } from '@package/common/singleton'
import { create_tags } from '@logger'

const log = create_tags('IpcConnector')

class IpcConnector {
	private listeners:Set<string> = new Set()
	private handles:Set<string> = new Set()

	getListeners() {
		return [...this.listeners]
	}

	getHandles() {
		return [...this.handles]
	}

	response(channel:string, listener:(event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown> | unknown) {
		if (this.handles.has(channel)) throw new Error(`IpcConnector.response Channel ${channel} already registered`)
		this.handles.add(channel)
		ipcMain.handle(channel, listener)
	}

	on(channel:string, listener:(event: IpcMainEvent, ...args: [...unknown[], (...callbackArgs:unknown[]) => void]) => Promise<unknown> | unknown) {
		if (this.listeners.has(channel)) throw new Error(`IpcConnector.on Channel ${channel} already registered`)
		this.listeners.add(channel)
		ipcMain.on(channel, (event: IpcMainEvent, action:string, ...args: unknown[]) => listener(event, ...args, (...callbackArgs) => event.reply(action, ...callbackArgs)))
	}

	send(channel:string, ...args: [...unknown[], wins:number[]]) {
		const wins = args.pop() as number[]
		log.info(`IpcConnector send to ${wins} windows`)
		let contents:WebContents[] = []
		if (wins.length === 0) {
			contents = webContents.getAllWebContents()
		} else {
			for (const id of wins) {
				const content = webContents.fromId(id)
				if (!content) {
					log.warn(`IpcConnector.send to Window not exit WindowId: ${id} `)
					continue
				}
				contents.push(content)
			}
			if (contents.length === 0) {
				log.warn(`IpcConnector.send to Window not exit WindowIds: ${wins.join(', ')} `)
				return
			}
		}
		for (const content of contents) {
			if (!content) {
				continue
			}
			content.send(channel, ...args)
		}
	}
}

log.info('IpcConnector initialized')

export default singleton(IpcConnector)
