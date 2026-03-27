import type { Camera, Viewer } from 'cesium'
import type { ShallowRef } from 'vue'
import { Cartesian2, Cartesian3, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'
import { degreeToRadian, EMPTY_OBJECT, isNegative } from 'utils'
import { watch } from 'vue'

interface Options {
  amount?: number
  leftAmount?: number
  rightAmount?: number
  upAmount?: number
  downAmount?: number

  moveAmount?: number
  leftMoveAmount?: number
  rightMoveAmount?: number
  upMoveAmount?: number
  downMoveAmount?: number
  backwardMoveAmount?: number
  forwardMoveAmount?: number

  callback?: (e?: KeyboardEvent, viewer?: Viewer, camera?: Camera) => void
}

export type LookDirection = keyof Pick<Camera, 'lookLeft' | 'lookRight' | 'lookUp' | 'lookDown'>
export type MoveDirection = keyof Pick<Camera, 'moveBackward' | 'moveDown' | 'moveForward' | 'moveLeft' | 'moveRight' | 'moveUp'>

export function useRoam(viewer: ShallowRef<Viewer>, options?: Options) {
  const stop = watch([viewer], ([newViewer], __, onCleanup) => {
    const {
      leftAmount,
      rightAmount,
      upAmount,
      downAmount,
      amount = 1,

      leftMoveAmount,
      rightMoveAmount,
      upMoveAmount,
      downMoveAmount,
      backwardMoveAmount,
      forwardMoveAmount,
      moveAmount = 5,

      callback,
    } = options || EMPTY_OBJECT

    const camera = newViewer.camera

    function handleKeydown(e: KeyboardEvent) {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          _look(camera, 'lookLeft', leftAmount ?? amount)
          break

        case 'ArrowRight':
        case 'KeyD':
          _look(camera, 'lookRight', rightAmount ?? amount)
          break

        case 'ArrowUp':
        case 'KeyW':
          _look(camera, 'lookUp', upAmount ?? amount)
          break

        case 'ArrowDown':
        case 'KeyS':
          _look(camera, 'lookDown', downAmount ?? amount)
          break

        case 'KeyJ':
          _move(camera, 'moveLeft', leftMoveAmount ?? moveAmount)
          break

        case 'KeyL':
          _move(camera, 'moveRight', rightMoveAmount ?? moveAmount)
          break

        case 'KeyI':
          _move(camera, 'moveUp', upMoveAmount ?? moveAmount)
          break

        case 'KeyK':
          _move(camera, 'moveDown', downMoveAmount ?? moveAmount)
          break

        case 'KeyU':
          _move(camera, 'moveBackward', backwardMoveAmount ?? moveAmount)
          break

        case 'KeyM':
          _move(camera, 'moveForward', forwardMoveAmount ?? moveAmount)
          break

        // 水平向前移动
        case 'KeyO':
          moveHorizontal(camera, forwardMoveAmount ?? moveAmount)
          break

          // 水平向后移动
        case 'KeyP':
          moveHorizontal(camera, formatAmount(backwardMoveAmount ?? moveAmount))
          break
      }
    }

    function handleKeyup(e: KeyboardEvent) {
      callback?.(e, newViewer, camera)
    }

    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keyup', handleKeyup)

    onCleanup(() => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('keyup', handleKeyup)
    })
  })

  return { stop, _look, _move }
}

export function _look(camera: Camera, direction: LookDirection, amount: number) {
  const _amount = degreeToRadian(amount)

  camera[direction](_amount)
}

export function _move(camera: Camera, direction: MoveDirection, amount: number) {
  camera[direction](amount)
}

/**
 * @description 不管相机朝向什么方向，都要沿着水平方向移动，不是沿着镜头方向移动
 * @param camera
 * @param amount
 */
