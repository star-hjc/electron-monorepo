import fs from 'fs/promises'
import path from 'path'
import env from '@package/workspace/env'

/**
 * 获取当前执行目录的 package.json 中的 name 并写入 .env 文件
 * @param key 环境变量的 key
 */
async function setEnvFromPackageName(key: string): Promise<void> {
	try {
		// 获取当前执行目录
		const currentDir = process.cwd()
		const packageJsonPath = path.join(currentDir, 'package.json')

		// 读取 package.json
		const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
		const packageJson = JSON.parse(packageJsonContent)

		// 获取 package name
		const packageName = packageJson.name || ''

		if (!packageName) {
			// eslint-disable-next-line no-console
			console.error('❌ package.json 中没有找到 name 字段')
			process.exit(1)
		}
		env.updateFile({ [key]: packageName })
	} catch (error) {
		// eslint-disable-next-line no-console
		console.error('error: ❌ 发生未知错误', error)
		process.exit(1)
	}
}

// 主函数
async function main() {
	// 获取命令行参数
	const key = process.argv[2]

	if (!key) {
		// eslint-disable-next-line no-console
		console.error('❌ 请提供环境变量的 key 作为参数')
		// eslint-disable-next-line no-console
		console.error('使用方法: env <key>')
		process.exit(1)
	}

	await setEnvFromPackageName(key)
}

// 执行主函数
main().catch((error) => {
	// eslint-disable-next-line no-console
	console.error('❌ 程序执行失败:', error)
	process.exit(1)
})
