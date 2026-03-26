import { useRoam, useViewer } from '@cesium/viewer'
import { defineComponent, useTemplateRef } from 'vue'

export default defineComponent(() => {
  const containerRef = useTemplateRef<HTMLDivElement>('container')

  const viewer = useViewer(containerRef)
  useRoam(viewer)

  return () => {
    return <div ref="container"></div>
  }
})
