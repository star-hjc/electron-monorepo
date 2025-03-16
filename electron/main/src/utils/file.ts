import fs from 'node:fs'
import path from 'node:path'

/**
 * @param {String} filePath 文件路径
 * @returns {Boolean}
 */
function lstatSync(filePath:string): fs.Stats {
	try {
		return fs.lstatSync(filePath)
	} catch {
		return null
	}
}

/**
 * 是否是文件夹
 * true:是文件夹 false:不是文件夹或路径不存在
 * @param {String} filePath 文件路径
 * @returns {Boolean}
 */
export function isDirectorySync(filePath:string):boolean {
	try {
		const stat = lstatSync(filePath)
		return stat.isDirectory()
	} catch {
		return false
	}
}

/**
 * 是否是路径
 * true:是路径 false:路径不存在
 * @param {String} filePath 文件路径
 * @returns {Boolean}
 */
export function existsSync(filePath:string):boolean {
	try {
		return fs.existsSync(filePath)
	} catch {
		return false
	}
}

/**
 * 获取基础文件夹路径（如果路径是文件夹返回文件夹路径，文件则返回上一级文件夹）
 * @param {String} filePath 文件路径
 * @returns {String}
 */
export function getFolderPath(filePath:string):fs.PathLike {
	return isDirectorySync(filePath) ? filePath : path.join(filePath, '..')
}
