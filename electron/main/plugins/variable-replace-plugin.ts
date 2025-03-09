import * as ts from 'typescript'
import path from 'path'
import { config as loadEnv } from 'dotenv'

const env = (() => {
	let env = {}
	if (process.env.NODE_ENV) {
		env = loadEnv({ path: path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`) }).parsed || {}
	}
	env = { ...loadEnv({ path: path.resolve(__dirname, `../../../.env`) }).parsed || {}}
	return Object.entries(env).reduce((a, b) => {
		a[`process.env.${b[0]}`] = b[1]
		return a
	}, {})
})()

export default function stringReplaceTransformer() {
	return (context) => {
		return (sourceFile) => {
			function visitor(node: ts.Node): ts.Node {
				if (ts.isPropertyAccessExpression(node)) {
					const key = node.getFullText().trim()
					if (env[key]) {
						return ts.factory.createStringLiteral(env[key])
					}
				}
				return ts.visitEachChild(node, visitor, context)
			}
			return ts.visitNode(sourceFile, visitor)
		}
	}
}
