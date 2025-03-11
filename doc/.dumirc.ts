import { defineConfig } from 'dumi'
import fs from 'fs'


const customStyle = fs.readFileSync('./styles/global.css', 'utf-8').toString()

export default defineConfig({
	outputPath: 'docs-dist',
	themeConfig: {
		name: 'notes',
		toc: 'content'
	},
	styles: [customStyle]
})
