import { app } from 'electron'
import { menubar } from 'menubar'
import path from 'path'
import { create_tags } from '@/logger'
import { sleep } from '@package/common/time'

const log = create_tags('windows-mini')
log.info('mini', 1231)
log.debug('mini', 123)
log.error('mini', 123)
log.warn('mini', 123)

export async function createWindow() {
	function setOkIcon() {
		mb.tray.setImage(path.join(__dirname, 'static/icons/state-ok-20.png'))
	}

	function setStaticIcon() {
		console.log(path.join(__dirname, 'static/icons/IconTemplate.png'))

		mb.tray.setImage(path.join(__dirname, 'static/icons/IconTemplate.png'))
	}

	function frame() {
		setTimeout(() => mb.tray.setImage(path.join(__dirname, 'static/icons/state-sync-20.png')), 300)
		setTimeout(() => mb.tray.setImage(path.join(__dirname, 'static/icons/state-sync-20-60.png')), 600)
		setTimeout(
			() => mb.tray.setImage(path.join(__dirname, 'static/icons/state-sync-20-120.png')),
			900
		)
	}

	let menubarIndexUrl = ''
	if (app.isPackaged) {
		menubarIndexUrl = path.join(app.getAppPath(), '/renderer/mini.html')
	} else {
		menubarIndexUrl = `http://localhost:${process.env.VITE_PORT}/mini.html`
	}
	console.log(menubarIndexUrl, process.env.NODE_ENV)
	const mb = menubar({
		// tray,
		index: menubarIndexUrl,
		showDockIcon: true,
		browserWindow: {
			title: 'mini',
			width: 400,
			height: 400,
			webPreferences: {
				preload: path.join(__dirname, 'preload/index.js'),
				devTools: true // 配置为false，可禁用打开控制台
			}
		}
	})

	mb.on('ready', () => {
		// tray.removeAllListeners();
		// 加载动画，轮询执行
		const trayAnimation = setInterval(frame, 1000)
		// 三秒后结束动画
		sleep(3000).then(() => {
			clearInterval(trayAnimation)
			setOkIcon()
			setTimeout(setStaticIcon, 400)
		})
	})

	mb.on('after-create-window', () => {
		console.log('窗体创建成功', 'mini.ts::75行', mb.window.title)
	})

	return mb
}
