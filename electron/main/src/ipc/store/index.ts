import { Ipc } from '@package/electron'
import { create_tags } from '@/logger'
const log = create_tags('ipc-store')

const ipc = new Ipc()

ipc.response('syncStore', (event, storeId:string, property:string, value:unknown) => {
    
    log.info('rendererSyncStore', storeId, property, value, event.frameId)
    ipc.sendByNotIds('syncStore', storeId, property, value, [event.frameId])
})

export default () =>{
    log.info('init ipc store')
}