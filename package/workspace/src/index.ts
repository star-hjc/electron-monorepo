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

	getCommitHash(): string {
		try {
			return execSync('git rev-parse --short HEAD').toString().trim()
		} catch (error) {
			// 在打包后的应用中可能无法执行 git 命令
			// eslint-disable-next-line no-console
			console.warn('无法获取 git commit hash:', error)
			return 'unknown'
		}
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
