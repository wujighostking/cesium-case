import type { Entity, HeadingPitchRange, ModelGraphics, Viewer } from 'cesium'
import type { ShallowRef, WatchHandle } from 'vue'
import {
  Cartesian3,
  Cartographic,
  Cesium3DTileset,
  Math as CesiumMath,
  HeadingPitchRoll,
  Matrix3,
  Matrix4,
  Quaternion,
  Transforms,
} from 'cesium'
import { EMPTY_OBJECT, getFileExtension } from 'utils'
import { watch } from 'vue'

interface GlbOptions extends Partial<Omit<ModelGraphics, 'uri'>> {
  name?: string
  position?: Cartesian3
  callback?: (entity: Entity) => void
}

interface TilesetTransformOptions {
  longitude?: number
  latitude?: number
  heightOffset?: number
  heading?: number
  pitch?: number
  roll?: number
}

interface TilesetOptions {
  adjustOptions?: TilesetTransformOptions
  tilesetOptions?: Cesium3DTileset.ConstructorOptions
  offset?: HeadingPitchRange
  callback?: (tileset: Cesium3DTileset) => void
}

type GlbUrl = `${string}.glb` | `${string}.gltf`

export function useModels(viewer: ShallowRef<Viewer>, url: GlbUrl, options?: GlbOptions): WatchHandle
export function useModels(viewer: ShallowRef<Viewer>, url: string, options?: TilesetOptions): WatchHandle
export function useModels(
  viewer: ShallowRef<Viewer>,
  url: string,
  options?: GlbOptions | TilesetOptions,
): WatchHandle {
  const fileExtension = getFileExtension(url)

  if (fileExtension === '.glb' || fileExtension === '.gltf') {
    return useGlb(viewer, url, options as GlbOptions)
  }

  // fileExtension === '.json'
  return use3dTiles(viewer, url, options as TilesetOptions)
}

function useGlb(viewer: ShallowRef<Viewer>, url: string, options?: GlbOptions): WatchHandle {
  const { name = url, position = Cartesian3.ZERO, callback, ...entityOptions } = options ?? EMPTY_OBJECT
  return watch(viewer, () => {
    const entity = viewer.value.entities.add({
      name,
      position,
      model: {
        uri: url,
        ...entityOptions,
      },
    })

    viewer.value.zoomTo(entity)

    callback?.(entity)
  })
}

function use3dTiles(viewer: ShallowRef<Viewer>, url: string, options?: TilesetOptions): WatchHandle {
  const { adjustOptions, tilesetOptions, offset, callback } = options ?? EMPTY_OBJECT

  const tilesetPromise = Cesium3DTileset.fromUrl(url, tilesetOptions)

  return watch(viewer, () => {
    tilesetPromise
      .then((tileset) => {
        viewer.value.scene.primitives.add(tileset)
        adjustTileset(tileset, adjustOptions ?? EMPTY_OBJECT)
        viewer.value.zoomTo(tileset, offset)

        callback?.(tileset)
      })
      .catch((error) => {
        console.error(error)
      })
  })
}

/**
 * Move and rotate 3D Tiles with degree-based heading/pitch/roll.
 */
function adjustTileset(tileset: Cesium3DTileset, options: TilesetTransformOptions) {
  // 1. 获取当前模型的中心点
  const centerCartesian = tileset.boundingSphere.center
  const centerCartographic = Cartographic.fromCartesian(centerCartesian)

  // 2. 使用经纬度和高度构建目标位置的笛卡尔坐标
  const targetCartesian = Cartesian3.fromDegrees(
    options.longitude ?? centerCartographic.longitude,
    options.latitude ?? centerCartographic.latitude,
    options.heightOffset ?? centerCartographic.height,
  )

  // 3. 计算当前模型中心点的东-北-天坐标系转换矩阵及其逆矩阵
  const currentEnu = Transforms.eastNorthUpToFixedFrame(centerCartesian)
  const inverseCurrentEnu = Matrix4.inverse(currentEnu, new Matrix4())

  // 4. 从当前模型矩阵中提取旋转部分，并转换为当前 ENU 坐标系下的 HPR 角度
  const localMatrix = Matrix4.multiply(inverseCurrentEnu, tileset.modelMatrix, new Matrix4())
  const currentHPR = HeadingPitchRoll.fromQuaternion(
    Quaternion.fromRotationMatrix(Matrix4.getMatrix3(localMatrix, new Matrix3())),
  )

  // 5. 根据输入的 heading/pitch/roll（如果提供）或当前模型的 HPR 角度，构建新的 HPR 角度
  const hpr = new HeadingPitchRoll(
    options.heading !== undefined ? CesiumMath.toRadians(options.heading) : currentHPR.heading,
    options.pitch !== undefined ? CesiumMath.toRadians(options.pitch) : currentHPR.pitch,
    options.roll !== undefined ? CesiumMath.toRadians(options.roll) : currentHPR.roll,
  )

  // 6. 使用目标位置和新的 HPR 角度构建新的模型矩阵，并应用到 tileset 上
  const targetTransform = Transforms.headingPitchRollToFixedFrame(targetCartesian, hpr)
  tileset.modelMatrix = Matrix4.multiply(targetTransform, inverseCurrentEnu, new Matrix4())
}
