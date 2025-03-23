
import path from 'node:path'
import * as dotenv from 'dotenv'
import dayjs from 'dayjs'
import { defineConfig } from 'tsup'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire, builtinModules } from 'node:module'
import { type ChildProcess, spawn, execSync } from 'node:child_process'
import fs from 'fs-extra'
import { dependencies, devDependencies, main, name as packageName } from './package.json'
import electronConfig from './electron.config.json'
import { version } from '../../package.json'

let ps:ChildProcess = null

export default defineConfig(({ env, watch }) => {
	const envDir = path.resolve(__dirname, '../../')
	const define = Object.entries(getEnv(env.NODE_ENV, envDir)).reduce((a: { [key: string]: string }, b) => {
		a[`process.env.${b[0]}`] = b[1] as string
		return a
	}, {})
	const outDir = 'dist'
	return {
		define,
		outDir: `./${outDir}`,
		shims: true,
		minify: true,
		entry: ['./src'],
		format: ['cjs'],
		tsconfig: 'tsconfig.json',
		external: ['electron', /^@package\/.+/, /^electron\/.+/, ...builtinModules.flatMap(m => [m, `node:${m}`])],
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
				buildStart: async() => {
					fs.removeSync(outDir)
				},
				buildEnd: async() => {
					if (ps) {
						ps.removeAllListeners()
						ps.kill()
					}
					if (watch) {
						const electronPath = getElectronPath()
						ps = spawn(electronPath, ['.'], { stdio: 'inherit' })
						return
					}
					for (const { name, path } of getWorkspace()) {
						if (name === packageName) continue
						if (dependencies[name] !== void 0) {
							dependencies[name] = `file:${path}`
							continue
						}
						if (devDependencies[name] !== void 0) {
							devDependencies[name] = `file:${path}`
							continue
						}
					}
				}
			}
		],
		onSuccess: async() => {
			const { name, ...electronBuildConfig } = electronConfig
			const mainPathSegments = main.split('/')
			const buildMainPath = mainPathSegments.slice(mainPathSegments.indexOf(outDir) + 1).join('/')
			const outputAppPath = path.join(envDir, 'app')
			electronBuildConfig.directories.output = outputAppPath
			electronBuildConfig.artifactName = `\${productName}-\${version}-\${arch}-${dayjs().format('YYMMDDHHmmss')}.\${ext}`
			fs.removeSync(path.join(outputAppPath, 'win-unpacked'))
			const packageJson = { main: buildMainPath, name, version, dependencies, devDependencies, scripts: { build: 'electron-builder --config=electron.config.json' }}
			writeFileSync(`${outDir}/package.json`, JSON.stringify(packageJson, null, 2))
			writeFileSync(`${outDir}/electron.config.json`, JSON.stringify(electronBuildConfig, null, 2))
			const cwd = path.join(__dirname, outDir)
			fs.copySync(path.join(envDir, 'electron/renderer/dist'), path.join(__dirname, '/dist/renderer'))
			execSync('npm install', { cwd, stdio: 'inherit' })
			execSync('electron-builder --config=electron.config.json', { cwd, stdio: 'inherit' })
		}
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
		const require = createRequire(__filename)
		const electronModulePath = path.dirname(require.resolve('electron'))
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

function getWorkspace() {
	const workspaceJson = String(execSync(`pnpm ls -r --json`))
	return JSON.parse(workspaceJson)
}
