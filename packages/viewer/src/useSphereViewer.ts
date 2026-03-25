import type { ViewerConfig } from '@photo-sphere-viewer/core'
import type { useTemplateRef } from 'vue'
import { Viewer } from '@photo-sphere-viewer/core'
import { isElement, isString } from 'utils'
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

type Container = ReturnType<typeof useTemplateRef<HTMLElement>>
export type Options = Omit<ViewerConfig, 'container' | 'panorama'>

export function useSphereViewer(
  containerRef: Container,
  url: string,
  options?: Options,
) {
  const viewerInstance = shallowRef<Viewer>()

  onMounted(() => {
    if (!isString(containerRef.value) && !isElement(containerRef.value)) {
      throw new Error('containerRef must be a HTMLElement')
    }

    viewerInstance.value = new Viewer({
      container: containerRef.value,
      panorama: url,
      navbar: false,
      loadingTxt: '加载中...',

      ...options,
    })
  })

  onBeforeUnmount(() => {
    viewerInstance.value?.destroy()
  })

  return viewerInstance
}
