import type { Camera, Viewer } from 'cesium'
import type { ShallowRef } from 'vue'
import { Cartesian3 } from 'cesium'
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

type LookDirection = keyof Pick<Camera, 'lookLeft' | 'lookRight' | 'lookUp' | 'lookDown'>
type MoveDirection = keyof Pick<Camera, 'moveBackward' | 'moveDown' | 'moveForward' | 'moveLeft' | 'moveRight' | 'moveUp'>

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

    function _look(direction: LookDirection, amount: number) {
      const _amount = degreeToRadian(amount)

      camera[direction](_amount)

      callback?.(newViewer, camera)
    }

    function _move(direction: MoveDirection, amount: number) {
      camera[direction](amount)

      callback?.(newViewer, camera)
    }

    /**
     * @description 不管相机朝向什么方向，都要沿着水平方向移动，不是沿着镜头方向移动
     * @param amount
     */
    function moveHorizontal(amount: number) {
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

    function handleKeydown(e: KeyboardEvent) {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          _look('lookLeft', leftAmount ?? amount)
          break

        case 'ArrowRight':
        case 'KeyD':
          _look('lookRight', rightAmount ?? amount)
          break

        case 'ArrowUp':
        case 'KeyW':
          _look('lookUp', upAmount ?? amount)
          break

        case 'ArrowDown':
        case 'KeyS':
          _look('lookDown', downAmount ?? amount)
          break

        case 'KeyJ':
          _move('moveLeft', leftMoveAmount ?? moveAmount)
          break

        case 'KeyL':
          _move('moveRight', rightMoveAmount ?? moveAmount)
          break

        case 'KeyI':
          _move('moveUp', upMoveAmount ?? moveAmount)
          break

        case 'KeyK':
          _move('moveDown', downMoveAmount ?? moveAmount)
          break

        case 'KeyU':
          _move('moveBackward', backwardMoveAmount ?? moveAmount)
          break

        case 'KeyM':
          _move('moveForward', forwardMoveAmount ?? moveAmount)
          break

        // 水平向前移动
        case 'KeyO':
          moveHorizontal(forwardMoveAmount ?? moveAmount)
          break

          // 水平向后移动
        case 'KeyP':
          moveHorizontal(formatAmount(backwardMoveAmount ?? moveAmount))
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

  return { stop }
}

function formatAmount(amount: number) {
  return isNegative(amount) ? amount : -amount
}
