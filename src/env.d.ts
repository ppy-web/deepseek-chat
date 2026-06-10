/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '@/*' {
  const value: unknown
  export default value
}

declare module 'unplugin-vue-components/vite' {
  import type { Plugin } from 'vite'
  export default function Components(options?: Record<string, unknown>): Plugin
}

declare module 'unplugin-auto-import/vite' {
  import type { Plugin } from 'vite'
  export default function AutoImport(options?: Record<string, unknown>): Plugin
}

declare module '@tailwindcss/vite' {
  import type { Plugin } from 'vite'
  export default function tailwindcss(): Plugin
}
