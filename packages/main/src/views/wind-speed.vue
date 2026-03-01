<script setup lang="ts">
import type { Viewer } from 'cesium'
import type { ShallowRef } from 'vue'
import { useViewer, useWindSpeed } from '@cesium/viewer'
import { onMounted, shallowRef, useTemplateRef } from 'vue'
import windData from '../data/wind.json'// 风向数据

const cesiumContainerRef = useTemplateRef('cesiumContainer')
const viewer = useViewer(cesiumContainerRef) as ShallowRef<Viewer>
const windDataRef = shallowRef(windData)

const { startWind, stopWind } = useWindSpeed(viewer, windDataRef)

onMounted(() => {
  startWind()

  setTimeout(() => {
    stopWind()
  }, 10000)
})
</script>

<template>
  <div ref="cesiumContainer" />
</template>

<style scoped>

</style>
