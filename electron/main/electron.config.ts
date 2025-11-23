import { AfterPackContext } from 'electron-builder'
import path from 'node:path'
import dayjs from 'dayjs'
import fs from 'fs-extra'
import { readdirSync } from 'node:fs'
import workspace from '@package/workspace'

export default {
	productName: 'test-app',
	appId: 'com.xxx.xxx',
	artifactName: `\${productName}-\${version}-\${arch}-${dayjs().format('YYMMDDHHmmss')}-${workspace.getCommitHash()}.\${ext}`,
	files: [
		'./**/*'
	],
	directories: {
		buildResources: './',
		output: path.join(workspace.getRoot(), 'app')
	},
	extraResources: {
		from: '../../resources/',
		to: './'
	},
	nsis: {
		oneClick: false,
		allowToChangeInstallationDirectory: false,
		shortcutName: 'app名称'
	},
	asar: true,
	asarUnpack: [
		'./node_modules/@package/bridge/**/*'
	],
	afterPack: async(context:AfterPackContext) => {
		if (context.packager.platform.buildConfigurationKey === 'win') {
			const bridgePath = path.join(context.appOutDir, 'resources/app.asar.unpacked/node_modules/@package/bridge')
			for (const file of readdirSync(bridgePath)) {
				const filePath = path.join(bridgePath, file)
				const stats = fs.statSync(filePath)
				if (stats.isDirectory() && file === 'dist') {
					continue
				}
				if (stats.isFile() && file === 'package.json') {
					continue
				}
				fs.removeSync(filePath)
			}
		}
		// eslint-disable-next-line no-console
		console.warn(context)
	}
}
