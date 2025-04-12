import { app } from 'electron'
import nativeModule from '@package/bridge'
import dayjs from 'dayjs'
import { create_tags } from '@logger'

import { initApplication, initApplicationAfter, initApplicationBefore } from '@windows'

const log = create_tags('main')
log.info('main', 888)

initApplicationBefore()

app.whenReady().then(async() => {
	console.log(nativeModule.hello(), dayjs().format(), 'main.ts::622行')
	await initApplication()
	app.on('activate', async() => {
		await initApplicationAfter()
	})
})

