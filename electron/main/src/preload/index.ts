import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

ipcRenderer.invoke('initIpc').then(({ request, emit }) => {
	const api = {
		on: ipcRenderer.on,
		send: ipcRenderer.send
	}
	for (const name of request) {
		api[name] = (...args:unknown[]) => ipcRenderer.invoke(name, ...args)
	}
	for (const name of emit) {
		api[name] = (...args:[...unknown[], (...callbackArgs: unknown[]) => void]) => emits(name, ...args)
	}
	contextBridge.exposeInMainWorld('ipc', api)
})

function emits(channel: string, ...args:[...unknown[], (...callbackArgs: unknown[]) => void]) {
	console.log(args)

	const callback = args[args.length - 1] as (...callbackArgs: unknown[]) => void
	const options = args.slice(0, -1)
	const action = `${channel}-${crypto.randomUUID()}`
	const handler = (event:IpcRendererEvent, ...args:unknown[]) => callback(...args)
	ipcRenderer.on(action, handler)
	ipcRenderer.send(channel, action, ...options)
	return [() => ipcRenderer.removeListener(action, handler)]
}
