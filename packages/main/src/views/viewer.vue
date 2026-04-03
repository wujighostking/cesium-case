<script setup lang="ts">
import { useViewer } from '@cesium/viewer'
import { createImageryLayer, tianDiTuKey } from 'utils'
import { useTemplateRef } from 'vue'

const cesiumContainerRef = useTemplateRef('cesiumContainer')
useViewer(cesiumContainerRef, {
  baseLayer: createImgImageryLayer(),
})

function createImgImageryLayer() {
  return createImageryLayer({
    url: `https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=img&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  })
}
</script>

<template>
  <div ref="cesiumContainer" class="h-100vh w-100vw" />
</template>

<style  scoped>

</style>
