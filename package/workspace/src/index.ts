import { singleton } from '@package/common/singleton'
import { execSync } from 'child_process'
import { WorkspaceType } from './typings'

class Workspace {
	private readonly workspace: WorkspaceType
	private rootPath: string | null = null

	constructor() {
		this.workspace = JSON.parse(execSync('pnpm ls -r --json').toString())
	}

	getWorkspace(): WorkspaceType {
		return this.workspace
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
