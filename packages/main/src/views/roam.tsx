/* eslint-disable no-loss-of-precision */
import { useRoam, useRouteCruise, useViewer } from '@cesium/viewer'
import { createImageryLayer, drawRouteLine, tianDiTuKey } from 'utils'
import { defineComponent, onMounted, useTemplateRef } from 'vue'

function createImgImageryLayer() {
  return createImageryLayer({
    url: `https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=img&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  })
}

export default defineComponent(() => {
  const containerRef = useTemplateRef<HTMLDivElement>('container')

  const viewer = useViewer(containerRef, {
    baseLayer: createImgImageryLayer(),
  })
  const { stop } = useRoam(viewer)
  stop()

  const coordinates: [number, number, number][] = [
    [113.4, 23.343350937000037, 1000],
    [113.41, 23.343325030000028, 1000],
    [113.42, 23.343363754000863, 1000],
    [113.43, 23.343448056000068, 1000],
    [113.44, 23.343623321000064, 1000],
    [113.45, 23.34381135600007, 1000],
    [113.45, 23.344031608000034, 1000],
    [113.47, 23.344426226800864, 1000],
    [113.48, 23.344954275000032, 1000],
    [113.49, 23.345266268000857, 1000],
    [113.50, 23.345382554800037, 1000],
    [113.51, 23.344980649000847, 1000],
    [113.52, 23.34449598400086, 1000],
    [113.53, 23.34350793580086, 1000],
    [113.54, 23.342959855000072, 1000],
    [113.55, 23.342693826860027, 1000],
    [113.56, 23.342571364000848, 1000],
    [113.57, 23.342433625000024, 1000],
    [113.58, 23.340899211000033, 1000],
    [113.59, 23.340899211000833, 1000],
  ]

  const { pause, resume } = useRouteCruise(viewer, {
    coordinates,
    speed: 200,
  })

  setTimeout(() => {
    pause()
  }, 2000)

  setTimeout(() => {
    resume()
  }, 5000)

  onMounted(() => {
    const positions: [number, number, number][] = coordinates.map((position) => {
      const [lon, lat, height] = position
      return [lon, lat, height - 20]
    })
    drawRouteLine(viewer.value, positions)
  })

  return () => {
    return <div ref="container" class="h-100vh"></div>
  }
})
