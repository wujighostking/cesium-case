import { useModels, useViewer } from '@cesium/viewer'
import { Cartesian3 } from 'cesium'
import { createImageryLayer, tianDiTuKey } from 'utils'
import { defineComponent, onMounted, useTemplateRef } from 'vue'

export default defineComponent(() => {
  const containerRef = useTemplateRef<HTMLDivElement>('container')

  const viewer = useViewer(containerRef, {
    baseLayer: createImgImageryLayer(),
  })

  function createImgImageryLayer() {
    return createImageryLayer({
      url: `https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=img&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    })
  }

  onMounted(() => {
    viewer.value.scene.fog.enabled = false
    viewer.value.scene.globe.enableLighting = false
    viewer.value.shadows = false

    viewer.value.scene.postProcessStages.fxaa.enabled = false
    // viewer.value.resolutionScale = 0.5
  })

  for (let i = 0; i < 700; i++) {
    const heightOffset = Math.random() * 50
    const lngOffset = Math.random() * 2 - 1
    const latOffset = Math.random() * 2 - 1
    useModels(
      viewer,
      '/models/CesiumDrone/CesiumDrone.glb',
      {
        name: 'Cesium_Air',
        position: Cartesian3.fromDegrees(116 + lngOffset, 39 + latOffset, 500 + heightOffset),
        minimumPixelSize: 64,
        callback: (entity) => {
          viewer.value.clockViewModel.shouldAnimate = true
          // viewer.value.trackedEntity = entity
          viewer.value.zoomTo(entity)
        },
      },
    )
  }

  return () => {
    return <div ref="container" class="h-100vh"></div>
  }
})
