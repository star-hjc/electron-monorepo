import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

function emits(channel: string, ...args: [...unknown[], (...callbackArgs: unknown[]) => void]) {
	const callback = args[args.length - 1] as (...callbackArgs: unknown[]) => void
	const options = args.slice(0, -1)
	const action = `${channel}-${crypto.randomUUID()}`
	const handler = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args)
	ipcRenderer.on(action, handler)
	ipcRenderer.send(channel, action, ...options)
	return [() => ipcRenderer.removeListener(action, handler)]
}

export const preloadInit = (feature?: string) => {
	ipcRenderer.invoke('initIpc', feature).then(({ request, emit }) => {
		const api = { feature,
			on: (name: string, callback: (...arg:unknown[]) => void) => ipcRenderer.on(name, (_event, ...arg) => callback(...arg))
		}
		for (const name of request) {
			api[name] = (...args: unknown[]) => ipcRenderer.invoke(name, ...args)
		}

		for (const name of emit) {
			api[name] = (...args: [...unknown[], (...callbackArgs: unknown[]) => void]) => emits(name, ...args)
		}

		contextBridge.exposeInMainWorld('ipc', api)
	})
}

