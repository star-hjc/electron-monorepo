import { ipcMain, IpcMainEvent, IpcMainInvokeEvent, webContents } from 'electron'
import { singleton } from '@package/common/singleton'
import type { EmitsArgs } from './preload'
import type { Features } from '@/types/preload'

class IpcConnector {
	private listeners:Map<string, undefined | Features> = new Map()
	private handles:Map<string, undefined | Features> = new Map()
	private listenersToFeatures:Map<string, Set<string>> = new Map()
	private handlesToFeatures:Map<string, Set<string>> = new Map()
	private listenersNotFeatures:Set<string> = new Set()
	private handlesNotFeatures:Set<string> = new Set()
	private rendererListeners: Set<string> = new Set()

	getListeners(feature?: string) {
		if (feature !== void 0) {
			const listeners = this.listenersToFeatures.get(feature)
			return !listeners ? [...this.listenersNotFeatures] : [...listeners, ...this.listenersNotFeatures]
		}
		return [...this.listeners.keys()]
	}

	getRendererListeners() {
		return [...this.rendererListeners]
	}

	getHandles(feature?: string) {
		if (feature !== void 0) {
			const handles = this.handlesToFeatures.get(feature)
			return !handles ? [...this.handlesNotFeatures] : [...handles, ...this.handlesNotFeatures]
		}
		return [...this.handles.keys()]
	}

	response(
		channel:string,
		listener:(event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown> | unknown,
		features?: Features
	) {
		if (this.handles.has(channel)) throw new Error(`IpcConnector.response Channel ${channel} already registered`)
		this.handles.set(channel, features)
		ipcMain.handle(channel, listener)
		if (features === void 0) {
			this.handlesNotFeatures.add(channel)
			return
		}
		for (const feature of features) {
			if (this.handlesToFeatures.has(feature)) {
				this.handlesToFeatures.set(feature, this.handlesToFeatures.get(feature).add(channel))
				continue
			}
			this.handlesToFeatures.set(feature, new Set([channel]))
		}
	}

	on(
		channel:string,
		listener:(event: IpcMainEvent, ...args: EmitsArgs) => unknown,
		features?: Features
	) {
		if (this.listeners.has(channel)) throw new Error(`IpcConnector.on Channel ${channel} already registered`)
		this.listeners.set(channel, features)
		ipcMain.on(channel, (event: IpcMainEvent, action:string, ...args: unknown[]) => {
			listener(event, ...args, (...callbackArgs) => event.reply(action, ...callbackArgs))
		})
		if (features === void 0) {
			this.listenersNotFeatures.add(channel)
			return
		}
		for (const feature of features) {
			if (this.listenersToFeatures.has(feature)) {
				this.listenersToFeatures.set(feature, this.listenersToFeatures.get(feature).add(channel))
				continue
			}
			this.listenersToFeatures.set(feature, new Set([channel]))
		}
	}

	send(channel:string, ...args: unknown[]) {
		webContents.getAllWebContents().map(v => v.send(channel, ...args))
	}

	sendByIds(channel:string, ...args:[...unknown[], targetWindowIds:number[]]) {
		this.rendererListeners.add(channel)
		const targetWindowIds = args.pop() as number[]
		if (targetWindowIds?.length === 0) throw Error(`IpcConnector sendByIds to ${targetWindowIds} windows`)
		for (const windowId of targetWindowIds) {
			const content = webContents.fromId(windowId)
			if (!content) {
				// eslint-disable-next-line no-console
				console.warn(`IpcConnector.sendByIds to Window not exit WindowId: ${windowId} `)
				continue
			}
			content.send(channel, ...args)
		}
	}

	sendByNotIds(channel:string, ...args:[...unknown[], excludedWindowIds:number[]]) {
		this.rendererListeners.add(channel)
		const ids = args.pop() as number[]
		webContents.getAllWebContents().map(v => {
			if (ids.includes(v.id)) return
			v.send(channel, ...args)
		})
	}
}

const Ipc = singleton(IpcConnector)

export const ipc = new Ipc()

ipcMain.handle('initIpc', (event, feature?:string) => ({ request: ipc.getHandles(feature), emit: ipc.getListeners(feature), on: ipc.getRendererListeners() }))

export default Ipc
