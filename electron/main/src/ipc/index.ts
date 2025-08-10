import { ipcMain, IpcMainEvent } from 'electron'
import Ipc from '@IpcConnector'
import { create_tags } from '@logger'

const log = create_tags('ipc')
log.info('ipc init')

const ipc = new Ipc()

let num = 0
ipc.on('ping', (event: IpcMainEvent, id:number, value:number, callback:(name:string, time:number, num:number) => void) => {
	num++
	log.info('ping', id, value, Date.now(), num, callback)
	callback('end', Date.now(), num)
	// ipc.send(action, 'pong1', Date.now(), num, [])
})

ipc.response('ping1', () => {
	return { name: 1, num: '' }
})

ipc.response('ping3', () => {
	return 1231
})
// ipc.response('')

ipc.on('cccc', (event, callback:(name:string) => void) => {
	callback('1231')
})

ipcMain.handle('initIpc', () => {
// IPC 初始化完成
	log.info('ipc init finished')
	return { request: ipc.getHandles(), emit: ipc.getListeners() }
})

export default async() => {
	log.info('ipc init')
}
