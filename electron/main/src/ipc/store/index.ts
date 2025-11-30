import { Ipc } from '@package/electron'
import { create_tags } from '@/logger'
const log = create_tags('ipc-store')

const ipc = new Ipc()

ipc.response('syncStore', (event, storeId:string, property:string, value:unknown) => {
	ipc.sendByNotIds('syncStore', storeId, property, value, event.frameId, [event.frameId])
})

export default () => {
	log.info('init ipc store')
}
