import { TianDiTuGeocoderService, useViewer } from '@cesium/viewer'
import { defineComponent, useTemplateRef } from 'vue'

export default defineComponent(() => {
  const containerRef = useTemplateRef('container')

  useViewer(containerRef, {
    geocoder: [new TianDiTuGeocoderService()],
  })

  return () => {
    return <div ref="container" class="h-100vh w-100vw" />
  }
})
