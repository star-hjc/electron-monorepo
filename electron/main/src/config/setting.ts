import { app } from 'electron'
import path from 'node:path'

export const resourcesDir = path.join(process.cwd(), app.isPackaged ? 'resources' : '../resources')

export default {
	log: {
		mainProcessLogFileName: 'main',
		/** 单份日志大小 10MB */
		maxsize: 10 * 1024 * 1024,
		maxFiles: 5
	}
}
