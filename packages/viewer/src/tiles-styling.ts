import type { Viewer } from 'cesium'
import type { Ref, ShallowRef } from 'vue'
import { Cesium3DTileset, Cesium3DTileStyle } from 'cesium'
import { shallowRef, watch } from 'vue'

interface Options {
  url: string
  cesium3DTileStyle?: Cesium3DTileStyle | object
}

export function use3DTilesStyling(viewer: ShallowRef<Viewer>, options: Ref<Options> | ShallowRef<Options>) {
  const _tileset = shallowRef<Cesium3DTileset | null>(null)

  const watchHandle = watch([viewer, options], async (newValue) => {
    const [viewer, options] = newValue

    const { url, cesium3DTileStyle } = options

    try {
      const tileset = await Cesium3DTileset.fromUrl(url)

      viewer?.scene.primitives.add(tileset)
      viewer?.zoomTo(tileset)
      _tileset.value = tileset

      if (cesium3DTileStyle) {
        if (cesium3DTileStyle instanceof Cesium3DTileStyle) {
          tileset.style = cesium3DTileStyle
        }
        else {
          tileset.style = new Cesium3DTileStyle({
            ...cesium3DTileStyle,
          })
        }
      }
    }
    catch (error) {
      console.error('Error:', error)
    }
  }, { deep: true })

  return { ...watchHandle, tileset: _tileset }
}
