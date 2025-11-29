// Type augmentation for Electron BrowserWindow options
export {}

declare global {
  namespace Electron {
    interface BrowserWindowConstructorOptions {
      name?: string
    }
  }
}
