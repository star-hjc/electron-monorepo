import { config as loadEnv } from 'dotenv'
import path from 'path'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
// 加载 .env 文件并获取加载的环境变量
const env = loadEnv({ path: path.resolve(__dirname, `../.env${process.argv[2] || ''}`) })?.parsed || {}

const filePath = path.join(__dirname, '../electron/main/env/index.ts')
const parentDir = path.dirname(filePath)
ensureDirectoryExists(parentDir)
writeFileSync(filePath, `export default ${JSON.stringify(env, null, 4)}`)
// console.log(h)
function ensureDirectoryExists(dirPath:string) {
	if (!existsSync(dirPath)) {
		mkdirSync(dirPath, { recursive: true })
	}
}
