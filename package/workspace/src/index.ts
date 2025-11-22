import { singleton } from '@package/common/singleton'
import { execSync } from 'child_process'
import type { WorkspaceType, WorkspacePath } from './types'

class Workspace {
	private readonly workspace: WorkspaceType
	private rootPath: WorkspacePath
	private electronMain: WorkspacePath
	private electronRenderer: WorkspacePath

	constructor() {
		this.workspace = JSON.parse(execSync('pnpm ls -r --json').toString())
	}

	getWorkspace(): WorkspaceType {
		return this.workspace
	}

	getWorkspaceByName(name?: string): WorkspacePath {
		const item = this.workspace.find((item) => item.name === name)
		if (!item) throw new Error(`Cannot find ${name} in workspace`)
		return item.path
	}

	getElectronMain(): WorkspacePath {
		if (this.electronMain) return this.electronMain
		const path = this.getWorkspaceByName('@electron/main')
		this.electronMain = path
		return path
	}

	getElectronRenderer(): string {
		if (this.electronRenderer) return this.electronRenderer
		const path = this.getWorkspaceByName('@electron/renderer')
		this.electronRenderer = path
		return path
	}

	getRoot(): string {
		if (!this.rootPath) {
			this.rootPath = this.workspace.reduce((prev, curr) =>
				curr.path.length < prev.path.length ? curr : prev
			).path
		}
		return this.rootPath
	}
}

const WorkspaceSingleton = singleton(Workspace)

export default new WorkspaceSingleton()
