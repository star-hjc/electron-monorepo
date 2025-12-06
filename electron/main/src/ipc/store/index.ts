import { ipc } from '@package/electron'
import { create_tags } from '@/logger'
const log = create_tags('ipc-store')

ipc.response('syncStore', (event, storeId:string, property:string, value:unknown) => {
	ipc.sendByNotIds('syncStore', storeId, property, value, event.frameId, [event.frameId])
})

export default () => {
	log.info('init ipc store')
}
