<script setup lang="ts">
import { useSphereViewer } from '@cesium/viewer'
import { useTemplateRef } from 'vue'
import '@photo-sphere-viewer/core/index.css'

const containerRef = useTemplateRef('container')

useSphereViewer(containerRef, '/images/sphere.jpg', {
  mousemove: true,
})
</script>

<template>
  <div ref="container" class="h-100vh w-100vw" />
</template>

<style scoped>

</style>
