import defineConfig from '@antfu/eslint-config'

export default defineConfig({
  formatters: true,
  unocss: true,
  vue: true,
  ignores: ['./packages/main/src/data/**', './packages/viewer/src/js/**'],
})
