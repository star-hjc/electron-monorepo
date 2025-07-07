
import path from 'node:path'
import * as dotenv from 'dotenv'
import { Project, SyntaxKind, Node } from 'ts-morph'
import { defineConfig } from 'tsup'
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createRequire, builtinModules } from 'node:module'
import { type ChildProcess, spawn, execSync } from 'node:child_process'
import fs from 'fs-extra'
import { dependencies, devDependencies, main, name as packageName } from './package.json'
import electronConfig from './electron.config'
import { version } from '../../package.json'
import workspace from '@package/workspace'

type IpcTypeCallbackParams = Array<{ name: string; type: string }>

type IpcType = {
    filePath: string;
    line: number;
	functionName: string;
    eventName: string;
    eventNameType: string;
    callbackParams: IpcTypeCallbackParams;
	callbackType:string
}

type IpcTypeList = Array<IpcType>

let ps: ChildProcess = null

export default defineConfig(({ env, watch }) => {
	const envDir = workspace.getRoot()
	const define = Object.entries(getEnv(env.NODE_ENV, envDir)).reduce((a: { [key: string]: string }, b) => {
		a[`process.env.${b[0]}`] = b[1] as string
		return a
	}, {})
	const outDir = 'dist'
	return {
		define,
		outDir: `./${outDir}/`,
		shims: true,
		// minify: true,
		splitting: true,
		// keepNames: true,
		entry: ['src/main.ts', 'src/static', 'src/preload', 'electron.config.ts'],
		format: ['cjs'],
		tsconfig: 'tsconfig.json',
		external: ['electron', /^@package\/.+/, /^electron\/.+/, ...builtinModules.flatMap(m => [m, `node:${m}`])],
		loader: {
			'.npmrc': 'copy',
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
				buildStart: () => {
					if (existsSync(outDir)) {
						for (const file of readdirSync(outDir)) {
							const filePath = path.join(outDir, file)
							const stats = fs.statSync(filePath)
							if (stats.isDirectory() && file === 'node_modules') {
								continue
							}
							fs.removeSync(filePath)
						}
					}
				},
				buildEnd: () => {
					if (ps) {
						ps.removeAllListeners()
						ps.kill()
					}
				}
			}
		],
		onSuccess: async() => {
			if (watch) {
				const ipcTypes = await getIpcTypes()
				createIpcTypeFile(ipcTypes)

				ps = spawn(getElectronPath(), ['--disable-gpu ', '.'], { stdio: 'inherit' })
				return
			}
			const mainPathSegments = main.split('/')
			const buildMainPath = mainPathSegments.slice(mainPathSegments.indexOf(outDir) + 1).join('/')
			const outputAppPath = path.join(envDir, 'app')
			fs.removeSync(path.join(outputAppPath, 'win-unpacked'))
			for (const { name, path } of workspace.getWorkspace()) {
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
			const packageJson = { main: buildMainPath, name: electronConfig.productName, version, dependencies, devDependencies }
			writeFileSync(`${outDir}/package.json`, JSON.stringify(packageJson, null, 2))
			const cwd = path.join(__dirname, outDir)
			fs.copySync(path.join(envDir, 'electron/renderer/dist'), path.join(__dirname, '/dist/renderer'))
			fs.copyFileSync(path.join(envDir, '.npmrc'), path.join(__dirname, '/dist/.npmrc'))
			execSync('npm install', { cwd, stdio: 'inherit' })
			execSync('electron-builder --config=electron.config.js', { cwd, stdio: 'inherit' })
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

async function getIpcTypes() {
	const ipcEventMap = { 'response': 'request', 'on': 'emit' }
	const project = new Project({
		tsConfigFilePath: path.join(workspace.getElectronMain(), 'tsconfig.json')
	})
	const sourceFiles = project.getSourceFiles()
	const results: IpcTypeList = []
	for (const sourceFile of sourceFiles) {
		const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
		for (const call of calls) {
			const expr = call.getExpression()
			if (Node.isPropertyAccessExpression(expr)) {
				const className = expr.getExpression().getType().getSymbol()?.getName()
				const functionName = expr.getName()
				if (className === 'IpcConnector' && Object.keys(ipcEventMap).includes(functionName)) {
					const args = call.getArguments()

					if (args.length >= 2) {
						const firstArg = args[0]
						const callback = args[1]
						const lineNumber = call.getStartLineNumber()

						const result = {
							filePath: sourceFile.getFilePath(),
							line: lineNumber,
							functionName: ipcEventMap[functionName],
							eventName: firstArg.getText(),
							eventNameType: firstArg.getType().getText(),
							callbackParams: [] as Array<{name: string; type: string}>,
							callbackType: 'void'
						}

						if (Node.isFunctionExpression(callback) ||
                Node.isArrowFunction(callback) ||
                Node.isFunctionDeclaration(callback)) {
							const params = callback.getParameters()
							const callbackType = callback.getReturnType().getText()
							result.callbackType = functionName === 'response' ? `Promise<${callbackType}>` : callbackType
							for (const param of params) {
								result.callbackParams.push({
									name: param.getName(),
									type: param.getType().getText()
								})
							}
						}

						results.push(result)
					}
				}
			}
		}
	}

	return results
}

function createIpcTypeFile(types:IpcTypeList) {
	const ipcTypeFilePath = path.join(workspace.getElectronRenderer(), 'types', 'ipc.d.ts')
	fs.removeSync(ipcTypeFilePath)
	let content = ''
	for (const item of types) {
		let callbackParams = ''
		if (item.callbackParams?.length > 1) {
			item.callbackParams.shift()
			callbackParams = item.callbackParams.map(param => `${param.name}: ${param.type}`).join(', ')
		}
		content += `${item.eventName}: (${callbackParams}) => ${item.callbackType}\n`
	}
	fs.writeFileSync(ipcTypeFilePath, `export interface Ipc {\n${content}}\n`)
}