export function moveHorizontal(camera: Camera, amount: number) {
  // 思路：将相机的朝向向量 (direction) 投影到地表水平面上，得到一个纯水平的前进方向。
  //
  // 在椭球体（地球）上，任意一点的"上"方向就是该点位置向量的归一化结果，
  // 即椭球面法线。相机的 direction 可以分解为两个分量：
  //   direction = 水平分量 + 垂直分量
  // 其中垂直分量 = dot(direction, up) * up
  // 水平分量 = direction - 垂直分量
  //
  // 这样无论相机俯仰角（pitch）如何，移动方向始终平行于地表，
  // 不会因为低头看地面就往地下钻，也不会因为抬头看天就飞上去。

  // 1. 获取相机所在位置的椭球面法线，即局部"上"方向
  const up = Cartesian3.normalize(camera.position, new Cartesian3())

  // 2. 计算 direction 在 up 方向上的投影长度（标量）
  const dot = Cartesian3.dot(camera.direction, up)

  // 3. 得到 direction 的垂直分量向量：vertical = up * dot
  const vertical = Cartesian3.multiplyByScalar(up, dot, new Cartesian3())

  // 4. 从 direction 中减去垂直分量，剩下的就是水平分量
  const horizontal = Cartesian3.subtract(camera.direction, vertical, new Cartesian3())

  // 5. 归一化为单位向量，作为最终的移动方向
  Cartesian3.normalize(horizontal, horizontal)

  // 6. 沿水平方向移动指定距离
  camera.move(horizontal, amount)
}

function formatAmount(amount: number) {
  return isNegative(amount) ? amount : -amount
}

interface CruiseOptions {
  /** 航线坐标点 [经度, 纬度, 高度][] */
  coordinates: [number, number, number][]
  /** 巡航速度（米/秒），默认 50 */
  speed?: number
  /** 是否循环巡航，默认 false */
  loop?: boolean
  /** 相机摇摆角度（度），默认 1 */
  lookAmount?: number
  /** 每帧回调，progress 范围 0~1 */
  onUpdate?: (progress: number) => void
  /** 巡航完成回调 */
  onComplete?: () => void
  /** 巡航开始回调 */
  onStart?: () => void
}

/**
 * @description 根据给定的 kml 航线，视角沿着航线自动巡航，相机可以上下左右摇摆，但是不能离开航线
 */
