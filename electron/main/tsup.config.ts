
import path from 'node:path'
import * as dotenv from 'dotenv'
import { defineConfig } from 'tsup'
import { existsSync, readFileSync } from 'node:fs'
import { createRequire, builtinModules } from 'node:module'
import { type ChildProcess, spawn } from 'node:child_process'

let ps:ChildProcess = null

export default defineConfig(({ env }) => {
	const envDir = path.resolve(__dirname, '../../')
	const define = Object.entries(getEnv(env.NODE_ENV, envDir)).reduce((a: { [key: string]: string }, b) => {
		a[`process.env.${b[0]}`] = b[1] as string
		return a
	}, {})
	return {
		define,
		clean: true,
		minify: true,
		entry: ['./src'],
		format: ['cjs'],
		tsconfig: 'tsconfig.json',
		outDir: 'dist',
		external: ['electron', '@chat/bridge', /^electron\/.+/, ...builtinModules.flatMap(m => [m, `node:${m}`])],
		loader: {
			'.icns': 'copy',
			'.png': 'copy',
			'.jpg': 'copy',
			'.jepg': 'copy',
			'.svg': 'copy',
			'.icon': 'copy'
		},
		plugins: [
			{
				name: 'electron-plugin',
				buildEnd: () => {
					if (ps) {
						ps.removeAllListeners()
						ps.kill()
					}
					const electronPath = getElectronPath()
					ps = spawn(electronPath, ['.'], { stdio: 'inherit' })
				}
			}
		]
	}
})

function getEnv(mode: string, envDir: string) {
	const envPath = path.join(envDir, `.env`)
	const defaultEnvPath = path.join(envDir, `.env.${mode}`)
	const defaultEnv = dotenv.config({ path: defaultEnvPath }).parsed || {}
	const env = dotenv.config({ path: envPath }).parsed || {}
	return { ...defaultEnv, ...env }
}

function getElectronPath(): string {
	let electronExecPath = process.env.ELECTRON_EXEC_PATH || ''
	if (!electronExecPath) {
		const _require = createRequire(import.meta.url)
		const electronModulePath = path.dirname(_require.resolve('electron'))
		const pathFile = path.join(electronModulePath, 'path.txt')
		let executablePath = ''
		if (existsSync(pathFile)) {
			executablePath = readFileSync(pathFile, 'utf-8')
		}
		if (executablePath) {
			electronExecPath = path.join(electronModulePath, 'dist', executablePath)
			process.env.ELECTRON_EXEC_PATH = electronExecPath
		} else {
			throw new Error('Electron uninstall')
		}
	}
	return electronExecPath
}

// "dev": "nodemon --exec cross-env NODE_ENV=development npm run start",
// "dev:pro": "nodemon --exec cross-env NODE_ENV=production npm run start",
// "build": "cross-env NODE_ENV=production tsc",
// "postinstall": "ts-patch install",
