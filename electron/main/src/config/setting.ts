import { app } from 'electron'

import path from 'node:path'

export const resourcesDir = path.join(process.cwd(), app.isPackaged ? 'resources' : '../resources')

const logDirname = path.join(resourcesDir, 'logs')
export default {
	log: {
		dirname: logDirname,
		mainProcessLogFileName: 'main',
		/** 单份日志大小 10MB */
		maxsize: 10 * 1024 * 1024,
		maxFiles: 5
	},
	icons: {
		getPath: (name:string = '') => path.join(__dirname, `static/icons/${name}`)
	}
}
