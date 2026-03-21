import type { ShallowRef, useTemplateRef } from 'vue'
import { Camera, Rectangle, Viewer } from 'cesium'
import { isElement, isString } from 'utils'
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'

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

export function useEagleViewer(viewer: ShallowRef<Viewer>, eagleViewer: ShallowRef<Viewer>) {
  function eagleEye() {
    eagleViewer.value.scene.screenSpaceCameraController.enableInputs = false
    // 每一帧渲染时监听
    // viewer.value.clock.onTick.addEventListener(syncCamera)
    // 场景渲染前添加监听
    viewer.value.scene.preRender.addEventListener(syncCamera)
  }

  function syncCamera() {
    eagleViewer.value.camera.flyTo({
      destination: viewer.value.camera.position,
      orientation: {
        heading: viewer.value.camera.heading,
        pitch: viewer.value.camera.pitch,
        roll: viewer.value.camera.roll,
      },
      duration: 0.0,
    })
  }

  return watch(() => [viewer.value, eagleViewer.value], (_, __, onCleanup) => {
    eagleEye()
    onCleanup(() => {
      viewer.value?.scene?.preRender?.removeEventListener(syncCamera)
    })
  })
}
