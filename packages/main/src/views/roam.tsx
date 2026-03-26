import { useRoam, useRouteCruise, useViewer } from '@cesium/viewer'
import { defineComponent, useTemplateRef } from 'vue'

export default defineComponent(() => {
  const containerRef = useTemplateRef<HTMLDivElement>('container')

  const viewer = useViewer(containerRef)
  const { stop } = useRoam(viewer)
  stop()

  const { pause, resume } = useRouteCruise(viewer, {
    coordinates: [
      [116, 23, 1000],
      [117, 23, 1000],
      [118, 23, 1000],
      [119, 23, 1000],
      [120, 23, 1000],
      [121, 23, 1000],
      [122, 23, 1000],
    ],
    speed: 200,
  })

  setTimeout(() => {
    pause()
  }, 2000)

  setTimeout(() => {
    resume()
  }, 5000)

  return () => {
    return <div ref="container" class="h-100vh"></div>
  }
})
