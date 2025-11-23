import path from 'node:path'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import * as dotenv from 'dotenv'
import { singleton } from '@package/common/singleton'
import workspace from '@package/workspace'
import type { EnvOptions } from './types/env'

class Env {
	constructor() {
		this.set()
	}
	/**
	 * 获取环境文件路径
	 * @param mode - 环境模式 (development, production, test, etc.)
	 * @returns 包含基础环境文件路径和模式环境文件路径的对象
	 * @example
	 * const { baseEnvPath, modeEnvPath } = this.#getEnvPaths('development')
	 */
	#getEnvPaths(mode: string) {
		const envDir = workspace.getRoot()
		const baseEnvPath = path.join(envDir, '.env')
		const modeEnvPath = path.join(envDir, `.env.${mode}`)
		return { baseEnvPath, modeEnvPath }
	}

	/**
	 * 检查环境文件是否存在并给出适当的警告
	 * @param baseEnvPath - 基础环境文件路径 (.env)
	 * @param modeEnvPath - 模式环境文件路径 (.env.{mode})
	 * @returns 包含文件存在状态的对象
	 * @example
	 * const { baseExists, modeExists } = this.#checkEnvFiles('/path/.env', '/path/.env.development')
	 */
	#checkEnvFiles(baseEnvPath?: string, modeEnvPath?: string) {
		const baseExists = existsSync(baseEnvPath)
		const modeExists = modeEnvPath === void 0 ? false : existsSync(modeEnvPath)

		if (!baseExists && !modeExists) {
			// eslint-disable-next-line no-console
			console.warn(`⚠️  环境文件不存在: ${baseEnvPath} 和 ${modeEnvPath}`)
			// eslint-disable-next-line no-console
			console.warn('💡 请创建 .env 文件或设置 NODE_ENV 环境变量')
		}

		return { baseExists, modeExists }
	}

	/**
	 * 加载单个环境文件到 process.env
	 * @param filePath - 环境文件路径
	 * @returns 是否成功加载文件
	 * @example
	 * const loaded = this.#loadEnvFile('/path/.env.development')
	 */
	#loadEnvFile(filePath: string) {
		if (existsSync(filePath)) {
			dotenv.config({ path: filePath })
			return true
		}
		return false
	}
	/**
	 * 获取解析后的环境变量对象
	 * @param mode - 环境模式，默认为 process.env.NODE_ENV 或 'development'
	 * @returns 合并后的环境变量对象 (基础环境变量 + 模式环境变量)
	 * @example
	 * const envVars = env.get('development')
	 * console.log(envVars.API_URL)
	 */
	get(mode: string = process.env.NODE_ENV || 'development') {
		const { baseEnvPath, modeEnvPath } = this.#getEnvPaths(mode)
		const { baseExists, modeExists } = this.#checkEnvFiles(baseEnvPath, modeEnvPath)

		const baseEnv = baseExists ? dotenv.parse(readFileSync(baseEnvPath)) : {}
		const modeEnv = modeExists ? dotenv.parse(readFileSync(modeEnvPath)) : {}

		return { ...baseEnv, ...modeEnv }
	}
	/**
	 * 设置环境变量到 process.env
	 * 加载基础环境文件和模式环境文件到 Node.js 进程环境
	 * @param mode - 环境模式，默认为 process.env.NODE_ENV 或 'development'
	 * @example
	 * env.set('production')
	 * console.log(process.env.NODE_ENV)
	 */
	set(mode: string = process.env.NODE_ENV || 'development') {
		const { baseEnvPath, modeEnvPath } = this.#getEnvPaths(mode)
		const { baseExists, modeExists } = this.#checkEnvFiles(baseEnvPath, modeEnvPath)

		let loadedAnyFile = false

		if (baseExists) {
			loadedAnyFile = this.#loadEnvFile(baseEnvPath) || loadedAnyFile
		} else {
			// eslint-disable-next-line no-console
			console.warn(`⚠️  基础环境文件不存在: ${baseEnvPath}`)
		}

		if (modeExists) {
			loadedAnyFile = this.#loadEnvFile(modeEnvPath) || loadedAnyFile
		} else {
			// eslint-disable-next-line no-console
			console.warn(`⚠️  模式环境文件不存在: ${modeEnvPath}`)
		}

		if (!loadedAnyFile) {
			// eslint-disable-next-line no-console
			console.warn('💡 没有加载任何环境文件，请检查环境配置')
		}
	}
	updateFile(options: EnvOptions) {
		const envDir = process.env.ENV_DIR || workspace.getRoot()
		const envPath = path.join(envDir, `.env`)
		const { baseExists } = this.#checkEnvFiles(envPath)
		const baseEnv = baseExists ? dotenv.parse(readFileSync(envPath)) : {}
		const mergedEnv = { ...baseEnv, ...options }
		let content = ''
		for (const [key, value] of Object.entries(mergedEnv)) {
			if (value !== undefined && value !== null) {
				content += `${key}=${String(value)}\n`
			}
		}
		writeFileSync(envPath, content)
		return mergedEnv
	}
	/**
	 * 更新环境文件内容
	 * 将新的环境变量合并到现有环境文件中并写入磁盘
	 * @param options - 要更新的环境变量键值对
	 * @param mode - 环境模式，默认为 process.env.NODE_ENV 或 'development'
	 * @returns 合并后的环境变量对象
	 * @example
	 * const updated = env.updateFile({ API_URL: 'https://api.example.com', PORT: 3000 })
	 */
	updateFileByMode(options: EnvOptions, mode: string = process.env.NODE_ENV || 'development') {
		const envDir = process.env.ENV_DIR || workspace.getRoot()
		const envPath = path.join(envDir, `.env.${mode}`)

		const currentEnv = this.get(mode)
		const mergedEnv = { ...currentEnv, ...options }

		let content = ''
		for (const [key, value] of Object.entries(mergedEnv)) {
			if (value !== undefined && value !== null) {
				content += `${key}=${String(value)}\n`
			}
		}

		writeFileSync(envPath, content)
		return mergedEnv
	}
}

const EnvSingleton = singleton(Env)

export default new EnvSingleton()
