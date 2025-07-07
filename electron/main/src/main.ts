import { app } from 'electron'
import nativeModule from '@package/bridge'
import nativeNapi from '@package/napi'
import dayjs from 'dayjs'
import { create_tags } from '@logger'

console.log(nativeNapi.sum(1, 2), 'main.ts::7行')

import { initApplication, initApplicationAfter, initApplicationBefore } from '@windows'

const log = create_tags('main')
log.info('main', 888)

initApplicationBefore()

app.whenReady().then(async() => {
	console.log(nativeModule.hello(), dayjs().format(), 'main.ts::622行')
	// nativeModule.callCase((...a) => {
	// 	log.info('callCase', a, a.length)
	// })
	await initApplication()
	app.on('activate', async() => {
		await initApplicationAfter()
	})
})

