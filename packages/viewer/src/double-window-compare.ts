import type { Viewer } from 'cesium'
import { Cesium3DTileset, ImageryLayer, Model, Primitive, ScreenSpaceEventHandler, ScreenSpaceEventType, SplitDirection } from 'cesium'

export function useDoubleWindowCompare(leftViewer: Viewer, rightViewer: Viewer) {
  function trackRight() {
    const leftViewerCamera = leftViewer.camera
    rightViewer.camera.setView({ // 右边相机要跟随左边相机移动
      destination: leftViewerCamera.position,
      orientation: {
        direction: leftViewerCamera.direction,
        up: leftViewerCamera.up,
        heading: leftViewerCamera.heading,
        pitch: leftViewerCamera.pitch,
        roll: leftViewerCamera.roll,
      },
    })
  }

  function trackLeft() {
    const rightViewerCamera = rightViewer.camera
    leftViewer.camera.setView({ // 右边相机要跟随左边相机移动
      destination: rightViewerCamera.position,
      orientation: {
        direction: rightViewerCamera.direction,
        up: rightViewerCamera.up,
        heading: rightViewerCamera.heading,
        pitch: rightViewerCamera.pitch,
        roll: rightViewerCamera.roll,
      },
    })
  }

  function mouseSyncListen() {
    if (leftViewer && rightViewer) {
      // 场景渲染事件同步左右视图的跟踪
      leftViewer.scene.postRender.addEventListener(trackRight)
      rightViewer.scene.postRender.addEventListener(trackLeft)
    }
  }

  mouseSyncListen()
}

type Splittable = Model | Cesium3DTileset | ImageryLayer
export function useCompare<T = any>(Viewer: Viewer, left: T, right: T, slider: HTMLDivElement): void
export function useCompare(Viewer: Viewer, left: Cesium3DTileset, right: Cesium3DTileset, slider: HTMLDivElement): void
export function useCompare(Viewer: Viewer, left: Model, right: Model, slider: HTMLDivElement): void

export function useCompare(viewer: Viewer, left: Splittable, right: Splittable, slider: HTMLDivElement) {
  if (left instanceof ImageryLayer && right instanceof ImageryLayer) {
    viewer.scene.imageryLayers.add(left)
    viewer.scene.imageryLayers.add(right)
  }
  else if (left instanceof Cesium3DTileset && right instanceof Cesium3DTileset) {
    viewer.scene.primitives.add(left)
    viewer.scene.primitives.add(right)
  }
  else if (left instanceof Model && right instanceof Model) {
    viewer.scene.primitives.add(left)
    viewer.scene.primitives.add(right)
  }
  else if (left instanceof Primitive && right instanceof Primitive) {
    viewer.scene.primitives.add(left)
    viewer.scene.primitives.add(right)
  }

  left.splitDirection = SplitDirection.LEFT
  viewer.zoomTo(left as any)
  right.splitDirection = SplitDirection.RIGHT

  // Sync the position of the slider with the split position
  viewer.scene.splitPosition
    = slider.offsetLeft / slider.parentElement!.offsetWidth

  const handler = new ScreenSpaceEventHandler(slider as any)

  let moveActive = false

  function move(movement: any) {
    if (!moveActive) {
      return
    }

    const relativeOffset = movement.endPosition.x
    const splitPosition
      = (slider.offsetLeft + relativeOffset) / slider.parentElement!.offsetWidth
    slider.style.left = `${100.0 * splitPosition}%`
    viewer.scene.splitPosition = splitPosition
  }

  handler.setInputAction(() => {
    moveActive = true
  }, ScreenSpaceEventType.LEFT_DOWN)
  handler.setInputAction(() => {
    moveActive = true
  }, ScreenSpaceEventType.PINCH_START)

  handler.setInputAction(move, ScreenSpaceEventType.MOUSE_MOVE)
  handler.setInputAction(move, ScreenSpaceEventType.PINCH_MOVE)

  handler.setInputAction(() => {
    moveActive = false
  }, ScreenSpaceEventType.LEFT_UP)
  handler.setInputAction(() => {
    moveActive = false
  }, ScreenSpaceEventType.PINCH_END)
}
