import { autoUpdater } from 'electron-updater'
import { create_tags } from '@/logger'
const log = create_tags('auto-updater')

export function initAutoUpdater() {
	autoUpdater.logger = log
	if (process.env.NODE_ENV === process.env.DEV_ENV) {
		autoUpdater.autoDownload = false
		autoUpdater.forceDevUpdateConfig = true
	}
	autoUpdater.checkForUpdates()
}
