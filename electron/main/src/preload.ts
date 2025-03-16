import create_tags from './logger'

const log = create_tags('preload')

console.log('preload', 'preload')
log.info('preload', 'test', 666)
