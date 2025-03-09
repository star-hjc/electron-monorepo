import * as ts from 'typescript'
import fs from 'fs'
import path from 'path'

const parseIniFile = (data) => {
	const regex = {
		section: /^\s*\s*([^]*)\s*\]\s*$/,
		param: /^\s*([\w.\-_]+)\s*=\s*(.*?)\s*$/,
		comment: /^\s*;.*$/
	}
	const value: any = {}
	data = data.toString()
	const lines = data.split(/\r\n|\r|\n/)
	let section = null
	lines.forEach(function(line) {
		if (regex.comment.test(line)) {
			return
		} else if (regex.param.test(line)) {
			const match = line.match(regex.param)
			if (section) {
				value[section][match[1]] = match[2]
			} else {
				value[match[1]] = match[2]
			}
		} else if (regex.section.test(line)) {
			const match = line.match(regex.section)
			const _key = match[1].replace('[', '').replace(']', '')
			value[_key] = {}
			section = _key
		} else if (line.length === 0 && section) {
			section = null
		}
	})
	return value
}

const replaceVariables = {
	'process.env.NODE_ENV': process.env.NODE_ENV,
	'process.env.NODE_CONFIG': () => {
		const commonConfig = parseIniFile(fs.readFileSync(path.resolve(__dirname, '../../../.env')).toString())
		const envConfig = parseIniFile(fs.readFileSync(path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`)).toString())
		return JSON.stringify({ ...commonConfig, ...envConfig })
	}
}
const includeFiles: string[] = [
	'utils/common.util.ts'
]

export default function stringReplaceTransformer() {
	return (context) => {
		return (sourceFile) => {
			if (includeFiles.length > 0 && !includeFiles.some(file => sourceFile.fileName.includes(file))) {
				return sourceFile
			}

			function visitor(node: ts.Node): ts.Node {
				if (
					ts.isPropertyAccessExpression(node)
				) {
					const key = node.getFullText().trim()
					const replaceFunc = replaceVariables[key]
					if (typeof replaceFunc === 'string') {
						return ts.factory.createStringLiteral(replaceFunc)
					} else if (typeof replaceFunc === 'function') {
						return ts.factory.createStringLiteral(replaceFunc())
					}
				}

				return ts.visitEachChild(node, visitor, context)
			}
			return ts.visitNode(sourceFile, visitor)
		}
	}
}
