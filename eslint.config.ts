import path from 'node:path'
import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import workspace from '@package/workspace'
import oxlint from 'eslint-plugin-oxlint'
import type { Rule } from 'eslint'
import type { ImportDeclaration } from 'estree'

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
	{ ignores: ['.husky/**/*', '**/dist/**', '**/node_modules/**', 'neon-bridge/**', 'docs/.vitepress/**/*', 'electron/renderer/types/ipc.d.ts'] },
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
				allowedFolder: [path.join(workspace.getElectronMain(), '/src/ipc')]
			}],
			'max-len': [2, {
				code: 150,
				tabWidth: 2,
				ignoreComments: true,
				ignoreUrls: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreRegExpLiterals: true
			}],
			'linebreak-style': [2, 'unix'],
			'accessor-pairs': 2,
			'arrow-spacing': [
				2,
				{
					before: true,
					after: true
				}
			],
			'block-spacing': [2, 'always'],
			'brace-style': [
				2,
				'1tbs',
				{
					allowSingleLine: true
				}
			],
			camelcase: [
				0,
				{
					properties: 'always'
				}
			],
			'comma-dangle': [2, 'never'],
			'comma-spacing': [
				2,
				{
					before: false,
					after: true
				}
			],
			'comma-style': [2, 'last'],
			'constructor-super': 2,
			'curly': [2, 'multi-line'],
			'dot-location': [2, 'property'],
			'eol-last': 2,
			'eqeqeq': ['error', 'always', { null: 'ignore' }],
			'generator-star-spacing': [
				2,
				{
					before: true,
					after: true
				}
			],
			'handle-callback-err': [2, '^(err|error)$'],
			'indent': [
				2,
				'tab',
				{
					SwitchCase: 1
				}
			],
			'jsx-quotes': [2, 'prefer-single'],
			'key-spacing': [
				2,
				{
					beforeColon: false,
					afterColon: true
				}
			],
			'keyword-spacing': [
				2,
				{
					before: true,
					after: true
				}
			],
			'new-cap': [
				2,
				{
					newIsCap: true,
					capIsNew: false
				}
			],
			'new-parens': 2,
			'no-array-constructor': 2,
			'no-caller': 2,
			'no-class-assign': 2,
			'no-cond-assign': 2,
			'no-const-assign': 2,
			'no-control-regex': 0,
			'no-delete-var': 2,
			'no-dupe-args': 2,
			'no-dupe-class-members': 2,
			'no-dupe-keys': 2,
			'no-duplicate-case': 2,
			'no-empty-character-class': 2,
			'no-empty-pattern': 2,
			'no-eval': 2,
			'no-ex-assign': 2,
			'no-extend-native': 2,
			'no-extra-bind': 2,
			'no-extra-boolean-cast': 2,
			'no-extra-parens': [2, 'functions'],
			'no-fallthrough': 2,
			'no-floating-decimal': 2,
			'no-func-assign': 2,
			'no-implied-eval': 2,
			'no-inner-declarations': [2, 'functions'],
			'no-invalid-regexp': 2,
			'no-irregular-whitespace': 2,
			'no-iterator': 2,
			'no-label-var': 2,
			'no-labels': [
				2,
				{
					allowLoop: false,
					allowSwitch: false
				}
			],
			'no-lone-blocks': 2,
			'no-mixed-spaces-and-tabs': 2,
			'no-multi-spaces': 2,
			'no-multi-str': 2,
			'no-multiple-empty-lines': [
				2,
				{
					max: 1
				}
			],
			'no-native-reassign': 2,
			'no-negated-in-lhs': 2,
			'no-new-object': 2,
			'no-new-require': 2,
			'no-new-symbol': 2,
			'no-new-wrappers': 2,
			'no-obj-calls': 2,
			'no-octal': 2,
			'no-octal-escape': 2,
			'no-path-concat': 2,
			'no-proto': 2,
			'no-redeclare': 2,
			'no-regex-spaces': 2,
			'no-return-assign': [2, 'except-parens'],
			'no-self-assign': 2,
			'no-self-compare': 2,
			'no-sequences': 2,
			'no-shadow-restricted-names': 2,
			'no-spaced-func': 2,
			'no-sparse-arrays': 2,
			'no-this-before-super': 2,
			'no-throw-literal': 2,
			'no-trailing-spaces': 2,
			'no-undef': 2,
			'no-undef-init': 2,
			'no-unexpected-multiline': 2,
			'no-unmodified-loop-condition': 2,
			'no-unneeded-ternary': [
				2,
				{
					defaultAssignment: false
				}
			],
			'no-unreachable': 2,
			'no-unsafe-finally': 2,
			'no-unused-vars': [
				2,
				{
					vars: 'all',
					args: 'none'
				}
			],
			'no-useless-call': 2,
			'no-useless-computed-key': 2,
			'no-useless-constructor': 2,
			'no-useless-escape': 0,
			'no-whitespace-before-property': 2,
			'no-with': 2,
			'one-var': [
				2,
				{
					initialized: 'never'
				}
			],
			'operator-linebreak': [
				2,
				'after',
				{
					overrides: {
						'?': 'before',
						':': 'before'
					}
				}
			],
			'padded-blocks': [2, 'never'],
			quotes: [
				2,
				'single',
				{
					avoidEscape: true,
					allowTemplateLiterals: true
				}
			],
			semi: [2, 'never'],
			'semi-spacing': [
				2,
				{
					before: false,
					after: true
				}
			],
			'space-before-blocks': [2, 'always'],
			'space-before-function-paren': [2, 'never'],
			'space-in-parens': [2, 'never'],
			'space-infix-ops': 2,
			'space-unary-ops': [
				2,
				{
					words: true,
					nonwords: false
				}
			],
			'spaced-comment': [
				2,
				'always',
				{
					markers: ['global', 'globals', 'eslint', 'eslint-disable', '*package', '!', ',']
				}
			],
			'template-curly-spacing': [2, 'never'],
			'use-isnan': 2,
			'valid-typeof': 2,
			'wrap-iife': [2, 'any'],
			'yield-star-spacing': [2, 'both'],
			yoda: [2, 'never'],
			'prefer-const': 2,
			'object-curly-spacing': [
				2,
				'always',
				{
					objectsInObjects: false
				}
			],
			'array-bracket-spacing': [2, 'never'],
			'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
			'no-console': process.env.NODE_ENV === 'production' ? 2 : 1
		}
	},
	...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json')
]
