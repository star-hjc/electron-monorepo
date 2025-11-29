import { app } from 'electron'
import nativeModule from '@package/bridge'
import nativeNapi from '@package/napi'
import dayjs from 'dayjs'
import { create_tags } from '@/logger'
import { initApplication, initApplicationAfter, initApplicationBefore } from '@/windows'
import store from '@/store'

const log = create_tags('main')
log.info('main', 888, nativeNapi.sum(1, 2), nativeModule.hello(), dayjs().format())

initApplicationBefore()

app.whenReady().then(async() => {
	// nativeModule.callCase((...a) => {
	// 	log.info('callCase', a, a.length)
	// })
	await initApplication()
	store.set('debugPhase', false)
	app.on('activate', async() => {
		await initApplicationAfter()
	})
})

