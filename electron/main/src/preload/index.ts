import { contextBridge } from 'electron'
import { create_tags } from '../logger'
const log = create_tags('preload')

contextBridge.exposeInMainWorld('create_tags', {})

log.info('preload', 'log')

console.log('preload', 'preload')

