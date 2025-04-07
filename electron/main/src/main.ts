import { app, BrowserWindow } from 'electron'
import nativeModule from '@package/bridge'
import dayjs from 'dayjs'
import { create_tags } from 'modules/logger'

import { initApplication, initApplicationAfter, initApplicationBefore, createMainWindow } from '@windows'

const log = create_tags('main')
log.info('main', 888)

app.whenReady().then(async() => {
	console.log(nativeModule.hello(), dayjs().format(), 'main.ts::622行')

	// TODO: 后续考虑把主窗口和mini窗放到外面入口文件统一初始化
	await initApplicationBefore()
	await initApplication()
	await initApplicationAfter()
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
	})
})

