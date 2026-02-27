import vue from '@vitejs/plugin-vue'
import UnoCss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { defineConfig } from 'vite'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [
    cesium(),
    UnoCss(),
    vue(),
    AutoImport({
      imports: ['vue'],
      dts: 'typings/auto-imports.d.ts',
    }),
  ],
})
