import { autoUpdater } from 'electron-updater'
import { ipc } from '@package/electron'
import { create_tags } from '@/logger'
import { wins } from '@package/electron/windows'
const log = create_tags('ipc-app-update')

ipc.response('checkUpdate', () => {
	return autoUpdater.checkForUpdates()
})

ipc.response('downloadUpdate', () => {
	autoUpdater.downloadUpdate()
})

ipc.response('quitAndInstall', (event, isSilent?: boolean, isForceRunAfter?: boolean) => {
	autoUpdater.quitAndInstall(isSilent, isForceRunAfter)
})

autoUpdater.on('checking-for-update', () => {
	log.info('正在检查更新...')
	ipc.sendByIds('appUpdate', { status: 0 }, wins.getId('main'))
})

autoUpdater.on('update-not-available', () => {
	log.info('当前版本为最新版本')
	ipc.sendByIds('appUpdate', { status: 1 }, wins.getId('main'))
})

autoUpdater.on('update-available', ({ version }) => {
	ipc.sendByIds('appUpdate', { status: 2, version }, wins.getId('main'))
})

autoUpdater.on('download-progress', (progress) => {
	log.info('下载进度:', progress)
	ipc.sendByIds('appUpdate', { status: 3, progress }, wins.getId('main'))
})

autoUpdater.on('error', (err) => {
	log.error('更新错误:', err)
	ipc.sendByIds('appUpdate', { status: 4 }, wins.getId('main'))
})

// 监听更新下载完成事件
autoUpdater.on('update-downloaded', () => {
	log.info('更新下载完成，准备安装')
	// 退出应用并安装更新
	ipc.sendByIds('appUpdate', { status: 5 }, wins.getId('main'))
})

export default () => {
	log.info('init ipc app update')
}
