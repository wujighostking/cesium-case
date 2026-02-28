<script setup lang="ts">
import { useCompare, useViewer } from '@cesium/viewer'
import { ImageryLayer, UrlTemplateImageryProvider } from 'cesium'
import { useTemplateRef, watchEffect } from 'vue'

const containerRef = useTemplateRef('cesiumContainer')
const viewer = useViewer(containerRef)

watchEffect(() => {
  if (!viewer.value)
    return

  useCompare(
    viewer.value,
    createVecImageryLayer(),
    createImgImageryLayer(),
    document.getElementById('slider') as HTMLDivElement,
  )
})

const tianDiTuKey = 'd3bd4850920690f790ce6d52a9ad73af'
function createVecImageryLayer() {
  return new ImageryLayer(
    new UrlTemplateImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=vec&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    }),
  )
}
function createImgImageryLayer() {
  return new ImageryLayer(
    new UrlTemplateImageryProvider({
      url: `https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=img&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    }),
  )
}
</script>

<template>
  <div ref="cesiumContainer" class="fullSize">
    <div id="slider" />
  </div>

  <div id="toolbar" />
</template>

<style scoped>
#slider {
  position: absolute;
  left: 50%;
  top: 0px;
  background-color: #d3d3d3;
  width: 5px;
  height: 100%;
  z-index: 9999;
}

#slider:hover {
  cursor: ew-resize;
}
</style>
