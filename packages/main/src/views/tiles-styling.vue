<script setup lang="ts">
import type { Viewer } from 'cesium'
import type { ShallowRef } from 'vue'
import { use3DTilesStyling, useViewer } from '@cesium/viewer'
import { Cesium3DTileStyle, ImageryLayer, UrlTemplateImageryProvider } from 'cesium'
import { ref, useTemplateRef } from 'vue'

const cesiumContainerRef = useTemplateRef('cesiumContainer')

const tianDiTuKey = 'd3bd4850920690f790ce6d52a9ad73af'
function createVecImageryLayer() {
  return new ImageryLayer(
    new UrlTemplateImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=vec&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    }),
  )
}

const viewer = useViewer(cesiumContainerRef, {
  baseLayer: createVecImageryLayer(),
}) as ShallowRef<Viewer>

const options = ref({
  url: '/tileset/testData/tileset.json',
  cesium3DTileStyle: new Cesium3DTileStyle({
    color: {
      conditions: [
        ['isExactClass(\'door\')', 'color(\'orange\')'],
        ['true', 'color(\'red\')'],
      ],
    },
  }),
})
use3DTilesStyling(viewer, options)

const timer = setTimeout(() => {
  const style = {
    color: {
      conditions: [
        ['isExactClass(\'door\')', 'color(\'orange\')'],
        ['true', 'color(\'white\')'],
      ],
    },
  }
  options.value.cesium3DTileStyle = style as any

  clearTimeout(timer)
}, 3000)
</script>

<template>
  <div ref="cesiumContainer" />
</template>

<style lang="scss" scoped>

</style>
