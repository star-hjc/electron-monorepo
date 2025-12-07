import { defineConfig } from 'vitepress'
import { MermaidMarkdown, MermaidPlugin } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	vite: {
		plugins: [MermaidPlugin()],
		optimizeDeps: {
			include: ['mermaid'],
		},
		ssr: {
			noExternal: ['mermaid'],
		}
	},
	markdown: {
		config(md) {
			md.use(MermaidMarkdown);
		},
	},
	title: 'electron-monorepo',
	description: '有些时候，看不下去了。就想自己造一个轮子',
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: '指南', link: '/guide' }
		],

			sidebar: [
				{
					text: '指南',
					items: [
						{ text: '简介', link: '/guide/introduction' },
						{ text: '快速开始', link: '/guide' },
						{ text: '开发与构建流程', link: '/guide/run-order' }
					]
				},
					{
						text: '模块',
						items: [
							{ text: '进程通信（IPC）', link: '/api/ipc' },
							{ text: '窗口管理（wins）', link: '/api/windows' },
							{ text: 'Pinia 跨窗口同步', link: '/api/pinia-sync' },
							{ text: '预加载（preload）', link: '/api/preload' }
						]
					}
				,
						{
							text: '工具',
							items: [
								{ text: '通用工具（common）', link: '/packages/common' },
								{ text: '工作区工具（workspace）', link: '/packages/workspace' }
							]
						},
						{
							text: '原生',
							items: [
								{ text: '原生桥接（bridge）', link: '/packages/bridge' },
								{ text: '原生扩展（N-API）', link: '/packages/napi' },
								{ text: 'WASM 集成', link: '/packages/wasm' }
							]
						},
						{
							text: '平台与进程',
							items: [
								{ text: '原生平台（platform）', link: '/platform/index' },
								{ text: '原生进程（process/main）', link: '/process/main' }
							]
						},
				{
					text: '开发',
					items: [
						{ text: 'CLI', link: '/dev/cli' },
						{ text: 'macOS 构建', link: '/dev/build-macos' }
					]
				}
			],

		socialLinks: [
			{ icon: 'gitee', link: 'https://gitee.com/hejiachen/monorepo-electron-template' }
		]
	}
})
