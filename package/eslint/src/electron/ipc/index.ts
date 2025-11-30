import path from 'node:path'
import type { Rule } from 'eslint'
import type { ImportDeclaration } from 'estree'

export default {
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
  create(context: Rule.RuleContext) {
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