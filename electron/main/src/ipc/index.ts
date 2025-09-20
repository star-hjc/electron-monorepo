import type { IpcMainEvent } from 'electron'
import { Ipc } from '@package/electron'
import { create_tags } from '@/logger'

const log = create_tags('ipc')
log.info('ipc init')

const ipc = new Ipc()

let num = 0
ipc.on('ping', (event: IpcMainEvent, id:number, value:number, callback:(name:string, time:number, num:number) => void) => {
	num++
	log.info('ping', id, value, Date.now(), num, callback)
	callback('end', Date.now(), num)
})

ipc.response('ping1', () => {
	return { name: 1, num: '' }
})

ipc.response('ping3', () => {
	return 1231
})

ipc.send('cccc', '1231', [1, 2, 3])

ipc.on('cccc', (event, callback:(name:string) => void) => {
	callback('1231')
})

ipc.on('bbbb', (event, callback:(name:string) => void) => {
	callback('1231')
})

export default async() => {
	log.info('ipc init')
}
