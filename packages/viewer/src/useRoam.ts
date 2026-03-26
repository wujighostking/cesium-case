import type { Viewer } from 'cesium'
import type { ShallowRef } from 'vue'
import { degreeToRadian, EMPTY_OBJECT } from 'utils'
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
}

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
    } = options || EMPTY_OBJECT

    const camera = newViewer.camera

    function lookLeft() {
      const _amount = degreeToRadian(leftAmount ?? amount)

      camera.lookLeft(_amount)
    }
    function lookRight() {
      const _amount = degreeToRadian(rightAmount ?? amount)

      camera.lookRight(_amount)
    }
    function lookUp() {
      const _amount = degreeToRadian(upAmount ?? amount)

      camera.lookUp(_amount)
    }
    function lookDown() {
      const _amount = degreeToRadian(downAmount ?? amount)

      camera.lookDown(_amount)
    }

    function moveLeft() {
      camera.moveLeft(leftMoveAmount ?? moveAmount)
    }
    function moveRight() {
      camera.moveRight(rightMoveAmount ?? moveAmount)
    }
    function moveUp() {
      camera.moveUp(upMoveAmount ?? moveAmount)
    }
    function moveDown() {
      camera.moveDown(downMoveAmount ?? moveAmount)
    }
    function moveBackward() {
      camera.moveBackward(backwardMoveAmount ?? moveAmount)
    }
    function moveForward() {
      camera.moveForward(forwardMoveAmount ?? moveAmount)
    }

    function handleArrowKeyup(e: KeyboardEvent) {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          lookLeft()
          break

        case 'ArrowRight':
        case 'KeyD':
          lookRight()
          break

        case 'ArrowUp':
        case 'KeyW':
          lookUp()
          break

        case 'ArrowDown':
        case 'KeyS':
          lookDown()
          break

        case 'KeyJ':
          moveLeft()
          break

        case 'KeyL':
          moveRight()
          break

        case 'KeyI':
          moveUp()
          break

        case 'KeyK':
          moveDown()
          break

        case 'KeyU':
          moveBackward()
          break

        case 'KeyM':
          moveForward()
          break
      }
    }

    document.addEventListener('keydown', handleArrowKeyup)

    onCleanup(() => {
      document.removeEventListener('keydown', handleArrowKeyup)
    })
  })

  return { stop }
}
