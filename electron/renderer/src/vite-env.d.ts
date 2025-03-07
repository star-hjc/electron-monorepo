// eslint-disable-next-line spaced-comment
/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORT: string;
    // 添加其他环境变量
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
