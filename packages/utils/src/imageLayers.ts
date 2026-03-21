import { ImageryLayer, UrlTemplateImageryProvider } from 'cesium'

type Options = UrlTemplateImageryProvider.ConstructorOptions

export function createImageryLayer(options: Options) {
  return new ImageryLayer(
    new UrlTemplateImageryProvider(options),
  )
}
