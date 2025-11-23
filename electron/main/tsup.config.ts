
import path from 'node:path'
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
import workspaceEnv from '@package/workspace/env'
import os from 'node:os'

type IpcTypeCallbackParams = Array<{ name: string; type: string }>

type IpcType = {
    line: number;
	features: undefined | string;
	filePath: string;
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
	const define = Object.entries(workspaceEnv.get()).reduce((a, b) => {
		a[`process.env.${b[0]}`] = `'${b[1]}'`
		return a
	}, {
		'process.env.COMMIT_HASH': `'${workspace.getCommitHash()}'`,
		'process.env.VERSION': `'${version}'`,
		'process.env.OS': `'${os.type()}'`
	})
	const isDev = env.NODE_ENV === process.env.DEV_ENV
	const outDir = 'dist'
	return {
		define,
		outDir: `./${outDir}/`,
		shims: true,
		minify: !isDev,
		splitting: false,
		sourcemap: isDev,
		keepNames: isDev,
		entry: ['src/main.ts', 'src/static', 'src/preload', 'electron.config.ts'],
		format: ['cjs'],
		tsconfig: 'tsconfig.json',
		external: ['electron', /^electron\/.+/, /^@package\/(bridge|napi).*/, ...builtinModules.flatMap(m => [m, `node:${m}`])],
		noExternal: ['@package/electron/preload'],
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
				const { ipcTypes, features } = await getIpcTypes()
				createIpcTypeFile(ipcTypes, features)

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
			const packageJson = {
				main: buildMainPath,
				name: electronConfig.productName,
				version,
				dependencies,
				devDependencies
			}

			const cwd = path.join(__dirname, outDir)
			fs.copySync(path.join(envDir, 'electron/renderer/dist'), path.join(__dirname, '/dist/renderer'))
			writeFileSync(`${outDir}/package.json`, JSON.stringify(packageJson, null, 2))
			execSync('electron-builder --config=electron.config.js', { cwd, stdio: 'inherit' })
		}
	}
})

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
	const ipcEventMap = { 'response': 'request', 'on': 'emit', 'send': 'on' }
	const features = new Set<string>()
	const projectRoot = workspace.getWorkspaceByName(process.env.ELECTRON_MAIN)
	const project = new Project({
		tsConfigFilePath: path.join(projectRoot, 'tsconfig.json')
	})
	const ipcTypes: IpcTypeList = []
	for (const sourceFile of project.getSourceFiles()) {
		if (!path.normalize(sourceFile.getFilePath()).startsWith(projectRoot)) continue
		const calls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
		for (const call of calls) {
			const expr = call.getExpression()
			if (expr.getText() === 'preloadInit') {
				const feature = call.getArguments()[0]?.getText()
				if (feature) {
					features.add(feature)
				}
			}

			if (Node.isPropertyAccessExpression(expr)) {
				const className = expr.getExpression().getType().getSymbol()?.getName()
				const functionName = expr.getName()
				if (className === 'IpcConnector' && Object.keys(ipcEventMap).includes(functionName)) {
					const args = call.getArguments()

					if (args.length >= 2) {
						const [eventName, callback, features] = args
						const result:IpcType = {
							features: functionName === 'send' ? void 0 : features?.getText(),
							filePath: sourceFile.getFilePath(),
							line: call.getStartLineNumber(),
							functionName: ipcEventMap[functionName],
							eventName: eventName.getText(),
							eventNameType: eventName.getType().getText(),
							callbackParams: [],
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
						ipcTypes.push(result)
					}
				}
			}
		}
	}
	return {
		ipcTypes,
		features: [...features]
	}
}

function createIpcTypeFile(types:IpcTypeList, features:Array<string>) {
	const ipcTypeFilePath = path.join(workspace.getWorkspaceByName(process.env.ELECTRON_RENDERER), 'types', 'ipc.d.ts')
	const preloadTypeFilePath = path.join(workspace.getWorkspaceByName('@package/electron'), 'types', 'preload.d.ts')
	fs.removeSync(ipcTypeFilePath)
	fs.removeSync(preloadTypeFilePath)
	let content = ''
	for (const item of types) {
		let callbackParams = ''
		if (item.functionName === 'emit') {
			item.callbackParams.push({ name: 'options?', type: 'EmitsOptions' })
		}
		if (item.callbackParams?.length > 1) {
			item.callbackParams.shift()
			callbackParams = item.callbackParams.map(param => `${param.name}: ${param.type}`).join(', ')
		}
		if (item.functionName === 'on') {
			content += `'${item.functionName}': (event: ${item.eventName}, callback: (...arg: unknown[]) => ${item.callbackType}) => ${item.callbackType}\n`
			continue
		}
		const description = `/** ⚠️ ${item.features} 需求可用 ${item.eventName}  */\n`
		content += `${item.features ? description : ''}${item.eventName}: (${callbackParams}) => ${item.callbackType}\n`
	}
	content += `'send': (event: string, ...args: unknown[]) => void\n`
	const titleTop = '/** 由 electron/main/tsup.config.ts  自动生成, 请勿手动修改 */\n'
	const EmitsOptions = `type EmitsOptions = {\n\tonce?: boolean\n\tprivate?: boolean\n}\n`

	fs.writeFileSync(preloadTypeFilePath, `${titleTop}\n${EmitsOptions}\ntype Feature = ${features.length > 0 ? features.join(' | ') : 'never'}\nexport type Features = ${features.length > 0 ? '[Feature, ...Feature[]]' : 'undefined | [string, ...string[]]'}\n`)
	fs.writeFileSync(ipcTypeFilePath, `${titleTop}\n${EmitsOptions}\nexport interface Ipc {\n${content}}\n`)
}
