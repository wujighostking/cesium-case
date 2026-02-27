import type { useTemplateRef } from 'vue'
import { Camera, Rectangle, Viewer } from 'cesium'
import { isElement, isString } from 'utils'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

type ViewerParams = ConstructorParameters<typeof Viewer>
type Container = ReturnType<typeof useTemplateRef>

export function useViewer(container: Container, options?: ViewerParams[1]) {
  const viewerInstance = shallowRef<Viewer | null>(null)

  Camera.DEFAULT_VIEW_RECTANGLE = Rectangle.fromDegrees(112.6, 22.4, 114.0, 23.7)

  options = {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    vrButton: false,
    creditContainer: document.createElement('div'),

    ...options,
  }

  onMounted(() => {
    if (!isString(container.value) && !isElement(container.value)) {
      throw new Error('container must be an Element')
    }

    viewerInstance.value = new Viewer(container.value, options)
  })

  onBeforeUnmount(() => {
    viewerInstance.value?.destroy?.()
    viewerInstance.value = null
  })

  return viewerInstance
}

interface EagleOptions {
  viewer: Viewer
  viewer2: Viewer
}
export function useEagleViewer(eagleOptions: EagleOptions) {
  const { viewer, viewer2 } = eagleOptions

  function eagleEye() {
    viewer2.scene.screenSpaceCameraController.enableInputs = false
    // 每一帧渲染时监听
    // viewer1.clock.onTick.addEventListener(this.syncCamera)
    // 场景渲染前添加监听
    viewer.scene.preRender.addEventListener(syncCamera)
  }

  function syncCamera() {
    viewer2.camera.flyTo({
      destination: viewer.camera.position,
      orientation: {
        heading: viewer.camera.heading,
        pitch: viewer.camera.pitch,
        roll: viewer.camera.roll,
      },
      duration: 0.0,
    })
  }

  eagleEye()
}
