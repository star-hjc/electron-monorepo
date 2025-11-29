import path from 'node:path'
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import oxlint from 'eslint-plugin-oxlint'
import type { Rule } from 'eslint'
import type { ImportDeclaration } from 'estree'
import workspace from '@package/workspace'
import * as dotenv from 'dotenv'
dotenv.config()

const ipcRestrictedImport = {
	meta: {
		type: 'problem',
		docs: {
			description: '限制 IpcConnector 模块只能在特定文件夹中使用',
			category: 'Best Practices',
			recommended: true
		},
		schema: [{
			type: 'object',
			properties: {
				allowedFolder: {
					type: 'array',
					items: { type: 'string' },
					description: '允许使用 IpcConnector 模块 的文件夹'
				}
			},
			additionalProperties: false
		}]
	},
	create(context:Rule.RuleContext) {
		const options = context.options[0]
		const allowedFolder: string[] = options.allowedFolder || []
		const currentFilename = context.filename
		const moduleNames = ['modules/ipcConnector', '@IpcConnector']
		const isAllowedFile = allowedFolder.some(allowedFolder => {
			if (!path.isAbsolute(allowedFolder)) {
				// eslint-disable-next-line no-console
				console.error(`electron/ipc-restricted-import 规则中 allowedFolder参数 必须是绝对路径! allowedFolder:${allowedFolder}`)
				return false
			}
			return path.normalize(currentFilename).startsWith(path.normalize(allowedFolder))
		})

		return {
			ImportDeclaration(node: ImportDeclaration) {
				if (isAllowedFile) {
					return
				}
				const importSource = node.source.value
				if (typeof (importSource) === 'string' && moduleNames.includes(importSource)) {
					context.report({
						node,
						message: `禁止在此文件中使用 IpcConnector 模块, 只能在 ${allowedFolder.join(' , ')} 文件夹中使用`
					})
				}
			}
		}
	}
}

const electronPlugin = {
	rules: {
		'ipc-restricted-import': ipcRestrictedImport
	}
}

/** @type {import('eslint').Linter.Config[]} */
export default [
	/** 忽略文件 */
	{ ignores: ['.husky/**/*', '.devtools/**/*', 'cli/bin/**', '**/dist/**', '**/node_modules/**', 'neon-bridge/**', 'docs/.vitepress/**/*', 'electron/renderer/types/ipc.d.ts'] },
	/* 全局环境变量 */
	{ languageOptions: { globals: { ...globals.browser, ...globals.node, ipc: true }}},
	/** TS 默认格式规则 */
	pluginJs.configs.recommended,
	/** TS 默认格式规则 */
	...tseslint.configs.recommended,
	/** VUE 默认格式规则 */
	...pluginVue.configs['flat/essential'],
	/** 自定义 VUE HTML 格式规则 */
	{
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		},
		rules: {
			'vue/html-indent': [2, 'tab'],
			'vue/max-attributes-per-line': [
				2,
				{
					singleline: 4,
					multiline: 4
				}
			],
			'vue/html-closing-bracket-newline': [
				2,
				{
					singleline: 'never',
					multiline: 'always'
				}
			]
		}
	},
	/** 自定义 TS, VUE TS 格式规则*/
	{
		files: ['**/*.{ts, vue}'],
		plugins: { electron: electronPlugin },
		rules: {
			'electron/ipc-restricted-import': [2, {
				allowedFolder: [path.join(workspace.getWorkspaceByName(process.env.ELECTRON_MAIN || ''), '/src/ipc')]
			}],
			'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 1,
			'no-console': process.env.NODE_ENV === 'production' ? 2 : 1
		}
	},
	...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json')
]
