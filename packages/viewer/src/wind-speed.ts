import type { ShallowRef } from 'vue'
import { Viewer } from 'cesium'
import { watch } from 'vue'
import Windy from './js/Windy.js'

export function useWindSpeed(viewer: ShallowRef<Viewer>, windData: ShallowRef<object>) {
  let windy: Windy

  const watchHandle = watch(() => [viewer.value, windData.value], (newValue) => {
    const [viewer, windData] = newValue

    if (viewer instanceof Viewer) {
      windy = new Windy(windData, viewer)
    }
  })

  // 开始渲染风向的监听
  const startWind = () => {
    viewer.value.clock.onTick.addEventListener(renderWind)
  }

  function renderWind() {
    // 每一帧监听渲染风向的动画
    windy.animate()
  }

  // 停止风向渲染
  const stopWind = () => {
    // 移除每一帧的监听事件方法
    viewer.value.clock.onTick.removeEventListener(renderWind)
    // 销毁风向实例
    windy.destroy()
  }

  return { ...watchHandle, startWind, stopWind }
}
