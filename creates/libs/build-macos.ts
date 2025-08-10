import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

const macosRootPath = path.resolve(__dirname, '../macos')
const macosFiles = fs.readdirSync(macosRootPath)
const macosLibsPath: string[] = []

macosFiles.forEach((item) => {
	const fullPath = path.resolve(macosRootPath, item)
	const fileStat = fs.statSync(fullPath)
	if (fileStat.isDirectory()) {
		macosLibsPath.push(fullPath)
	}
})

macosLibsPath.forEach((libPath) => {
	console.log(`⭐️start build swift project ${libPath}`)
	exec('swift build -c release', { cwd: libPath })
	// spawn('swift', ['build -c release'], { cwd: libPath, stdio: 'inherit' });
})
