<script setup lang="ts">
import { useEagleViewer, useViewer } from '@cesium/viewer'
import { createImageryLayer, tianDiTuKey } from 'utils'
import { useTemplateRef } from 'vue'

const cesiumContainerRef = useTemplateRef('cesiumContainer')
const eagleContainerRef = useTemplateRef('eagleContainer')

function createTianDiTuImageryLayer() {
  return createImageryLayer({
    url: `https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=img&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  })
}

const viewer = useViewer(cesiumContainerRef, {
  baseLayer: createTianDiTuImageryLayer(),
})

const eagleViewer = useViewer(eagleContainerRef, {
  baseLayer: createTianDiTuImageryLayer(),
})

useEagleViewer(
  viewer,
  eagleViewer,
)
</script>

<template>
  <div class="relative">
    <div ref="cesiumContainer" class="w-100vw h-100vh block" />
    <div
      ref="eagleContainer"
      class="absolute top-0 right-0 w-500px h-400px border border-#999 bg-black shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
    />
  </div>
</template>
