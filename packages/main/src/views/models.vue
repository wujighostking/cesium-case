<script setup lang="ts">
import { useModels, useViewer } from '@cesium/viewer'
import { Cartesian3 } from 'cesium'
import { useTemplateRef } from 'vue'

const cesiumContainerRef = useTemplateRef('cesiumContainer')

const viewer = useViewer(cesiumContainerRef)
// const stop = useModels(
//   viewer,
//   '/tileset/dragon/tileset.json',
//   {
//     adjustOptions: {
//       longitude: 116.4074,
//       latitude: 39.9042,
//       heightOffset: 500,
//       roll: 0,
//     },
//     offset: new HeadingPitchRange(0, 0, 0),
//     callback: () => {
//       stop()
//     },
//   },
// )

useModels(
  viewer,
  '/models/CesiumDrone/CesiumDrone.glb',
  {
    name: 'Cesium_Air',
    position: Cartesian3.fromDegrees(116.4074, 39.9042, 500),
    callback: (entity) => {
      viewer.value.clockViewModel.shouldAnimate = true
      viewer.value.trackedEntity = entity
    },
  },
)
</script>

<template>
  <div ref="cesiumContainer" class="h-100vh" />
</template>

<style lang="less" scoped>

</style>
