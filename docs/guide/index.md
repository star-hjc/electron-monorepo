# 快速开始

## 总览

electron-monorepo 是一个自定义构建，旨在为 Electron 提供更快、更精简的开发体验。它主要由五部分组成：

- 一套构建指令，在对应的模块包的package.json 配置启动命令，并由 [Turborepo](https://turbo.net.cn/)  配置条件启动。 它使用 [Vite](https://cn.vitejs.dev/) 打包你的渲染进程代码，使用 [Tsup](https://tsup.egoist.dev/) 处理 Electron 、各种模块包 的独特环境，包括 [Node.js](https://nodejs.org/zh-cn) 和浏览器环境。

- 为渲染进程 提供快速模块热替换（HMR）支持，为主进程和预加载脚本提供热重载支持，极大地提高了开发效率。

- 集中Eslint、环境变量、配置，一套配置共享 渲染进程、主进程、Rust子进程

- 优化 Electron 主进程资源处理。

- 对提交规范本地处理, 提交时自动检查代码规范，格式化代码。

electron-monorepo 快速、简单且功能强大，旨在开箱即用。

你可以在 [简介](/guide/introduction)  中了解更多关于项目的设计初衷。
