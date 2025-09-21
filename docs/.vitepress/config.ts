import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
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
					{ text: 'Runtime API Examples', link: '/api-examples' }
				]
			}
		],

		socialLinks: [
			{ icon: 'gitee', link: 'https://gitee.com/hejiachen/monorepo-electron-template' }
		]
	}
})