export function useRouteCruise(viewer: ShallowRef<Viewer>, options: CruiseOptions) {
  const {
    coordinates,
    speed = 50,
    loop = false,
    lookAmount = 1,
    onUpdate,
    onComplete,
  } = options

  // 将经纬度坐标转换为 Cartesian3
  const positions = coordinates.map(([lng, lat, alt]) => Cartesian3.fromDegrees(lng, lat, alt))

  // 计算各段距离和总距离
  const segmentDistances: number[] = []
  let totalDistance = 0
  for (let i = 0; i < positions.length - 1; i++) {
    const d = Cartesian3.distance(positions[i], positions[i + 1])
    segmentDistances.push(d)
    totalDistance += d
  }

  // 累计距离，用于快速定位当前所在段
  const cumulativeDistances: number[] = [0]
  for (let i = 0; i < segmentDistances.length; i++) {
    cumulativeDistances.push(cumulativeDistances[i] + segmentDistances[i])
  }

  let traveledDistance = 0
  let lastTimestamp = 0
  let paused = false

  const stop = watch([viewer], ([newViewer], __, onCleanup) => {
    const camera = newViewer.camera
    const scene = newViewer.scene
    const controller = scene.screenSpaceCameraController

    // 禁用所有默认相机交互，防止用户移动离开航线
    controller.enableTranslate = false
    controller.enableZoom = false
    controller.enableRotate = false
    controller.enableTilt = false
    controller.enableLook = false

    // 设置初始位置
    camera.position = Cartesian3.clone(positions[0])

    // 设置初始朝向：面向下一个航点
    if (positions.length > 1) {
      const direction = Cartesian3.normalize(
        Cartesian3.subtract(positions[1], positions[0], new Cartesian3()),
        new Cartesian3(),
      )
      const localUp = Cartesian3.normalize(camera.position, new Cartesian3())
      const right = Cartesian3.normalize(
        Cartesian3.cross(direction, localUp, new Cartesian3()),
        new Cartesian3(),
      )

      camera.direction = direction
      camera.up = Cartesian3.normalize(
        Cartesian3.cross(right, direction, new Cartesian3()),
        new Cartesian3(),
      )
    }

    // 键盘控制视角摇摆（上下左右看，但不移动位置）
    function handleKeydown(e: KeyboardEvent) {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          _look(camera, 'lookLeft', lookAmount)
          break
        case 'ArrowRight':
        case 'KeyD':
          _look(camera, 'lookRight', lookAmount)
          break
        case 'ArrowUp':
        case 'KeyW':
          _look(camera, 'lookUp', lookAmount)
          break
        case 'ArrowDown':
        case 'KeyS':
          _look(camera, 'lookDown', lookAmount)
          break
      }
    }

    document.addEventListener('keydown', handleKeydown)

    // 使用 Cesium 的 preRender 事件驱动巡航动画
    const removeListener = scene.preRender.addEventListener(() => {
      if (paused) {
        lastTimestamp = 0
        return
      }

      const now = performance.now()
      if (lastTimestamp === 0) {
        lastTimestamp = now
        return
      }

      const deltaTime = (now - lastTimestamp) / 1000
      lastTimestamp = now
      traveledDistance += speed * deltaTime

      // 到达终点
      if (traveledDistance >= totalDistance) {
        if (loop) {
          traveledDistance %= totalDistance
        }
        else {
          paused = true
          camera.position = Cartesian3.clone(positions[positions.length - 1])
          onUpdate?.(1)
          onComplete?.()
          return
        }
      }

      // 定位当前所在段
      let segmentIndex = 0
      for (let i = 0; i < cumulativeDistances.length - 1; i++) {
        if (traveledDistance >= cumulativeDistances[i] && traveledDistance < cumulativeDistances[i + 1]) {
          segmentIndex = i
          break
        }
      }

      // 计算段内插值比例
      const segmentLength = segmentDistances[segmentIndex]
      const t = segmentLength > 0
        ? (traveledDistance - cumulativeDistances[segmentIndex]) / segmentLength
        : 0

      // 插值计算当前位置，锁定相机到航线上
      camera.position = Cartesian3.lerp(
        positions[segmentIndex],
        positions[segmentIndex + 1],
        t,
        new Cartesian3(),
      )

      onUpdate?.(traveledDistance / totalDistance)
    })

    const handler = moveAction(viewer.value, { lookAmount })

    onCleanup(() => {
      removeListener()
      document.removeEventListener('keydown', handleKeydown)
      handler.destroy()

      // 恢复默认相机控制
      controller.enableTranslate = true
      controller.enableZoom = true
      controller.enableRotate = true
      controller.enableTilt = true
      controller.enableLook = true
    })
  })

  function pause() {
    paused = true
  }

  function resume() {
    paused = false
  }

  return { stop, pause, resume }
}

function moveAction(viewer: Viewer, options: any) {
  const { scene, camera } = viewer
  const { lookAmount } = options

  // 使用 Cesium 的 ScreenSpaceEventHandler 处理鼠标拖拽摆动视角
  const handler = new ScreenSpaceEventHandler(scene.canvas)
  const lastPosition = new Cartesian2()
  let isDragging = false

  handler.setInputAction((event: { position: Cartesian2 }) => {
    isDragging = true
    Cartesian2.clone(event.position, lastPosition)
  }, ScreenSpaceEventType.LEFT_DOWN)

  handler.setInputAction((event: { endPosition: Cartesian2 }) => {
    if (!isDragging)
      return

    const deltaX = event.endPosition.x - lastPosition.x
    const deltaY = event.endPosition.y - lastPosition.y
    Cartesian2.clone(event.endPosition, lastPosition)

    // 水平拖拽 → 左右摆动，垂直拖拽 → 上下摆动
    if (deltaX !== 0) {
      _look(camera, deltaX < 0 ? 'lookLeft' : 'lookRight', Math.abs(deltaX) * lookAmount * 0.1)
    }
    if (deltaY !== 0) {
      _look(camera, deltaY < 0 ? 'lookUp' : 'lookDown', Math.abs(deltaY) * lookAmount * 0.1)
    }
  }, ScreenSpaceEventType.MOUSE_MOVE)

  handler.setInputAction(() => {
    isDragging = false
  }, ScreenSpaceEventType.LEFT_UP)

  return handler
}
