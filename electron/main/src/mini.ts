// import { app } from 'electron'
import { menubar } from 'menubar'
import path from 'path'
import { create_tags } from './logger'

const log = create_tags('mini')
log.info('mini', 123)
log.debug('mini', 123)
log.error('mini', 123)
log.warn('mini', 123)

const AppPath = __dirname
const isDevelopment = process.env.NODE_ENV === 'development'

export function initMiniWindow() {
	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms)
		})
	}

	function setOkIcon() {
		mb.tray.setImage(path.join(AppPath, 'static/icons/state-ok-20.png'))
	}

	function setStaticIcon() {
		console.log(path.join(AppPath, 'static/icons/IconTemplate.png'))

		mb.tray.setImage(path.join(AppPath, 'static/icons/IconTemplate.png'))
	}

	function frame() {
		setTimeout(() => mb.tray.setImage(path.join(AppPath, 'static/icons/state-sync-20.png')), 300)
		setTimeout(() => mb.tray.setImage(path.join(AppPath, 'static/icons/state-sync-20-60.png')), 600)
		setTimeout(
			() => mb.tray.setImage(path.join(AppPath, 'static/icons/state-sync-20-120.png')),
			900
		)
	}

	let menubarIndexUrl = ''
	if (isDevelopment) {
		menubarIndexUrl = `http://localhost:${process.env.VITE_PORT}/mini.html`
	} else {
		menubarIndexUrl = `mini.html`
	}

	const mb = menubar({
		// tray,
		index: menubarIndexUrl,
		showDockIcon: true,
		browserWindow: {
			width: 400,
			height: 400,
			webPreferences: {
				preload: path.join(__dirname, 'preload.js')
				// devTools: isDevelopment, // 配置为false，可禁用打开控制台
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
		console.log('窗体创建成功', 'main.ts::62行')
	})

	return mb
}
