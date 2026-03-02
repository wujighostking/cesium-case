<script setup lang="ts">
import { useViewer } from '@cesium/viewer'
import { useTemplateRef } from 'vue'

const cesiumContainerRef = useTemplateRef('cesiumContainer')
useViewer(cesiumContainerRef)
</script>

<template>
  <div ref="cesiumContainer" />
</template>

<style  scoped>

</style>
