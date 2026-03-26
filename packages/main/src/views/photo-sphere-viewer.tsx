import { useSphereViewer } from '@cesium/viewer'
import { defineComponent, useTemplateRef } from 'vue'
import '@photo-sphere-viewer/core/index.css'

export default defineComponent(() => {
  const containerRef = useTemplateRef<HTMLDivElement>('container')

  useSphereViewer(containerRef, '/images/sphere.jpg', {
    mousemove: true,
  })

  return () => {
    return <div ref="container" class="h-100vh w-100vw" />
  }
})
