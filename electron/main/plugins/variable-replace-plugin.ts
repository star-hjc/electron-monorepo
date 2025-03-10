import * as ts from 'typescript'
import * as dotenv from 'dotenv'
import path from 'path'

const env = () => {
	const envDir = path.join(__dirname, `../../../`)
	const envPath = path.join(envDir, `.env`)
	const defaultEnvPath = path.join(envDir, `.env.${process.env.NODE_ENV || 'development'}`)
	const defaultEnv = dotenv.config({ path: defaultEnvPath }).parsed || {}
	const env = dotenv.config({ path: envPath }).parsed || {}
	return { ...defaultEnv, ...env }
}

const envMap = Object.entries(env()).reduce((a, b) => {
	a[`process.env.${b[0]}`] = b[1]
	return a
}, {})

export default function stringReplaceTransformer() {
	return (context) => {
		return (sourceFile) => {
			function visitor(node: ts.Node): ts.Node {
				if (ts.isPropertyAccessExpression(node)) {
					const key = node.getFullText().trim()
					if (envMap[key]) {
						return ts.factory.createStringLiteral(envMap[key])
					}
				}
				return ts.visitEachChild(node, visitor, context)
			}
			return ts.visitNode(sourceFile, visitor)
		}
	}
}
