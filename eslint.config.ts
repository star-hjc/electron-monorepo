import path from 'node:path'
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import oxlint from 'eslint-plugin-oxlint'
import { electronPlugin } from '@package/eslint'
import workspace from '@package/workspace'
import * as dotenv from 'dotenv'

dotenv.config()

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
