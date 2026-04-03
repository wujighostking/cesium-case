<!-- eslint-disable no-loss-of-precision -->
<script  setup lang="ts">
import {
  Ion,
  Viewer,
} from 'cesium'
import * as Cesium from 'cesium'
import { createImageryLayer, tianDiTuKey } from 'utils'
import { onMounted, useTemplateRef } from 'vue'

Ion.defaultAccessToken
  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMGI1YjVhZS03Y2YyLTQ5N2YtOWU0Mi0xM2IwYWZjNzNmNDQiLCJpZCI6OTE5ODUsImlhdCI6MTY1NDU5ODk1OH0.D3Yrv32C2nrT5arYin-anIgHIeAKLrSPH56xQzQPk8A'

const containerRef = useTemplateRef('container')

function createImgImageryLayer() {
  return createImageryLayer({
    url: `https://t{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&layer=img&style=default&tilematrixset=w&format=tiles&tilematrix={z}&tilerow={y}&tilecol={x}&tk=${tianDiTuKey}`,
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
  })
}

onMounted(() => {
  const startTime = new Date()
  let stopTime: Cesium.JulianDate

  const clock = new Cesium.Clock({
    startTime: Cesium.JulianDate.fromDate(startTime),
    currentTime: Cesium.JulianDate.fromDate(startTime),
    // stopTime: Cesium.JulianDate.fromDate(stopTime),
    clockRange: Cesium.ClockRange.LOOP_STOP,
    clockStep: Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER,
    multiplier: 10,
    shouldAnimate: true,
  })

  const viewer = new Viewer(containerRef.value!, {
    infoBox: false,
    selectionIndicator: false,
    geocoder: false,
    homeButton: false,
    baseLayerPicker: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    animation: false,
    timeline: false,
    creditContainer: document.createElement('div'),
    fullscreenButton: false,
    clockViewModel: new Cesium.ClockViewModel(clock),

    baseLayer: createImgImageryLayer(),
  })

  viewer.scene.globe.depthTestAgainstTerrain = true

  const pathData: [number, number, number][] = [
    [113.45711196300015, 23.343350937000037, 1000],
    [113.45620292500007, 23.343325030000028, 1100],
    [113.45545284400009, 23.343363754000863, 1200],
    [113.45473256600008, 23.343448056000068, 1300],
    [113.45399052200003, 23.343623321000064, 1290],
    [113.45347615200001, 23.34381135600007, 1240],
    [113.45292459000007, 23.344031608000034, 1000],
    [113.45192097000006, 23.344426226800864, 1000],
    [113.45065835500009, 23.344954275000032, 1000],
    [113.44980033200011, 23.345266268000857, 1000],
    [113.44920128900003, 23.345382554800037, 1000],
    [113.44897692800009, 23.344980649000847, 1000],
    [113.44872415000009, 23.34449598400086, 1000],
    [113.44948683700011, 23.34350793580086, 1000],
    [113.45089297600009, 23.342959855000072, 1000],
    [113.45149371900004, 23.342693826860027, 1000],
    [113.45166848000808, 23.342571364000848, 1000],
    [113.45163585200015, 23.342433625000024, 1000],
    [113.45082070700005, 23.340899211000033, 1000],
    [113.45082070700005, 23.340899211000833, 1000],
  ]

  // 使用 CatmullRomSpline 对路径点做平滑插值
  const rawPositions = pathData.map(pos => Cesium.Cartesian3.fromDegrees(...pos))
  const times = rawPositions.map((_, i) => i / (rawPositions.length - 1))
  const spline = new Cesium.CatmullRomSpline({
    times,
    points: rawPositions,
  })

  const smoothCount = rawPositions.length * 10
  const smoothPositions: [number, number, number][] = []
  for (let i = 0; i <= smoothCount; i++) {
    const cartesian = spline.evaluate(i / smoothCount)
    const carto = Cesium.Cartographic.fromCartesian(cartesian)
    smoothPositions.push([
      Cesium.Math.toDegrees(carto.longitude),
      Cesium.Math.toDegrees(carto.latitude),
      carto.height,
    ])
  }

  const polyline = viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights(smoothPositions.flat()),
      material: new Cesium.Color(1, 0, 0, 0.5),
      width: 3,
    // show: false,
    },
  })

  const property = new Cesium.SampledPositionProperty()

  smoothPositions.forEach((pos, index) => {
    const tempTime = new Cesium.JulianDate()
    Cesium.JulianDate.addSeconds(viewer.clock.currentTime, index * 4, tempTime)

    if (index === smoothPositions.length - 1) {
      stopTime = Cesium.JulianDate.addSeconds(
        viewer.clock.currentTime,
        (index - 1) * 4,
        tempTime,
      )
    }
    property.addSample(tempTime, Cesium.Cartesian3.fromDegrees(...pos))
  })

  viewer.clock.stopTime = stopTime!

  const entity = viewer.entities.add({
    position: property,

    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: viewer.clock.startTime,
        stop: viewer.clock.stopTime,
      }),
    ]),
    path: {
      leadTime: 0,
      resolution: 1,
      width: 10,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.5,

        color: new Cesium.Color(0, 1, 0, 1),
      }),
    // show: false,
    },

    model: {
      uri: '/models/CesiumAir/Cesium_Air.glb',
      minimumPixelSize: 64,
    },
    orientation: new Cesium.VelocityOrientationProperty(property),
  })

  viewer.zoomTo(polyline)
  viewer.trackedEntity = entity
})
</script>

<template>
  <div ref="container" class="h-100vh w-100vw" />
</template>
